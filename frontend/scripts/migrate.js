import pg from 'pg';
const { Pool } = pg;

// Create a new pool with direct connection string
const pool = new Pool({
  connectionString: 'postgresql://skillment_owner:npg_RcY0gG1NmCwE@ep-steep-mud-a83oh26p-pooler.eastus2.azure.neon.tech/skillment?sslmode=require',
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Testing database connection...');
    // Test connection first
    await client.query('SELECT 1');
    console.log('✓ Database connection successful\n');

    // Create users table
    console.log('Creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        org_name VARCHAR(255),
        org_type VARCHAR(50),
        org_size VARCHAR(50),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Users table created/verified');

    // Create sessions table
    console.log('\nCreating sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Sessions table created/verified');

    // Create verification_tokens table
    console.log('\nCreating verification_tokens table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Verification tokens table created/verified');

    console.log('\nMigration completed successfully! 🎉');
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration(); 
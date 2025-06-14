import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';

// Create a new client with direct connection string
const neonClient = neon('postgresql://skillment_owner:npg_RcY0gG1NmCwE@ep-steep-mud-a83oh26p-pooler.eastus2.azure.neon.tech/skillment?sslmode=require');

// Initialize Drizzle ORM
const db = drizzle(neonClient);

async function runMigration() {
  try {
    console.log('Testing database connection...');
    // Test connection first
    await db.execute(sql`SELECT 1`);
    console.log('✓ Database connection successful\n');

    // Create users table
    console.log('Creating users table...');
    await db.execute(sql`
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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Sessions table created/verified');

    // Create verification_tokens table
    console.log('\nCreating verification_tokens table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✓ Verification tokens table created/verified');

    // Create indexes
    console.log('\nCreating indexes...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id)`);
    console.log('✓ Indexes created/verified');

    console.log('\nMigration completed successfully! 🎉');
  } catch (error) {
    console.error('\nMigration failed:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause.message);
    }
    process.exit(1);
  }
}

runMigration(); 
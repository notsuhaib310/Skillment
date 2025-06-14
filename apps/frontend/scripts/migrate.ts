import { db, testConnection } from "../lib/db.js"
import { sql } from "drizzle-orm"

async function main() {
  console.log("Testing database connection...")
  
  const isConnected = await testConnection()
  if (!isConnected) {
    console.error("Failed to connect to the database. Please check your DATABASE_URL environment variable.")
    process.exit(1)
  }

  console.log("Running migrations...")

  try {
    // Create users table if it doesn't exist
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
    `)
    console.log("✓ Users table created/verified")

    // Create sessions table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log("✓ Sessions table created/verified")

    // Create verification_tokens table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        token TEXT NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)
    console.log("✓ Verification tokens table created/verified")

    console.log("Migrations completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error)
  process.exit(1)
})

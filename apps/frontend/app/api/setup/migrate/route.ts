import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST() {
  try {
    // Create users table
    await executeQuery(`
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
      )
    `)

    // Create sessions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create verification_tokens table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create indexes
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token)`)
    await executeQuery(`CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON verification_tokens(user_id)`)

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
    })
  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json({
      success: false,
      error: error.message || "Migration failed",
    })
  }
}

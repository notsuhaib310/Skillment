import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL)

// Initialize Drizzle ORM
export const db = drizzle(sql)

// Helper function for raw SQL queries when needed
export async function executeQuery(query: string, params: any[] = []) {
  try {
    return await sql(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`
    console.log("Database connection successful:", result)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

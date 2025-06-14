import { db } from "./db"
import { users, sessions } from "./schema"
import { eq } from "drizzle-orm"

// Server-only crypto operations
async function hashPassword(password: string): Promise<string> {
  const { randomBytes, pbkdf2Sync } = await import("crypto")
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const { pbkdf2Sync } = await import("crypto")
  const [salt, hash] = storedHash.split(":")
  if (!salt || !hash) {
    throw new Error("Invalid password hash format")
  }
  const calculatedHash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex")
  return hash === calculatedHash
}

async function generateToken(): Promise<string> {
  const { randomBytes } = await import("crypto")
  return randomBytes(32).toString("hex")
}

export class AuthService {
  // Register a new user
  static async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    orgName?: string
    orgType?: string
    orgSize?: string
  }) {
    const { firstName, lastName, email, password, orgName, orgType, orgSize } = userData

    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

      if (existingUser.length > 0) {
        throw new Error("User with this email already exists")
      }

      // Hash password
      const passwordHash = await hashPassword(password)

      // Create user
      const result = await db
        .insert(users)
        .values({
          first_name: firstName,
          last_name: lastName,
          email,
          password_hash: passwordHash,
          org_name: orgName,
          org_type: orgType,
          org_size: orgSize,
        })
        .returning({ id: users.id })

      return result[0]
    } catch (error: any) {
      console.error("Registration error:", error)
      if (error.message.includes("duplicate key")) {
        throw new Error("User with this email already exists")
      }
      throw error
    }
  }

  // Login user
  static async login(email: string, password: string) {
    try {
      // Find user
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1)

      if (user.length === 0) {
        throw new Error("Invalid email or password")
      }

      // Verify password
      const isValid = await verifyPassword(password, user[0].password_hash)

      if (!isValid) {
        throw new Error("Invalid email or password")
      }

      // Generate session token
      const token = await generateToken()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // Token expires in 7 days

      // Create session
      await db.insert(sessions).values({
        user_id: user[0].id,
        token,
        expires_at: expiresAt,
      })

      return {
        user: {
          id: user[0].id,
          firstName: user[0].first_name,
          lastName: user[0].last_name,
          email: user[0].email,
          role: user[0].role,
          orgName: user[0].org_name,
        },
        token,
        expiresAt,
      }
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Verify session
  static async verifySession(token: string) {
    try {
      const session = await db
        .select({
          id: sessions.id,
          userId: sessions.user_id,
          expiresAt: sessions.expires_at,
        })
        .from(sessions)
        .where(eq(sessions.token, token))
        .limit(1)

      if (session.length === 0) {
        return null
      }

      // Check if session is expired
      if (new Date() > session[0].expiresAt) {
        await db.delete(sessions).where(eq(sessions.id, session[0].id))
        return null
      }

      // Get user
      const user = await db.select().from(users).where(eq(users.id, session[0].userId)).limit(1)

      if (user.length === 0) {
        return null
      }

      return {
        user: {
          id: user[0].id,
          firstName: user[0].first_name,
          lastName: user[0].last_name,
          email: user[0].email,
          role: user[0].role,
          orgName: user[0].org_name,
        },
        expiresAt: session[0].expiresAt,
      }
    } catch (error: any) {
      console.error("Session verification error:", error)
      return null
    }
  }

  // Logout user
  static async logout(token: string) {
    try {
      await db.delete(sessions).where(eq(sessions.token, token))
      return true
    } catch (error: any) {
      console.error("Logout error:", error)
      throw error
    }
  }
}

import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  orgName: varchar("org_name", { length: 255 }),
  orgType: varchar("org_type", { length: 50 }),
  orgSize: varchar("org_size", { length: 50 }),
  emailVerified: boolean("email_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'email', 'password-reset', etc.
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})

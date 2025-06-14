import { pgTable, serial, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  first_name: varchar("first_name", { length: 255 }).notNull(),
  last_name: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  org_name: varchar("org_name", { length: 255 }),
  org_type: varchar("org_type", { length: 50 }),
  org_size: varchar("org_size", { length: 50 }),
  email_verified: boolean("email_verified").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
})

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  user_id: serial("user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
})

export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  user_id: serial("user_id").references(() => users.id),
  token: text("token").notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // 'email', 'password-reset', etc.
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
})

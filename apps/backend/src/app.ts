import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from "./routes/auth"
import userRoutes from "./routes/user.routes"
import participantsRoutes from "./routes/participants"
import teamRoutes from "./routes/team"
import assessmentRoutes from "./routes/assessment.routes"
import emailRoutes from "./routes/email.routes"
import { PrismaClient } from "@prisma/client"

const app = express()
const prisma = new PrismaClient()

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    /^http:\/\/([a-z0-9-]+\.)*localhost:3001$/, // Allow subdomains of localhost:3001
    'https://app.skillment.in',
    /^https:\/\/([a-z0-9-]+\.)*skillment\.in$/, // Allow subdomains of skillment.in
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Add PATCH
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/participants", participantsRoutes)
app.use("/api/team", teamRoutes)
app.use("/api/assessments", assessmentRoutes)
// app.use("/api/email", emailRoutes) // Removed to prevent double-mounting and global auth issues

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal server error"
  res.status(statusCode).json({
    success: false,
    message,
  })
})

export { app, prisma } 
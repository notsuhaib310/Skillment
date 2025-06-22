import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from "./routes/auth"
import participantsRoutes from "./routes/participants"
import teamRoutes from "./routes/team"
import assessmentRoutes from "./routes/assessment.routes"
import { PrismaClient } from "@prisma/client"

const app = express()
const prisma = new PrismaClient()

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://kd.localhost:3001',
    'http://kingboi.localhost:3001',
    'http://*.localhost:3001',
    'https://app.skillment.in',
    'https://*.skillment.in'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Middleware
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/participants", participantsRoutes)
app.use("/api/team", teamRoutes)
app.use("/api/assessments", assessmentRoutes)

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
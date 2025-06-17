import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth"
import participantsRoutes from "./routes/participants"
import { PrismaClient } from "@prisma/client"
import { CORS_OPTIONS } from "./config/constants"

const app = express()
const prisma = new PrismaClient()

// CORS configuration - must be before other middleware
app.use(cors(CORS_OPTIONS))

// Middleware
app.use(express.json())
app.use(cookieParser())

// Handle preflight requests
app.options('*', cors(CORS_OPTIONS))

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://app.skillment.in');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/participants", participantsRoutes)

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
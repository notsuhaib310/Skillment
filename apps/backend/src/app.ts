import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth"
import participantsRoutes from "./routes/participants"
import { PrismaClient } from "@prisma/client"

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

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
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { AppError } from "./errorHandler"

const prisma = new PrismaClient()

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: string
        orgName: string
      }
    }
  }
}

interface SessionWithUser {
  id: string
  userId: string
  token: string
  createdAt: Date
  expiresAt: Date | null
  user: {
    id: string
    email: string
    role: string
    organization: {
      name: string
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(401, "No token provided")
    }

    const token = authHeader.split(" ")[1]
    if (!token) {
      throw new AppError(401, "No token provided")
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
      ) as {
        userId: string
        orgName: string
      }

      // Verify session in database
      const session = await prisma.session.findFirst({
        where: {
          userId: decoded.userId,
          token,
          OR: [
            {
              expiresAt: {
                gt: new Date()
              }
            },
            {
              expiresAt: null
            }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              organization: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })

      if (!session) {
        throw new AppError(401, "Invalid session")
      }

      if (!session.user?.organization) {
        throw new AppError(401, "Organization not found")
      }

      // Verify that the organization name in token matches the one in database
      if (decoded.orgName !== session.user.organization.name) {
        throw new AppError(401, "Organization mismatch")
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        orgName: session.user.organization.name
      }
      
      next()
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new AppError(401, "Invalid token")
      }
      throw jwtError
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, "Invalid token"))
    } else if (error instanceof AppError) {
      next(error)
    } else {
      next(new AppError(500, "Internal server error"))
    }
  }
} 
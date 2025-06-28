import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        orgId: string;
        orgName: string;
      };
      orgId?: string;
      orgName?: string;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Always allow public access to candidate login
  if (req.originalUrl.endsWith('/api/candidates/login')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export const authenticateOld = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production') as {
        userId: string;
        orgId: string;
        orgName: string;
      };

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
              orgId: true,
              organization: {
                select: {
                  name: true,
                  id: true
                }
              }
            }
          }
        }
      });

      if (!session) {
        console.log('Session not found for token:', { userId: decoded.userId, tokenExists: !!token });
        throw new AppError(401, 'Invalid session - please log in again');
      }

      if (!session.user?.organization) {
        console.log('User organization not found:', { userId: decoded.userId });
        throw new AppError(401, 'Organization not found');
      }

      // Verify that the organization id and name in token matches the one in database
      if (decoded.orgId !== session.user.organization.id || decoded.orgName !== session.user.organization.name) {
        console.log('Organization mismatch:', { 
          tokenOrgId: decoded.orgId, 
          dbOrgId: session.user.organization.id,
          tokenOrgName: decoded.orgName,
          dbOrgName: session.user.organization.name
        });
        throw new AppError(401, 'Organization mismatch - please log in again');
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        orgId: session.user.organization.id,
        orgName: session.user.organization.name
      };
      req.orgId = session.user.organization.id;
      req.orgName = session.user.organization.name;
      
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        console.log('JWT verification failed:', jwtError.message);
        throw new AppError(401, 'Invalid token - please log in again');
      }
      if (jwtError instanceof jwt.TokenExpiredError) {
        console.log('Token expired for user');
        throw new AppError(401, 'Token expired - please log in again');
      }
      throw jwtError;
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token - please log in again'));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      console.error('Authentication error:', error);
      next(new AppError(500, 'Internal server error'));
    }
  }
}; 
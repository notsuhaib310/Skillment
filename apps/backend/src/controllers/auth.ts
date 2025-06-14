import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';
const TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

// Register a new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, orgName, orgType, orgSize } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        orgName,
        orgType,
        orgSize,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      domain: '.localhost',
      path: '/',
      maxAge: TOKEN_EXPIRY * 1000, // Convert seconds to milliseconds
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        orgName: user.orgName,
        orgType: user.orgType,
        orgSize: user.orgSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Set cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      domain: '.localhost',
      path: '/',
      maxAge: TOKEN_EXPIRY * 1000, // Convert seconds to milliseconds
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        orgName: user.orgName,
        orgType: user.orgType,
        orgSize: user.orgSize,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout user
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;

    if (token) {
      await prisma.session.delete({
        where: { token },
      });
    }

    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      domain: '.localhost',
      path: '/',
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Verify session
export const verifySession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.auth_token;

    if (!token) {
      throw new AppError(401, 'No session found');
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Find session
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: { user: true },
    });

    if (!session) {
      throw new AppError(401, 'Session expired');
    }

    res.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        orgName: session.user.orgName,
        orgType: session.user.orgType,
        orgSize: session.user.orgSize,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
}; 
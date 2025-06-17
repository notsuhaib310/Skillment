import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  orgName: z.string().min(1),
  orgType: z.string().min(1),
  orgSize: z.string().min(1),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);
      const { email, password, firstName, lastName, orgName, orgType, orgSize } = validatedData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Check if organization name is already taken
      const existingOrg = await prisma.user.findFirst({
        where: { orgName }
      });

      if (existingOrg) {
        return res.status(400).json({ message: 'Organization name is already taken' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user with organization details
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          orgName,
          orgType,
          orgSize,
          role: 'admin' // First user of an organization is an admin
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          orgName: user.orgName,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      // Return user data and token
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          orgName: user.orgName,
          role: user.role
        },
        token,
        redirectUrl: `https://${orgName.toLowerCase()}.skillment.in/login`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      console.error('Error in register:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password, orgName } = req.body;

      // Find user
      const user = await prisma.user.findFirst({
        where: { 
          email,
          orgName: orgName || undefined // If orgName is provided, filter by it
        }
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          orgName: user.orgName,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });

      // Return user data and token
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          orgName: user.orgName,
          role: user.role
        },
        token,
        redirectUrl: `https://${user.orgName?.toLowerCase()}.skillment.in/dashboard`
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async logout(_req: Request, res: Response) {
    try {
      // Since we're using JWT, we don't need to do anything server-side
      // The client should remove the token
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error in logout:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
} 
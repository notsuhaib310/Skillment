import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  orgName: z.string().min(2).regex(/^[a-zA-Z0-9-]+$/, 'Organization name can only contain letters, numbers, and hyphens'),
  orgType: z.string(),
  orgSize: z.string(),
});

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Check if organization name is taken
      const existingOrg = await prisma.organization.findFirst({
        where: { name: validatedData.orgName },
      });

      if (existingOrg) {
        return res.status(400).json({ error: 'Organization name is already taken' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create organization first
      const organization = await prisma.organization.create({
        data: {
          name: validatedData.orgName,
          type: validatedData.orgType,
          size: validatedData.orgSize,
        },
      });

      // Create user with organization
      const user = await prisma.user.create({
        data: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          password: hashedPassword,
          orgId: organization.id,
          role: 'admin', // First user of an organization is an admin
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          orgName: organization.name,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          orgName: organization.name,
        },
        redirectUrl: `https://${organization.name}.skillment.in/dashboard`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error('Registration error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find user with organization
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          organization: true,
        },
      });

      if (!user || !user.organization) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          orgName: user.organization.name,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create or update session
      const session = await prisma.session.upsert({
        where: {
          userId_token: {
            userId: user.id,
            token,
          },
        },
        create: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        update: {
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          orgName: user.organization.name,
        },
        redirectUrl: `https://${user.organization.name}.skillment.in/dashboard`,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
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
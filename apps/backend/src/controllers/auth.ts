import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_ELITE_PLAN_ID = process.env.RAZORPAY_ELITE_PLAN_ID;

// Updated validation schema for registration with subscription support
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().min(8),
  gender: z.string(),
  orgName: z.string().min(2).regex(/^[a-zA-Z0-9-]+$/, 'Organization name can only contain letters, numbers, and hyphens'),
  orgType: z.string(),
  orgSize: z.string(),
  plan: z.enum(['free', 'elite']),
  termsAccepted: z.boolean(),
  newsletterOptIn: z.boolean().optional(),
  // Subscription fields instead of one-time payment
  razorpaySubscriptionId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
});

export class AuthController {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID!,
      key_secret: RAZORPAY_KEY_SECRET!,
    });
  }

  async register(req: Request, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingUser) {
        return res.status(400).json({ 
          error: 'User already exists',
          code: 'USER_EXISTS'
        });
      }

      // Check if organization name is taken
      const existingOrg = await prisma.organization.findFirst({
        where: { name: validatedData.orgName.toLowerCase() },
      });
      if (existingOrg) {
        return res.status(400).json({ 
          error: 'Organization name is already taken',
          code: 'ORG_NAME_TAKEN'
        });
      }

      // If plan is elite, verify Razorpay subscription and payment
      if (validatedData.plan === 'elite') {
        if (!validatedData.razorpaySubscriptionId || !validatedData.razorpayPaymentId || !validatedData.razorpaySignature) {
          return res.status(400).json({ error: 'Subscription verification required for Elite plan' });
        }
        // Verify signature
        const generatedSignature = crypto
          .createHmac('sha256', RAZORPAY_KEY_SECRET!)
          .update(validatedData.razorpayPaymentId + '|' + validatedData.razorpaySubscriptionId)
          .digest('hex');
        if (generatedSignature !== validatedData.razorpaySignature) {
          return res.status(400).json({ error: 'Invalid subscription signature' });
        }
        // Fetch subscription details from Razorpay to confirm it's active
        const subscription = await this.razorpay.subscriptions.fetch(validatedData.razorpaySubscriptionId);
        if (subscription.status !== 'active' && subscription.status !== 'authenticated') {
          return res.status(400).json({ error: 'Subscription is not active. Please complete payment.' });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create organization first
      const organization = await prisma.organization.create({
        data: {
          name: validatedData.orgName.toLowerCase(),
          type: validatedData.orgType,
          size: validatedData.orgSize,
          plan: validatedData.plan,
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
          role: 'admin',
        },
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          orgId: organization.id,
          orgName: organization.name,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create session
      await prisma.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          orgName: organization.name,
          role: user.role,
        },
        organization: {
          id: organization.id,
          name: organization.name,
          plan: organization.plan,
        },
        redirectUrl: `https://${organization.name}.skillment.in/dashboard`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: error.errors[0].message,
          code: 'VALIDATION_ERROR',
          details: error.errors
        });
      }
      console.error('Registration error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password, organization } = req.body;

      if (!email || !password || !organization) {
        return res.status(400).json({ 
          error: 'Email, password, and organization are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Find user with organization
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          organization: true,
        },
      });

      if (!user || !user.organization) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Verify that the user belongs to the specified organization
      if (user.organization.name.toLowerCase() !== organization.toLowerCase()) {
        return res.status(403).json({ 
          error: 'Access denied. You do not have permission to access this organization.',
          code: 'ORGANIZATION_ACCESS_DENIED'
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          orgId: user.organization.id,
          orgName: user.organization.name,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create or update session
      await prisma.session.upsert({
        where: {
          userId_token: {
            userId: user.id,
            token,
          },
        },
        create: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
        update: {
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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
          role: user.role,
        },
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          plan: user.organization.plan,
        },
        redirectUrl: `https://${user.organization.name}.skillment.in/dashboard`,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        // Invalidate the session
        await prisma.session.deleteMany({
          where: { token },
        });
      }

      res.json({ 
        success: true,
        message: 'Logged out successfully' 
      });
    } catch (error) {
      console.error('Error in logout:', error);
      res.status(500).json({ 
        error: 'Server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // Create Elite subscription (replaces createEliteOrder)
  async createEliteSubscription(req: Request, res: Response) {
    try {
      const { customerEmail, customerName, customerPhone } = req.body;

      if (!customerEmail || !customerName || !customerPhone) {
        return res.status(400).json({ 
          error: 'Customer details are required',
          code: 'MISSING_CUSTOMER_DETAILS'
        });
      }

      // Create customer first
      const customer = await this.razorpay.customers.create({
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      });

      // Create subscription
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: RAZORPAY_ELITE_PLAN_ID!,
        total_count: 12,
        quantity: 1,
        notes: {
          plan: 'elite',
          email: customerEmail,
          name: customerName,
        },
        notify_info: {
          notify_phone: customerPhone,
          notify_email: customerEmail,
        },
      });

      return res.status(200).json({
        success: true,
        subscription,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        }
      });
    } catch (error: any) {
      console.error('Razorpay subscription creation error:', error);
      return res.status(500).json({ 
        error: 'Failed to create subscription',
        code: 'SUBSCRIPTION_CREATION_FAILED',
        details: error.message 
      });
    }
  }

  // Webhook handler for subscription events
  async handleSubscriptionWebhook(req: Request, res: Response) {
    try {
      const webhookSignature = req.headers['x-razorpay-signature'] as string;
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error('Webhook secret not configured');
        return res.status(500).json({ error: 'Webhook not configured' });
      }

      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (webhookSignature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const event = req.body;
      const { event: eventType, payload } = event;

      switch (eventType) {
        case 'subscription.activated':
          await this.handleSubscriptionActivated(payload.subscription.entity);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(payload.subscription.entity);
          break;
        case 'subscription.completed':
          await this.handleSubscriptionCompleted(payload.subscription.entity);
          break;
        case 'subscription.charged':
          await this.handleSubscriptionCharged(payload.payment.entity, payload.subscription.entity);
          break;
        case 'subscription.halted':
          await this.handleSubscriptionHalted(payload.subscription.entity);
          break;
        default:
          console.log(`Unhandled webhook event: ${eventType}`);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook handling error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  private async handleSubscriptionActivated(subscription: any) {
    try {
      await prisma.organization.updateMany({
        where: { subscriptionId: subscription.id },
        data: { 
          plan: 'elite'
        },
      });
      console.log(`Subscription activated: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription activation:', error);
    }
  }

  private async handleSubscriptionCancelled(subscription: any) {
    try {
      await prisma.organization.updateMany({
        where: { subscriptionId: subscription.id },
        data: { 
          plan: 'free' // Downgrade to free plan
        },
      });
      console.log(`Subscription cancelled: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
    }
  }

  private async handleSubscriptionCompleted(subscription: any) {
    try {
      await prisma.organization.updateMany({
        where: { subscriptionId: subscription.id },
        data: { },
      });
      console.log(`Subscription completed: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription completion:', error);
    }
  }

  private async handleSubscriptionCharged(payment: any, subscription: any) {
    try {
      // Log successful payment
      console.log(`Subscription charged: ${subscription.id}, Payment: ${payment.id}`);
      
      // You can store payment records here if needed
      // await prisma.payment.create({...})
      
    } catch (error) {
      console.error('Error handling subscription charge:', error);
    }
  }

  private async handleSubscriptionHalted(subscription: any) {
    try {
      await prisma.organization.updateMany({
        where: { subscriptionId: subscription.id },
        data: { 
          plan: 'free' // Temporarily downgrade to free
        },
      });
      console.log(`Subscription halted: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription halt:', error);
    }
  }

  // Get subscription status
  async getSubscriptionStatus(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;

      if (!subscriptionId) {
        return res.status(400).json({ 
          error: 'Subscription ID is required',
          code: 'MISSING_SUBSCRIPTION_ID'
        });
      }

      const subscription = await this.razorpay.subscriptions.fetch(subscriptionId);
      
      return res.status(200).json({
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_start: subscription.current_start,
          current_end: subscription.current_end,
          charge_at: subscription.charge_at,
          plan_id: subscription.plan_id,
        }
      });
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch subscription status',
        code: 'SUBSCRIPTION_FETCH_FAILED',
        details: error.message 
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(req: Request, res: Response) {
    try {
      const { subscriptionId } = req.params;
      const { cancel_at_cycle_end = true } = req.body;

      if (!subscriptionId) {
        return res.status(400).json({ 
          error: 'Subscription ID is required',
          code: 'MISSING_SUBSCRIPTION_ID'
        });
      }

      const subscription = await this.razorpay.subscriptions.cancel(subscriptionId, cancel_at_cycle_end);
      
      // Update organization status
      await prisma.organization.updateMany({
        where: { subscriptionId },
        data: { 
          plan: cancel_at_cycle_end ? 'elite' : 'free'
        },
      });

      return res.status(200).json({
        success: true,
        message: cancel_at_cycle_end 
          ? 'Subscription will be cancelled at the end of current billing cycle'
          : 'Subscription cancelled immediately',
        subscription: {
          id: subscription.id,
          status: subscription.status,
        }
      });
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({ 
        error: 'Failed to cancel subscription',
        code: 'SUBSCRIPTION_CANCEL_FAILED',
        details: error.message 
      });
    }
  }
}

// Export singleton instance
export const authController = new AuthController();
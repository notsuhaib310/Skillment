import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_ELITE_PLAN_ID = process.env.RAZORPAY_ELITE_PLAN_ID;

export class BillingController {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID!,
      key_secret: RAZORPAY_KEY_SECRET!,
    });
  }

  // Get billing data for the current organization
  async getBillingData(req: Request, res: Response) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        return res.status(401).json({ error: 'Organization not found' });
      }

      // Get organization with current plan
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          users: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Get usage statistics - get user IDs first, then count assessments
      const userIds = organization.users.map(user => user.id);
      
      const assessmentsCount = await prisma.assessment.count({
        where: { 
          createdById: { in: userIds }
        },
      });

      const participantsCount = await prisma.participant.count({
        where: { 
          organization: organization.name
        },
      });

      // Mock usage data based on plan
      const usageData = this.getUsageData(organization.plan, assessmentsCount, participantsCount);

      // Get plan details
      const planData = this.getPlanData(organization.plan);

      // Mock payment method (in real implementation, this would come from a payment provider)
      const paymentMethod = {
        type: 'none',
        last4: '',
        expiryMonth: '',
        expiryYear: '',
      };

      // Mock invoices (in real implementation, this would come from a payment provider)
      const invoices: any[] = [];

      const billingData = {
        plan: planData,
        usage: usageData,
        paymentMethod,
        invoices,
      };

      return res.status(200).json(billingData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      return res.status(500).json({ error: 'Failed to fetch billing data' });
    }
  }

  // Create upgrade subscription for existing organization
  async createUpgradeSubscription(req: Request, res: Response) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        return res.status(401).json({ error: 'Organization not found' });
      }

      const { 
        customerEmail, 
        customerName, 
        customerPhone,
        razorpaySubscriptionId,
        razorpayPaymentId,
        razorpaySignature
      } = req.body;

      if (!customerEmail || !customerName || !customerPhone) {
        return res.status(400).json({ 
          error: 'Customer details are required',
          code: 'MISSING_CUSTOMER_DETAILS'
        });
      }

      // Get organization
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          users: {
            where: { role: 'admin' },
            take: 1,
          },
        },
      });

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Check if already on Elite plan
      if (organization.plan === 'elite') {
        return res.status(400).json({ error: 'Organization is already on Elite plan' });
      }

      // If Razorpay payment details are provided, verify them
      if (razorpaySubscriptionId && razorpayPaymentId && razorpaySignature) {
        // Verify signature
        const generatedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
          .update(razorpayPaymentId + '|' + razorpaySubscriptionId)
          .digest('hex');
        
        if (generatedSignature !== razorpaySignature) {
          return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Fetch subscription details from Razorpay to confirm it's active
        const subscription = await this.razorpay.subscriptions.fetch(razorpaySubscriptionId);
        if (subscription.status !== 'active' && subscription.status !== 'authenticated') {
          return res.status(400).json({ error: 'Subscription is not active. Please complete payment.' });
        }

        // Update organization with subscription ID and plan
        await prisma.organization.update({
          where: { id: orgId },
          data: {
            subscriptionId: razorpaySubscriptionId,
            plan: 'elite',
          },
        });

        return res.status(200).json({
          success: true,
          message: 'Upgrade completed successfully',
          subscription: {
            id: subscription.id,
            status: subscription.status,
          }
        });
      }

      // If no payment details provided, create a new subscription
      // Create customer in Razorpay
      const customer = await this.razorpay.customers.create({
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      });

      // Create subscription
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: process.env.RAZORPAY_ELITE_PLAN_ID!,
        total_count: 12,
        quantity: 1,
        notes: {
          plan: 'elite',
          email: customerEmail,
          name: customerName,
          orgId: orgId,
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
        },
        message: 'Subscription created successfully. Please complete payment.',
      });
    } catch (error: any) {
      console.error('Error creating upgrade subscription:', error);
      return res.status(500).json({ 
        error: 'Failed to create upgrade subscription',
        code: 'SUBSCRIPTION_CREATION_FAILED',
        details: error.message 
      });
    }
  }

  // Get subscription status
  async getSubscriptionStatus(req: Request, res: Response) {
    try {
      const orgId = req.user?.orgId;
      if (!orgId) {
        return res.status(401).json({ error: 'Organization not found' });
      }

      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization || !organization.subscriptionId) {
        return res.status(404).json({ error: 'No subscription found' });
      }

      const subscription = await this.razorpay.subscriptions.fetch(organization.subscriptionId);
      
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
      const orgId = req.user?.orgId;
      if (!orgId) {
        return res.status(401).json({ error: 'Organization not found' });
      }

      const { cancel_at_cycle_end = true } = req.body;

      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });

      if (!organization || !organization.subscriptionId) {
        return res.status(404).json({ error: 'No subscription found' });
      }

      const subscription = await this.razorpay.subscriptions.cancel(organization.subscriptionId, cancel_at_cycle_end);
      
      // Update organization status
      await prisma.organization.update({
        where: { id: orgId },
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

  // Helper methods
  private getUsageData(plan: string, assessmentsCount: number, participantsCount: number) {
    const baseUsage = {
      assessments: { used: assessmentsCount, limit: 5 },
      participants: { used: participantsCount, limit: 50 },
      emails: { used: Math.floor(participantsCount * 2.5), limit: 100 },
      storage: { used: Math.min(assessmentsCount * 0.1, 1), limit: 1 },
    };

    if (plan === 'elite') {
      return {
        assessments: { used: assessmentsCount, limit: 'Unlimited' },
        participants: { used: participantsCount, limit: 1000 },
        emails: { used: Math.floor(participantsCount * 2.5), limit: 5000 },
        storage: { used: Math.min(assessmentsCount * 0.1, 10), limit: 10 },
      };
    }

    return baseUsage;
  }

  private getPlanData(plan: string) {
    if (plan === 'elite') {
      return {
        name: 'Elite',
        price: 99,
        period: 'month',
        features: [
          'Unlimited Assessments',
          '1000 Participants',
          'Priority Support',
          'Advanced Analytics',
          'AI-Powered Tools',
          'Custom Branding',
          'API Access',
          'Dedicated Account Manager'
        ],
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
    }

    return {
      name: 'Free',
      price: 0,
      period: 'month',
      features: [
        '5 Assessments',
        '50 Participants',
        'Email Support',
        'Basic Analytics'
      ],
      status: 'active',
      nextBillingDate: 'N/A',
    };
  }
} 
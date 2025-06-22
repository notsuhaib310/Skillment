import { Router } from 'express';
import { BillingController } from '../controllers/billing.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const billingController = new BillingController();

// All billing routes require authentication
router.use(authenticate);

// Get billing data for current organization
router.get('/', billingController.getBillingData.bind(billingController));

// Create initial subscription for Razorpay payment
router.post('/create-subscription', billingController.createSubscription.bind(billingController));

// Create upgrade subscription
router.post('/upgrade', billingController.createUpgradeSubscription.bind(billingController));

// Get subscription status
router.get('/subscription/status', billingController.getSubscriptionStatus.bind(billingController));

// Cancel subscription
router.post('/subscription/cancel', billingController.cancelSubscription.bind(billingController));

export default router; 
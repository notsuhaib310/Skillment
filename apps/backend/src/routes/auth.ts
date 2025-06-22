import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router = Router();
const authController = new AuthController();

// Register route
router.post('/register', authController.register.bind(authController));

// Login route
router.post('/login', authController.login);

// Logout route
router.post('/logout', authController.logout);

// Razorpay Elite plan order route
router.post('/razorpay/elite-subscription', authController.createEliteSubscription.bind(authController));

// Razorpay webhook route
router.post('/webhooks/razorpay', authController.handleSubscriptionWebhook.bind(authController));

export default router; 
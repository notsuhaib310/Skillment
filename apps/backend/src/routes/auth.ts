import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router = Router();
const authController = new AuthController();

// Register route
router.post('/register', authController.register.bind(authController));

// Login route
router.post('/login', authController.login);

// Verify route
router.get('/verify', authController.verify.bind(authController));

// Logout route
router.post('/logout', authController.logout);

// Razorpay Elite plan order route
router.post('/razorpay/elite-subscription', authController.createEliteSubscription.bind(authController));

// Razorpay webhook route
router.post('/webhooks/razorpay', authController.handleSubscriptionWebhook.bind(authController));

// OTP routes
router.post('/send-otp', authController.sendOtp.bind(authController));
router.post('/verify-otp', authController.verifyOtp.bind(authController));

// Candidate login route
router.post('/candidate/login', authController.candidateLogin.bind(authController));

export default router; 
import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, verifySession } from '../controllers/auth';
import { validateRequest } from '../middleware/validateRequest';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Register route
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('orgName').optional(),
    body('orgType').optional(),
    body('orgSize').optional(),
    validateRequest
  ],
  register
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  login
);

// Logout route
router.post('/logout', authenticate, logout);

// Verify session route
router.get('/verify', authenticate, verifySession);

export default router; 
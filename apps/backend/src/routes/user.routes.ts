import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const userController = new UserController();

// All user routes should be authenticated
router.use(authenticate);

// GET /api/users/me - Get current user's profile
router.get('/me', userController.getCurrentUser);

// PATCH /api/users/me - Update current user's profile
router.patch('/me', userController.updateCurrentUser);

// POST /api/users/change-password - Change current user's password
router.post('/change-password', userController.changePassword);

export default router; 
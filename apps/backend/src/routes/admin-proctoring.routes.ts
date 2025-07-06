import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { getProctoringEvents, getCandidateViolations } from '../controllers/proctoring.controller';

const router = express.Router();

// Apply authentication middleware to all admin proctoring routes
router.use(authenticate);

// Admin routes (protected)
router.get('/events', getProctoringEvents); // Get all proctoring events for an assessment
router.get('/violations', getCandidateViolations); // Get candidate violations summary

export default router; 
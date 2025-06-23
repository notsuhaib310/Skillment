import { Router } from 'express';
import { assignAssessment, startAttempt, submitAttempt, getAttempt } from '../controllers/attempt.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

// Assign assessment to candidates
router.post('/assessments/:assessmentId/assign', assignAssessment);
// Candidate starts an attempt
router.post('/assessments/:assessmentId/attempt', startAttempt);
// Candidate submits answers
router.post('/attempts/:attemptId/submit', submitAttempt);
// Get attempt/result
router.get('/attempts/:attemptId', getAttempt);

export default router; 
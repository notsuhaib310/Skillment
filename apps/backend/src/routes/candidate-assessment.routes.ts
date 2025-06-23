import { Router } from 'express';
import { listAssignedAssessments, getCandidateAssessment, getCandidateAttempt } from '../controllers/candidate-assessment.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

// List assigned assessments
router.get('/candidate/assessments', listAssignedAssessments);
// Get assessment details for candidate
router.get('/candidate/assessments/:id', getCandidateAssessment);
// Get attempt/result for candidate
router.get('/candidate/attempts/:id', getCandidateAttempt);

export default router; 
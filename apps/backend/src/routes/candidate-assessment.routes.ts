import { Router } from 'express';
import { listAssignedAssessments, getCandidateAssessment, getCandidateAttempt } from '../controllers/candidate-assessment.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

// Public: List assigned assessments for login
router.get('/assessments', (req, res, next) => {
  console.log('Public /candidate/assessments hit');
  next();
}, listAssignedAssessments);

// Protected: All other candidate assessment routes
router.use(authenticate);
// Get assessment details for candidate
router.get('/assessments/:id', getCandidateAssessment);
// Get attempt/result for candidate
router.get('/candidate/attempts/:id', getCandidateAttempt);

export default router; 
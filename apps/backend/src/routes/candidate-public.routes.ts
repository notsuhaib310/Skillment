import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';

const router = Router();
const candidateController = new CandidateController();

// PUBLIC: Candidate login route (no authentication)
router.post('/login', (req, res) => {
  return candidateController.loginCandidate(req, res);
});

// PUBLIC: Get candidate assessment
router.get('/assessments', candidateController.getCandidateAssessment.bind(candidateController));

// PUBLIC: Submit assessment
router.post('/submit-assessment', candidateController.submitAssessment.bind(candidateController));

export default router; 
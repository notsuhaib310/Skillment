import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';

const router = Router();
const candidateController = new CandidateController();

// PUBLIC: Candidate login route (no authentication)
router.post('/login', (req, res) => {
  console.log('POST /api/candidates/login hit (public router)');
  return candidateController.loginCandidate(req, res);
});

export default router; 
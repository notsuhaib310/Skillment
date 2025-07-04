import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const candidateController = new CandidateController();

// All routes below this require authentication
router.use((req, res, next) => {
  return authenticate(req, res, next);
});

// PROTECTED: All other candidate routes
router.post('/:id/start', candidateController.startCandidate.bind(candidateController));
router.post('/:id/send-email', candidateController.sendEmailToCandidate.bind(candidateController));
router.post('/:id/reset-password', candidateController.resetCandidatePassword.bind(candidateController));
router.get('/', candidateController.getCandidates.bind(candidateController));
router.post('/allocate', candidateController.allocateCandidates.bind(candidateController));

export default router; 
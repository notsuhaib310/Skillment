import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);
const candidateController = new CandidateController();

// Start assessment for candidate
router.post('/:id/start', candidateController.startCandidate.bind(candidateController));
// Send email to candidate
router.post('/:id/send-email', candidateController.sendEmailToCandidate.bind(candidateController));
// Reset password for candidate
router.post('/:id/reset-password', candidateController.resetCandidatePassword.bind(candidateController));

export default router; 
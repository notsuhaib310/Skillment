import { Router } from 'express';
import { CandidateController } from '../controllers/candidate.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
const candidateController = new CandidateController();

console.log('Candidate routes loaded - setting up protected routes');

// All routes below this require authentication
router.use((req, res, next) => {
  console.log('Candidate route middleware - authenticating request to:', req.path);
  return authenticate(req, res, next);
});

// PROTECTED: All other candidate routes
router.get('/health', (req, res) => {
  console.log('Health check endpoint hit');
  console.log('User from auth:', req.user);
  res.json({ 
    status: 'ok', 
    message: 'Candidate routes are working',
    user: req.user ? { id: req.user.id, email: req.user.email } : null,
    timestamp: new Date().toISOString()
  });
});

router.post('/:id/start', (req, res) => {
  console.log('Starting candidate:', req.params.id);
  return candidateController.startCandidate(req, res);
});

router.post('/:id/send-email', (req, res) => {
  console.log('Sending email to candidate:', req.params.id);
  return candidateController.sendEmailToCandidate(req, res);
});

router.post('/:id/reset-password', (req, res) => {
  console.log('Resetting password for candidate:', req.params.id);
  return candidateController.resetCandidatePassword(req, res);
});

router.get('/', (req, res) => {
  console.log('Getting candidates with query:', req.query);
  return candidateController.getCandidates(req, res);
});

router.post('/allocate', (req, res) => {
  console.log('Allocating candidates - body:', req.body);
  return candidateController.allocateCandidates(req, res);
});

router.post('/test-email', (req, res) => {
  console.log('Testing email functionality');
  return candidateController.testEmail(req, res);
});

console.log('Candidate routes setup complete');

export default router; 
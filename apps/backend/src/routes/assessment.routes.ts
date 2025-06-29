import { Router } from 'express';
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats,
  getCandidateCredentialsStatus,
} from '../controllers/assessment.controller';
import { authenticate } from '../middleware/authenticate';
import { CandidateController } from '../controllers/candidate.controller';

const router = Router();

router.use(authenticate); // PRODUCTION: Protect all assessment endpoints

// Create a new assessment
router.post('/', createAssessment);

// Get all assessments with filters
router.get('/', getAssessments);

// Get assessment statistics
router.get('/stats', getAssessmentStats);

// Get a single assessment by ID
router.get('/:id', getAssessmentById);

const candidateController = new CandidateController();

// Get candidates for a specific assessment
router.get('/:id/candidates', candidateController.getCandidates.bind(candidateController));

// Get candidate credentials status for a specific assessment
router.get('/:id/candidates/credentials', getCandidateCredentialsStatus);

// Update an assessment
router.put('/:id', updateAssessment);

// Delete an assessment
router.delete('/:id', deleteAssessment);

export default router;

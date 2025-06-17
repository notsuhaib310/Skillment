import { Router } from 'express';
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  getAssessmentStats,
} from '../controllers/assessment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all assessment routes
router.use(authenticateToken);

// Create a new assessment
router.post('/', createAssessment);

// Get all assessments with filters
router.get('/', getAssessments);

// Get assessment statistics
router.get('/stats', getAssessmentStats);

// Get a single assessment by ID
router.get('/:id', getAssessmentById);

// Update an assessment
router.put('/:id', updateAssessment);

// Delete an assessment
router.delete('/:id', deleteAssessment);

export default router;

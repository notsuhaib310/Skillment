import { Router } from 'express';
import { addQuestion, getQuestions, updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();
router.use(authenticate);

// Add a question to an assessment
router.post('/assessments/:assessmentId/questions', addQuestion);
// Get all questions for an assessment
router.get('/assessments/:assessmentId/questions', getQuestions);
// Update a question
router.put('/questions/:id', updateQuestion);
// Delete a question
router.delete('/questions/:id', deleteQuestion);

export default router; 
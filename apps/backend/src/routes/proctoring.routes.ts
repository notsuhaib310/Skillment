import express from 'express';
import { logProctoringEvent, uploadProctoringMedia, getProctoringEvents, getCandidateViolations } from '../controllers/proctoring.controller';

const router = express.Router();

// Public routes (for candidates)
router.post('/event', logProctoringEvent); // For tab switch, fullscreen, face, etc.
router.post('/media', uploadProctoringMedia); // For screenshots, video/audio blobs

// Admin routes (for dashboard)
router.get('/events', getProctoringEvents); // Get all proctoring events for an assessment
router.get('/violations', getCandidateViolations); // Get candidate violations summary

export default router; 
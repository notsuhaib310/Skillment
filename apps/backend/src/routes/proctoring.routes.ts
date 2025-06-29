import express from 'express';
import { logProctoringEvent, uploadProctoringMedia } from '../controllers/proctoring.controller';

const router = express.Router();

router.post('/event', logProctoringEvent); // For tab switch, fullscreen, face, etc.
router.post('/media', uploadProctoringMedia); // For screenshots, video/audio blobs

export default router; 
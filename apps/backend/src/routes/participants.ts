import { Router } from 'express';
import { getParticipants, addParticipant, getParticipant } from '../controllers/participants';
// import { authenticate } from '../middleware/authenticate';

const router = Router();

// Apply authentication middleware to all routes
// router.use(authenticate); // TEMP: Make all participants endpoints public for dashboard testing

router.get('/', getParticipants);
router.post('/', addParticipant);
router.get('/:id', getParticipant);

export default router; 
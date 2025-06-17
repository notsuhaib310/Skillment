import { Router } from 'express';
import { getParticipants, addParticipant, getParticipant } from '../controllers/participants';

const router = Router();

router.get('/', getParticipants);
router.post('/', addParticipant);
router.get('/:id', getParticipant);

export default router; 
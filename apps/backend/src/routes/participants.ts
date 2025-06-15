import { Router } from 'express';
import { getParticipants, addParticipant, getParticipantById } from '../controllers/participants';

const router = Router();

router.get('/', getParticipants);
router.post('/', addParticipant);
router.get('/:id', getParticipantById);

export default router; 
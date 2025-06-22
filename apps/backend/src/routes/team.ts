import express from 'express';
import { authenticate } from '../middleware/authenticate';
import {
  getTeamMembers,
  inviteTeamMember,
  updateTeamMember,
  removeTeamMember,
  getTeamMemberById,
  getInvitationDetails,
  acceptInvitation,
} from '../controllers/team.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all team members
router.get('/', getTeamMembers);

// Get specific team member
router.get('/:id', getTeamMemberById);

// Invite new team member
router.post('/', inviteTeamMember);

// Update team member
router.put('/:id', updateTeamMember);

// Remove team member
router.delete('/:id', removeTeamMember);

// Public routes (no authentication required)
// Get invitation details
router.get('/invitation/:id', getInvitationDetails);

// Accept invitation
router.post('/accept-invitation', acceptInvitation);

export default router; 
import { emailService } from '../services/email.service';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class CandidateController {
  // Start assessment for candidate
  async startCandidate(req, res) {
    try {
      const { id } = req.params;
      const candidate = await prisma.candidate.update({
        where: { id },
        data: { status: 'started', startedAt: new Date() },
      });
      return res.json(candidate);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to start candidate' });
    }
  }

  // Send email to candidate
  async sendEmailToCandidate(req, res) {
    try {
      const { id } = req.params;
      const candidate = await prisma.candidate.findUnique({ where: { id } });
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      await emailService.sendWelcomeEmail({
        email: candidate.email,
        firstName: candidate.name.split(' ')[0] || candidate.name,
        lastName: candidate.name.split(' ').slice(1).join(' '),
        organizationName: '',
        loginUrl: '',
        plan: '',
      });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  // Reset password for candidate (if user exists)
  async resetCandidatePassword(req, res) {
    try {
      const { id } = req.params;
      const candidate = await prisma.candidate.findUnique({ where: { id } });
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      const user = await prisma.user.findUnique({ where: { email: candidate.email } });
      if (!user) return res.status(404).json({ error: 'No user account for this candidate' });
      const newPassword = Math.random().toString(36).slice(-8);
      const hashed = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
      await emailService.sendWelcomeEmail({
        email: candidate.email,
        firstName: candidate.name.split(' ')[0] || candidate.name,
        lastName: candidate.name.split(' ').slice(1).join(' '),
        organizationName: '',
        loginUrl: '',
        plan: '',
      });
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }
  }
} 
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

  // Get all candidates for the organization or for a specific assessment
  async getCandidates(req, res) {
    try {
      // Support both /candidates?assessmentId=... and /assessments/:id/candidates
      const assessmentId = req.query.assessmentId || req.params.id;
      let candidates;
      if (assessmentId) {
        candidates = await prisma.candidate.findMany({ where: { assessmentId: assessmentId } });
      } else {
        candidates = await prisma.candidate.findMany();
      }
      return res.json(candidates);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  }

  // Candidate login
  async loginCandidate(req, res) {
    try {
      const { candidateId, password } = req.body;
      console.log('Login attempt:', { candidateId, password });
      if (!candidateId || !password) {
        return res.status(400).json({ error: 'Candidate ID and password are required' });
      }
      // Demo credential fallback
      if (candidateId === 'demo' && password === 'demo1234') {
        console.log('Demo login successful');
        return res.json({ success: true, candidate: {
          id: 'demo',
          name: 'Demo Candidate',
          email: 'demo@skillment.in',
          assessmentId: 'demo-assessment',
          status: 'invited',
        }});
      }
      let credential = await prisma.credential.findUnique({ where: { candidateId } });
      console.log('Lookup by candidateId:', !!credential);
      if (!credential) {
        return res.status(401).json({ error: 'Invalid credentials (no credential found for candidateId)' });
      }
      const valid = await bcrypt.compare(password, credential.passwordHash);
      console.log('Password valid:', valid);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials (password mismatch)' });
      }
      // Fetch candidate info
      const candidate = await prisma.candidate.findUnique({ where: { id: credential.candidateId } });
      if (!candidate) {
        console.log('Credential found but candidate missing:', credential.candidateId);
        return res.status(401).json({ error: 'Invalid credentials (candidate missing)' });
      }
      return res.json({ success: true, candidate });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
} 
import { emailService } from '../services/email.service';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class CandidateController {
  // Allocate candidates to an assessment
  async allocateCandidates(req, res) {
    try {
      const { assessmentId, candidates } = req.body;
      
      if (!assessmentId || !candidates || !Array.isArray(candidates)) {
        return res.status(400).json({ error: 'Assessment ID and candidates array are required' });
      }

      // Check if assessment exists
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId }
      });

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      const createdCandidates = [];
      
      for (const candidateData of candidates) {
        const { name, email } = candidateData;
        
        // Check if candidate already exists for this assessment
        const existingCandidate = await prisma.candidate.findFirst({
          where: {
            email: email,
            assessmentId: assessmentId
          }
        });

        if (existingCandidate) {
          continue; // Skip if already exists
        }

        // Generate candidate ID and password
        const candidateId = `CAND${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const password = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create candidate
        const candidate = await prisma.candidate.create({
          data: {
            name: name,
            email: email,
            assessmentId: assessmentId,
            status: 'invited',
            allottedAt: new Date(),
            allottedBy: req.user?.id || 'system'
          }
        });

        // Create credential
        await prisma.credential.create({
          data: {
            candidateId: candidateId, // Store the display ID (CAND123456) for login
            email: email,
            passwordHash: hashedPassword
          }
        });

        // Create participant entry
        try {
          await prisma.participant.create({
            data: {
              name: name,
              email: email,
              tags: [`Assessment: ${assessment.title}`],
              organization: req.user?.orgId || 'default', // Add organization
            }
          });
        } catch (participantError) {
          // If participant already exists, update their tags
          const existingParticipant = await prisma.participant.findFirst({
            where: { email: email }
          });

          if (existingParticipant) {
            const newTags = [...existingParticipant.tags];
            const assessmentTag = `Assessment: ${assessment.title}`;
            if (!newTags.includes(assessmentTag)) {
              newTags.push(assessmentTag);
              await prisma.participant.update({
                where: { id: existingParticipant.id },
                data: { tags: newTags }
              });
            }
          }
        }

        // Send email with credentials
        try {
          await emailService.sendCandidateCredentialEmail(
            {
              id: candidate.id,
              name: name,
              email: email,
              assessmentId: assessmentId
            },
            password,
            candidateId,
            assessment.title
          );

          // Log email sending
          await prisma.emailLog.create({
            data: {
              to: email,
              candidateId: candidate.id,
              assessmentId: assessmentId,
              subject: `Assessment Invitation - ${assessment.title}`,
              body: `Your credentials: ID: ${candidateId}, Password: ${password}`,
              status: 'sent',
              sentAt: new Date(),
              createdById: req.user?.id || 'system'
            }
          });

          createdCandidates.push({
            ...candidate,
            candidateId: candidateId,
            password: password // Only for response, not stored
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
          // Continue with other candidates even if email fails
          createdCandidates.push({
            ...candidate,
            candidateId: candidateId,
            password: password,
            emailError: 'Failed to send email'
          });
        }
      }

      return res.json({
        success: true,
        message: `${createdCandidates.length} candidates allocated successfully`,
        candidates: createdCandidates
      });
    } catch (error) {
      console.error('Candidate allocation error:', error);
      return res.status(500).json({ error: 'Failed to allocate candidates' });
    }
  }

  // Get candidate assessment
  async getCandidateAssessment(req, res) {
    try {
      const { candidateId } = req.query;
      
      if (!candidateId) {
        return res.status(400).json({ error: 'Candidate ID is required' });
      }

      // Find candidate by credential
      const credential = await prisma.credential.findUnique({
        where: { candidateId: candidateId }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      const candidate = await prisma.candidate.findFirst({
        where: { email: credential.email },
        include: {
          assessment: {
            include: {
              questions: {
                orderBy: { order: 'asc' }
              }
            }
          }
        }
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      return res.json([{
        candidate: candidate,
        assessment: candidate.assessment
      }]);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch candidate assessment' });
    }
  }

  // Submit assessment
  async submitAssessment(req, res) {
    try {
      const { candidateId, answers, timeSpent } = req.body;
      
      if (!candidateId || !answers) {
        return res.status(400).json({ error: 'Candidate ID and answers are required' });
      }

      // Find candidate by credential
      const credential = await prisma.credential.findUnique({
        where: { candidateId: candidateId }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      const candidate = await prisma.candidate.findFirst({
        where: { email: credential.email },
        include: {
          assessment: {
            include: {
              questions: true
            }
          }
        }
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Calculate score
      let score = 0;
      const questions = candidate.assessment.questions;
      
      for (const question of questions) {
        const answer = answers[question.id];
        if (answer && question.correctAnswer) {
          if (question.type === 'mcq') {
            if (answer === question.correctAnswer) {
              score += question.marks;
            }
          } else if (question.type === 'coding') {
            // For coding questions, give partial credit based on test cases
            // This is simplified - in a real system, you'd run test cases
            score += question.marks * 0.5; // Give 50% for now
          }
        }
      }

      // Update candidate with submission
      const updatedCandidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          status: 'completed',
          score: score,
          timeSpent: timeSpent,
          submittedAt: new Date(),
          answers: answers
        }
      });

      return res.json({
        success: true,
        message: 'Assessment submitted successfully',
        candidate: updatedCandidate,
        score: score,
        totalMarks: candidate.assessment.totalMarks
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to submit assessment' });
    }
  }

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
      const candidate = await prisma.candidate.findUnique({ 
        where: { id },
        include: {
          assessment: true
        }
      });
      if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
      
      // Get the credential for this candidate
      const credential = await prisma.credential.findFirst({
        where: { email: candidate.email }
      });
      
      if (!credential) {
        return res.status(404).json({ error: 'Candidate credentials not found' });
      }
      
      // Always use the existing credential ID - this is the CAND123456 format
      const displayCandidateId = credential.candidateId;
      
      console.log('Resending email with credential ID:', displayCandidateId, 'for candidate:', candidate.email);
      
      // Send credential email
      await emailService.sendCandidateCredentialEmail(
        {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          assessmentId: candidate.assessmentId
        },
        undefined, // Don't send password, use existing - will generate new password
        displayCandidateId,
        candidate.assessment?.title || 'Assessment'
      );
      
      return res.json({ success: true, message: 'Credential email sent successfully' });
    } catch (error) {
      console.error('Error sending candidate email:', error);
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
        candidates = await prisma.candidate.findMany({ 
          where: { assessmentId: assessmentId },
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                totalMarks: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        candidates = await prisma.candidate.findMany({
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                type: true,
                duration: true,
                totalMarks: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      // Get credential information for each candidate
      const candidatesWithCredentials = await Promise.all(
        candidates.map(async (candidate) => {
          // Find credential by email since that's the reliable link
          const credential = await prisma.credential.findFirst({
            where: { 
              email: candidate.email
            }
          });
          
          console.log(`Candidate ${candidate.email} - DB ID: ${candidate.id}, Credential ID: ${credential?.candidateId || 'NOT FOUND'}`);
          
          return {
            ...candidate,
            loginId: credential?.candidateId || null, // This should be the CAND123456 format
            hasCredentials: !!credential
          };
        })
      );

      return res.json(candidatesWithCredentials);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch candidates' });
    }
  }

  // Candidate login
  async loginCandidate(req, res) {
    try {
      const { candidateId, password } = req.body;
      if (!candidateId || !password) {
        return res.status(400).json({ error: 'Candidate ID and password are required' });
      }
      
      // Demo credential fallback
      if (candidateId === 'demo' && password === 'demo1234') {
        return res.json({ success: true, candidate: {
          id: 'demo',
          name: 'Demo Candidate',
          email: 'demo@skillment.in',
          assessmentId: 'demo-assessment',
          status: 'invited',
        }});
      }
      
      let credential = await prisma.credential.findUnique({ where: { candidateId } });
      
      if (!credential) {
        return res.status(401).json({ error: 'Invalid credentials (no credential found for candidateId)' });
      }
      
      const valid = await bcrypt.compare(password, credential.passwordHash);
      
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials (password mismatch)' });
      }
      
      // Fetch candidate info using email since credential.candidateId is now the display ID
      const candidate = await prisma.candidate.findFirst({ 
        where: { email: credential.email },
        include: {
          assessment: {
            select: {
              id: true,
              title: true,
              type: true,
              duration: true,
              totalMarks: true,
              enableProctoring: true,
              webcamMonitoring: true,
              screenRecording: true,
              tabSwitchDetection: true,
              copyPasteDetection: true,
              rightClickDisable: true,
              fullscreenMode: true
            }
          }
        }
      });
      
      if (!candidate) {
        return res.status(401).json({ error: 'Invalid credentials (candidate missing)' });
      }
      
      return res.json({ success: true, candidate });
    } catch (err) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // Fix credentials that have database IDs instead of CAND format
  async fixCredentialIds(req, res) {
    try {
      console.log('Starting credential ID fix...');
      
      // Get all credentials
      const credentials = await prisma.credential.findMany();
      let fixedCount = 0;
      
      for (const credential of credentials) {
        // Check if candidateId is in database ID format (not CAND format)
        if (!credential.candidateId.startsWith('CAND')) {
          // Generate a new CAND format ID
          const newCandidateId = `CAND${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
          
          // Update the credential
          await prisma.credential.update({
            where: { id: credential.id },
            data: { candidateId: newCandidateId }
          });
          
          console.log(`Fixed credential for ${credential.email}: ${credential.candidateId} -> ${newCandidateId}`);
          fixedCount++;
        }
      }
      
      return res.json({ 
        success: true, 
        message: `Fixed ${fixedCount} credentials`,
        fixedCount 
      });
    } catch (error) {
      console.error('Fix credentials error:', error);
      return res.status(500).json({ error: 'Failed to fix credentials' });
    }
  }

  // Test email functionality
  async testEmail(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      console.log('Testing email to:', email);
      
      // Send a simple test email
      const success = await emailService.sendOtpEmail(email, '123456');
      
      if (success) {
        return res.json({ 
          success: true, 
          message: 'Test email sent successfully! Check your inbox and spam folder.' 
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to send test email. Check server logs for details.' 
        });
      }
    } catch (error) {
      console.error('Test email error:', error);
      return res.status(500).json({ error: 'Failed to send test email' });
    }
  }
} 
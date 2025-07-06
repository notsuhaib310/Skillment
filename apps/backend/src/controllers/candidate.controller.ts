import { emailService } from '../services/email.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
        
        console.log(`Creating candidate with ID: ${candidateId}, Password: ${password}`);

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

  // Get candidate assessment - Returns real assessment data from database
  async getCandidateAssessment(req, res) {
    try {
      const { email, candidateId } = req.query;
      
      if (!email && !candidateId) {
        return res.status(400).json({ error: 'Email or candidate ID is required' });
      }

      let candidate;
      
      if (candidateId) {
      // Find candidate by credential
      const credential = await prisma.credential.findUnique({
        where: { candidateId: candidateId }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

        candidate = await prisma.candidate.findFirst({
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
      } else if (email) {
        candidate = await prisma.candidate.findFirst({
          where: { email: email },
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
      }

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Format assessment questions properly for frontend consumption
      const formattedAssessment = {
        ...candidate.assessment,
        questions: candidate.assessment.questions.map(question => {
          const baseQuestion = {
            id: question.id,
            question: question.question,
            type: question.type,
            marks: question.marks,
            order: question.order,
            hints: question.hints,
            timeLimit: question.timeLimit || 120, // Default 2 minutes per question
          };

          // Format MCQ questions
          if (question.type === 'multiple_choice' && question.mcqData) {
            const mcqData = question.mcqData as any;
            return {
              ...baseQuestion,
              options: mcqData.options || [],
              multipleCorrect: mcqData.multipleCorrect || false,
              difficulty: mcqData.difficulty || 'Medium',
              explanation: mcqData.explanation || '',
              category: mcqData.category || 'General'
            };
          }

          // Format coding questions
          if (question.type === 'coding' && question.codingData) {
            const codingData = question.codingData as any;
            return {
              ...baseQuestion,
              title: codingData.title || question.question,
              description: codingData.description || question.question,
              difficulty: codingData.difficulty || 'Medium',
              languages: codingData.languages || ['javascript', 'python', 'java', 'cpp'],
              starterCode: codingData.starterCode || {
                javascript: '// Write your solution here\nfunction solution() {\n    \n}',
                python: '# Write your solution here\ndef solution():\n    pass',
                java: '// Write your solution here\nclass Solution {\n    public void solution() {\n        \n    }\n}',
                cpp: '// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}'
              },
              examples: codingData.examples || [],
              constraints: codingData.constraints || [],
              testCases: codingData.testCases || [],
              timeLimit: codingData.timeLimit || 30,
              memoryLimit: codingData.memoryLimit || 256
            };
          }

          return baseQuestion;
        })
      };

      return res.json([{
        id: candidate.id,
        candidate: {
          id: candidate.id,
          candidateId: candidateId, // Include the login ID for reference
          name: candidate.name,
          email: candidate.email,
          status: candidate.status,
          startedAt: candidate.startedAt,
          timeSpent: candidate.timeSpent
        },
        assessment: formattedAssessment
      }]);
    } catch (error) {
      console.error('Error fetching candidate assessment:', error);
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
      
      // Generate a new password for resending (since we can't decrypt the stored hash)
      const newPassword = Math.random().toString(36).slice(-8);
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      
      // Update the credential with the new password hash
      await prisma.credential.update({
        where: { id: credential.id },
        data: { passwordHash: newPasswordHash }
      });
      
      console.log('Updated password hash for credential ID:', displayCandidateId);
      
      // Send credential email with the new password
      await emailService.sendCandidateCredentialEmail(
        {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          assessmentId: candidate.assessmentId
        },
        newPassword, // Send new password for resending
        displayCandidateId,
        candidate.assessment?.title || 'Assessment'
      );
      
      return res.json({ 
        success: true, 
        message: 'New credentials sent successfully',
        newPassword: newPassword // Include in response for debugging
      });
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
      console.log('Login attempt:', { candidateId, passwordLength: password?.length });
      
      if (!candidateId || !password) {
        return res.status(400).json({ error: 'Candidate ID and password are required' });
      }
      
      // Demo credential fallback
      if (candidateId === 'demo' && password === 'demo1234') {
        console.log('Demo login successful');
        const demoToken = jwt.sign(
          { 
            candidateId: 'demo',
            email: 'demo@skillment.in',
            type: 'candidate'
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        return res.json({ 
          success: true, 
          candidate: {
          id: 'demo',
            candidateId: 'demo',
          name: 'Demo Candidate',
          email: 'demo@skillment.in',
          assessmentId: 'demo-assessment',
          status: 'invited',
          },
          token: demoToken
        });
      }
      
      // First check if the credential exists
      let credential = await prisma.credential.findUnique({ where: { candidateId } });
      console.log('Credential lookup result:', credential ? 'FOUND' : 'NOT FOUND');
      
      if (!credential) {
        // Also try to find all credentials to debug
        const allCredentials = await prisma.credential.findMany({
          select: { candidateId: true, email: true }
        });
        console.log('All available credentials:', allCredentials);
        
        return res.status(401).json({ 
          error: `Invalid credentials - Candidate ID '${candidateId}' not found`,
          debug: `Available IDs: ${allCredentials.map(c => c.candidateId).join(', ')}`
        });
      }
      
      console.log('Found credential for email:', credential.email);
      
      const valid = await bcrypt.compare(password, credential.passwordHash);
      console.log('Password validation:', valid ? 'SUCCESS' : 'FAILED');
      
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
      
      console.log('Candidate lookup result:', candidate ? 'FOUND' : 'NOT FOUND');
      
      if (!candidate) {
        return res.status(401).json({ error: 'Invalid credentials (candidate missing)' });
      }
      
      console.log('Login successful for:', candidate.name);
      
      // Generate JWT token for the candidate
      const token = jwt.sign(
        { 
          candidateId: candidate.id,
          email: candidate.email,
          type: 'candidate'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({ 
        success: true, 
        candidate: {
          ...candidate,
          candidateId: candidateId // Include the login ID for reference
        },
        token 
      });
    } catch (err) {
      console.error('Login error:', err);
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

  // Debug: List all credentials in database
  async listCredentials(req, res) {
    try {
      const credentials = await prisma.credential.findMany({
        select: {
          candidateId: true,
          email: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      
      console.log('All credentials in database:', credentials);
      
      return res.json({
        success: true,
        count: credentials.length,
        credentials: credentials
      });
    } catch (error) {
      console.error('Error listing credentials:', error);
      return res.status(500).json({ error: 'Failed to list credentials' });
    }
  }

  // Debug: Test specific credentials
  async testCredentials(req, res) {
    try {
      const { candidateId, password } = req.body;
      console.log('Testing credentials:', { candidateId, passwordLength: password?.length });
      
      // Step 1: Check if credential exists
      const credential = await prisma.credential.findUnique({ 
        where: { candidateId } 
      });
      
      if (!credential) {
        const allCreds = await prisma.credential.findMany({
          select: { candidateId: true, email: true }
        });
        return res.json({
          success: false,
          step: 'credential_lookup',
          result: 'NOT_FOUND',
          message: `Candidate ID '${candidateId}' not found`,
          availableIds: allCreds.map(c => c.candidateId)
        });
      }
      
      console.log('Found credential for:', credential.email);
      
      // Step 2: Test password
      const passwordValid = await bcrypt.compare(password, credential.passwordHash);
      
      if (!passwordValid) {
        return res.json({
          success: false,
          step: 'password_validation',
          result: 'INVALID',
          message: 'Password does not match',
          credentialEmail: credential.email
        });
      }
      
      console.log('Password validation successful');
      
      // Step 3: Find candidate
      const candidate = await prisma.candidate.findFirst({
        where: { email: credential.email },
        include: { assessment: true }
      });
      
      if (!candidate) {
        return res.json({
          success: false,
          step: 'candidate_lookup',
          result: 'NOT_FOUND',
          message: 'No candidate found for this email',
          credentialEmail: credential.email
        });
      }
      
      console.log('Found candidate:', candidate.name);
      
      return res.json({
        success: true,
        message: 'Credentials are valid!',
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          status: candidate.status,
          assessment: candidate.assessment?.title || 'No assessment'
        }
      });
      
    } catch (error) {
      console.error('Error testing credentials:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Server error during testing',
        details: error.message 
      });
    }
  }

  // Manually update a candidate's password for testing
  async updateCandidatePassword(req, res) {
    try {
      const { candidateId, newPassword } = req.body;
      
      if (!candidateId || !newPassword) {
        return res.status(400).json({ error: 'Candidate ID and new password are required' });
      }
      
      console.log('Updating password for candidate:', candidateId);
      
      // Find the credential
      const credential = await prisma.credential.findUnique({
        where: { candidateId }
      });
      
      if (!credential) {
        return res.status(404).json({ error: 'Credential not found' });
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update the credential
      await prisma.credential.update({
        where: { id: credential.id },
        data: { passwordHash: hashedPassword }
      });
      
      console.log('Password updated successfully for:', candidateId);
      
      return res.json({
        success: true,
        message: 'Password updated successfully',
        candidateId,
        newPassword // Include for debugging
      });
      
    } catch (error) {
      console.error('Error updating password:', error);
      return res.status(500).json({ error: 'Failed to update password' });
    }
  }
} 
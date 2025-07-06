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

      // Format questions for the frontend
      const formattedQuestions = candidate.assessment.questions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        order: q.order,
        hints: q.hints || [],
        explanation: q.explanation || '',
        difficulty: q.difficulty || 'medium',
        tags: q.tags || []
      }));

      return res.json({
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email,
          status: candidate.status,
          startedAt: candidate.startedAt,
          submittedAt: candidate.submittedAt,
          timeSpent: candidate.timeSpent || 0,
          answers: candidate.answers || {}
        },
        assessment: {
          id: candidate.assessment.id,
          title: candidate.assessment.title,
          description: candidate.assessment.description,
          type: candidate.assessment.type,
          duration: candidate.assessment.duration,
          totalMarks: candidate.assessment.totalMarks,
          totalQuestions: candidate.assessment.totalQuestions,
          questions: formattedQuestions,
          instructions: candidate.assessment.instructions,
          enableProctoring: candidate.assessment.enableProctoring,
          webcamMonitoring: candidate.assessment.webcamMonitoring,
          screenRecording: candidate.assessment.screenRecording,
          tabSwitchDetection: candidate.assessment.tabSwitchDetection,
          copyPasteDetection: candidate.assessment.copyPasteDetection,
          rightClickDisable: candidate.assessment.rightClickDisable,
          fullscreenMode: candidate.assessment.fullscreenMode
        }
      });
    } catch (error) {
      console.error('Error fetching candidate assessment:', error);
      return res.status(500).json({ error: 'Failed to fetch candidate assessment' });
    }
  }

  // Submit assessment
  async submitAssessment(req, res) {
    try {
      const { candidateId, answers } = req.body;
      
      if (!candidateId || !answers) {
        return res.status(400).json({ error: 'Candidate ID and answers are required' });
      }

      // Find candidate using external candidateId (like CAND1751794629720WO1M)
      const credential = await prisma.credential.findFirst({
        where: { candidateId: candidateId }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Candidate not found or not assigned to this assessment' });
      }

      // Find candidate using email from credential
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
        return res.status(404).json({ error: 'Candidate not found or not assigned to this assessment' });
      }

      // Calculate score
      let totalScore = 0;
      const questions = candidate.assessment.questions;
      
      for (const question of questions) {
        const userAnswer = answers[question.id];
        if (userAnswer !== undefined) {
          // For MCQ questions, check if answer matches
          if (question.type === 'mcq') {
            const correctAnswer = question.correctAnswer;
            if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
              // Multiple correct answers
              const isCorrect = correctAnswer.length === userAnswer.length && 
                correctAnswer.every(ans => userAnswer.includes(ans));
              if (isCorrect) {
                totalScore += question.marks;
              }
            } else if (correctAnswer === userAnswer) {
              totalScore += question.marks;
            }
          }
          // For coding questions, you might want to run test cases here
        }
      }

      // Update candidate with submission
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: {
          status: 'submitted',
          score: totalScore,
          submittedAt: new Date(),
          answers: answers as any,
          timeSpent: req.body.timeSpent || 0
        }
      });

      return res.json({
        success: true,
        message: 'Assessment submitted successfully',
        score: totalScore,
        totalMarks: candidate.assessment.totalMarks
      });
    } catch (error) {
      console.error('Error submitting assessment:', error);
      return res.status(500).json({ error: 'Failed to submit assessment' });
    }
  }

  // Start candidate assessment
  async startCandidate(req, res) {
    try {
      const { id } = req.params;
      
      const candidate = await prisma.candidate.update({
        where: { id },
        data: {
          status: 'started',
          startedAt: new Date()
        }
      });

      return res.json({ success: true, candidate });
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

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Get credential for this candidate
      const credential = await prisma.credential.findFirst({
        where: { email: candidate.email }
      });

      if (!credential) {
        return res.status(404).json({ error: 'Credentials not found for candidate' });
      }

      // Generate new password
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update credential with new password
      await prisma.credential.update({
        where: { id: credential.id },
        data: { passwordHash: hashedPassword }
      });

      // Send email with new credentials
      await emailService.sendCandidateCredentialEmail(
        candidate,
        password,
        credential.candidateId,
        candidate.assessment.title
      );

      // Log email sending
      await prisma.emailLog.create({
        data: {
          to: candidate.email,
          candidateId: candidate.id,
          assessmentId: candidate.assessmentId,
          subject: `Assessment Invitation - ${candidate.assessment.title}`,
          body: `Your credentials: ID: ${credential.candidateId}, Password: ${password}`,
          status: 'sent',
          sentAt: new Date(),
          createdById: req.user?.id || 'system'
        }
      });

      return res.json({ 
        success: true, 
        message: 'Email sent successfully',
        credentials: {
          candidateId: credential.candidateId,
          password: password
        }
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  // Reset candidate password
  async resetCandidatePassword(req, res) {
    try {
      const { id } = req.params;
      
      const candidate = await prisma.candidate.findUnique({
        where: { id }
      });

      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Generate new password
      const password = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update credential
      await prisma.credential.updateMany({
        where: { email: candidate.email },
        data: { passwordHash: hashedPassword }
      });

      return res.json({ 
        success: true, 
        message: 'Password reset successfully',
        password: password
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  // Get candidates with proctoring data
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
                totalMarks: true,
                webcamMonitoring: true,
                screenRecording: true,
                tabSwitchDetection: true,
                copyPasteDetection: true,
                rightClickDisable: true,
                fullscreenMode: true
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
                totalMarks: true,
                webcamMonitoring: true,
                screenRecording: true,
                tabSwitchDetection: true,
                copyPasteDetection: true,
                rightClickDisable: true,
                fullscreenMode: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      // Get credential information and proctoring data for each candidate
      const candidatesWithCredentials = await Promise.all(
        candidates.map(async (candidate) => {
          // Find credential by email since that's the reliable link
          const credential = await prisma.credential.findFirst({
            where: { 
              email: candidate.email
            }
          });
          
          // Get proctoring session data
          const proctoringSession = await prisma.proctoringSession.findUnique({
            where: { candidateId: candidate.id }
          });
          
          // Get recent proctoring events
          const proctoringEvents = await prisma.proctoringEvent.findMany({
            where: { candidateId: candidate.id },
            orderBy: { timestamp: 'desc' },
            take: 50 // Get last 50 events
          });
          
          // Calculate proctoring statistics
          const tabSwitches = proctoringEvents.filter(e => e.eventType === 'tab_switch').length;
          const fullscreenExits = proctoringEvents.filter(e => e.eventType === 'fullscreen_exit').length;
          const copyPasteAttempts = proctoringEvents.filter(e => e.eventType === 'copy_paste').length;
          const rightClickAttempts = proctoringEvents.filter(e => e.eventType === 'right_click').length;
          const keyboardViolations = proctoringEvents.filter(e => e.eventType === 'keyboard_violation').length;
          const suspiciousActivity = proctoringEvents.filter(e => e.severity === 'critical').length;
          
          // Calculate violations by severity
          const violations = {
            critical: proctoringSession?.criticalViolations || 0,
            warning: proctoringSession?.warningViolations || 0,
            minor: proctoringSession?.minorViolations || 0
          };
          
          console.log(`Candidate ${candidate.email} - DB ID: ${candidate.id}, Credential ID: ${credential?.candidateId || 'NOT FOUND'}`);
          
          return {
            ...candidate,
            loginId: credential?.candidateId || null, // This should be the CAND123456 format
            hasCredentials: !!credential,
            violations,
            proctoring: {
              webcamMonitored: candidate.assessment?.webcamMonitoring || false,
              screenRecorded: candidate.assessment?.screenRecording || false,
              tabSwitches,
              copyPasteAttempts,
              rightClickAttempts,
              fullscreenExits,
              suspiciousActivity,
              faceDetectionFailures: 0, // Placeholder - can be implemented later
              multiplePersonsDetected: 0, // Placeholder - can be implemented later
              phoneDetected: false, // Placeholder - can be implemented later
              environmentFlags: [], // Placeholder - can be implemented later
              videoRecordingUrl: null, // Placeholder - can be implemented later
              screenshots: [], // Placeholder - can be implemented later
              keyboardViolations,
              riskLevel: proctoringSession?.riskLevel || 'low',
              totalViolations: proctoringSession?.totalViolations || 0,
              browserInfo: {
                userAgent: "", // Placeholder - can be captured from login
                screenResolution: "", // Placeholder - can be captured from login
                browserName: "" // Placeholder - can be captured from login
              }
            },
            device: {
              type: "desktop", // Placeholder - can be detected from user agent
              os: "", // Placeholder - can be detected from user agent
              browser: "", // Placeholder - can be detected from user agent
              ipAddress: "", // Placeholder - can be captured from request
              location: "" // Placeholder - can be derived from IP
            }
          };
        })
      );

      return res.json(candidatesWithCredentials);
    } catch (error) {
      console.error('Error fetching candidates with proctoring data:', error);
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

  // Get assessment analytics with proctoring data
  async getAssessmentAnalytics(req, res) {
    try {
      const { assessmentId } = req.params;
      
      if (!assessmentId) {
        return res.status(400).json({ error: 'Assessment ID is required' });
      }

      // Get assessment details
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        select: {
          id: true,
          title: true,
          type: true,
          duration: true,
          totalMarks: true,
          totalQuestions: true,
          passingMarks: true
        }
      });

      if (!assessment) {
        return res.status(404).json({ error: 'Assessment not found' });
      }

      // Get all candidates for this assessment
      const candidates = await prisma.candidate.findMany({
        where: { assessmentId: assessmentId },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          score: true,
          timeSpent: true,
          startedAt: true,
          submittedAt: true
        }
      });

      // Get proctoring sessions for all candidates
      const proctoringSessions = await prisma.proctoringSession.findMany({
        where: { assessmentId: assessmentId },
        include: {
          candidate: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Get all proctoring events for this assessment
      const proctoringEvents = await prisma.proctoringEvent.findMany({
        where: { assessmentId: assessmentId },
        select: {
          candidateId: true,
          eventType: true,
          severity: true,
          timestamp: true
        }
      });

      // Calculate analytics
      const totalCandidates = candidates.length;
      const completedCandidates = candidates.filter(c => c.status === 'submitted').length;
      const averageScore = completedCandidates > 0 
        ? candidates.filter(c => c.score !== null).reduce((sum, c) => sum + (c.score || 0), 0) / completedCandidates
        : 0;
      const averageTime = completedCandidates > 0 
        ? candidates.filter(c => c.timeSpent !== null).reduce((sum, c) => sum + (c.timeSpent || 0), 0) / completedCandidates / 60
        : 0;
      const passRate = completedCandidates > 0 
        ? (candidates.filter(c => (c.score || 0) >= assessment.passingMarks).length / completedCandidates) * 100
        : 0;

      // Score distribution
      const scoreRanges = [
        { range: '0-20%', min: 0, max: 0.2 },
        { range: '21-40%', min: 0.21, max: 0.4 },
        { range: '41-60%', min: 0.41, max: 0.6 },
        { range: '61-80%', min: 0.61, max: 0.8 },
        { range: '81-100%', min: 0.81, max: 1.0 }
      ];

      const scoreDistribution = scoreRanges.map(range => {
        const count = candidates.filter(c => {
          const percentage = (c.score || 0) / assessment.totalMarks;
          return percentage >= range.min && percentage <= range.max;
        }).length;
        return {
          range: range.range,
          count,
          percentage: totalCandidates > 0 ? (count / totalCandidates) * 100 : 0
        };
      });

      // Top performers
      const topPerformers = candidates
        .filter(c => c.score !== null)
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          score: c.score || 0,
          percentage: Math.round(((c.score || 0) / assessment.totalMarks) * 100)
        }));

      // Proctoring analytics
      const totalViolations = proctoringSessions.reduce((sum, s) => sum + s.totalViolations, 0);
      const criticalViolations = proctoringSessions.reduce((sum, s) => sum + s.criticalViolations, 0);
      const warningViolations = proctoringSessions.reduce((sum, s) => sum + s.warningViolations, 0);
      const minorViolations = proctoringSessions.reduce((sum, s) => sum + s.minorViolations, 0);

      // Risk level distribution
      const riskLevels = {
        high: proctoringSessions.filter(s => s.riskLevel === 'high').length,
        medium: proctoringSessions.filter(s => s.riskLevel === 'medium').length,
        low: proctoringSessions.filter(s => s.riskLevel === 'low').length
      };

      // Event type distribution
      const eventTypes = {};
      proctoringEvents.forEach(event => {
        eventTypes[event.eventType] = (eventTypes[event.eventType] || 0) + 1;
      });

      // Behavior patterns
      const behaviorInsights = {
        averageTabSwitches: Math.round((eventTypes['tab_switch'] || 0) / Math.max(completedCandidates, 1)),
        totalCopyPasteAttempts: eventTypes['copy_paste'] || 0,
        totalFullscreenExits: eventTypes['fullscreen_exit'] || 0,
        totalKeyboardViolations: eventTypes['keyboard_violation'] || 0,
        suspiciousActivityTotal: criticalViolations
      };

      return res.json({
        assessment: {
          id: assessment.id,
          title: assessment.title,
          type: assessment.type,
          duration: assessment.duration,
          totalMarks: assessment.totalMarks,
          totalQuestions: assessment.totalQuestions
        },
        analytics: {
          totalCandidates,
          completedCandidates,
          averageScore: Math.round(averageScore * 100) / 100,
          averageTime: Math.round(averageTime),
          passRate: Math.round(passRate * 100) / 100,
          scoreDistribution,
          topPerformers
        },
        proctoring: {
          totalViolations,
          criticalViolations,
          warningViolations,
          minorViolations,
          riskLevels,
          eventTypes,
          behaviorInsights,
          monitoredCandidates: proctoringSessions.length
        }
      });
    } catch (error) {
      console.error('Error fetching assessment analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch assessment analytics' });
    }
  }
} 
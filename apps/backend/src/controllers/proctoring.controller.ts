import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logProctoringEvent = async (req: Request, res: Response) => {
  try {
    const { candidateId, eventType, details, timestamp } = req.body;
    
    console.log('Proctoring Event:', req.body);
    
    // Determine severity based on event type
    let severity = 'minor';
    let description = '';
    
    switch (eventType) {
      case 'tab_switch':
        severity = 'warning';
        description = 'Candidate switched browser tab';
        break;
      case 'fullscreen_exit':
        severity = 'warning';
        description = 'Candidate exited fullscreen mode';
        break;
      case 'face_not_detected':
        severity = 'critical';
        description = 'Face not detected in webcam feed';
        break;
      case 'multiple_faces':
        severity = 'critical';
        description = 'Multiple faces detected';
        break;
      case 'copy_paste':
        severity = 'minor';
        description = 'Copy-paste action detected';
        break;
      case 'right_click':
        severity = 'minor';
        description = 'Right-click action detected';
        break;
      case 'keyboard_shortcut':
        severity = 'warning';
        description = 'Suspicious keyboard shortcut used';
        break;
      default:
        description = `Unknown proctoring event: ${eventType}`;
    }

    // Find candidate using external candidateId (like CAND1751794629720WO1M)
    const credential = await prisma.credential.findFirst({
      where: { candidateId: candidateId }
    });

    if (!credential) {
      console.warn(`No credential found for candidateId: ${candidateId}`);
      return res.json({ success: true, warning: 'Candidate not found' });
    }

    // Find candidate using email from credential
    const candidate = await prisma.candidate.findFirst({
      where: { email: credential.email }
    });

    if (!candidate) {
      console.warn(`No candidate found for email: ${credential.email}`);
      return res.json({ success: true, warning: 'Candidate not found' });
    }

    // Store the proctoring event
    const proctoringEvent = await prisma.proctoringEvent.create({
      data: {
        candidateId: candidate.id, // Use internal database ID
        assessmentId: candidate.assessmentId,
        eventType,
        severity,
        description,
        metadata: details || {},
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    });

    // Update or create proctoring session
    const existingSession = await prisma.proctoringSession.findUnique({
      where: { candidateId: candidate.id }
    });

    if (existingSession) {
      // Update violation counts
      const updates: any = { totalViolations: { increment: 1 } };
      
      if (severity === 'critical') updates.criticalViolations = { increment: 1 };
      else if (severity === 'warning') updates.warningViolations = { increment: 1 };
      else if (severity === 'minor') updates.minorViolations = { increment: 1 };

      // Calculate risk level
      const newTotalViolations = existingSession.totalViolations + 1;
      const newCriticalViolations = existingSession.criticalViolations + (severity === 'critical' ? 1 : 0);
      
      let riskLevel = 'low';
      if (newCriticalViolations >= 2 || newTotalViolations >= 8) {
        riskLevel = 'high';
      } else if (newCriticalViolations >= 1 || newTotalViolations >= 4) {
        riskLevel = 'medium';
      }

      updates.riskLevel = riskLevel;

      await prisma.proctoringSession.update({
        where: { candidateId: candidate.id },
        data: updates
      });
    } else {
      // Create new session
      const criticalViolations = severity === 'critical' ? 1 : 0;
      const warningViolations = severity === 'warning' ? 1 : 0;
      const minorViolations = severity === 'minor' ? 1 : 0;
      
      let riskLevel = 'low';
      if (criticalViolations >= 2) riskLevel = 'high';
      else if (criticalViolations >= 1) riskLevel = 'medium';

      await prisma.proctoringSession.create({
        data: {
          candidateId: candidate.id,
          assessmentId: candidate.assessmentId,
          totalViolations: 1,
          criticalViolations,
          warningViolations,
          minorViolations,
          riskLevel
        }
      });
    }

    res.json({ success: true, eventId: proctoringEvent.id });
  } catch (error) {
    console.error('Error logging proctoring event:', error);
    res.json({ success: true, error: 'Failed to log event but continuing' });
  }
};

export const uploadProctoringMedia = async (req: Request, res: Response) => {
  // Save media to storage (for now, just log to console)
  console.log('Proctoring Media:', req.body);
  res.json({ success: true });
};

export const getProctoringEvents = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.query;
    
    if (!assessmentId) {
      return res.status(400).json({ error: 'Assessment ID is required' });
    }

    const events = await prisma.proctoringEvent.findMany({
      where: { assessmentId: assessmentId as string },
      include: {
        candidate: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Limit to recent 100 events
    });

    // Transform the data to match frontend interface
    const transformedEvents = events.map(event => ({
      id: event.id,
      candidateId: event.candidateId,
      candidateName: event.candidate.name,
      candidateEmail: event.candidate.email,
      eventType: event.eventType,
      severity: event.severity,
      description: event.description || '',
      timestamp: event.timestamp.toISOString(),
      metadata: event.metadata
    }));
    
    res.json(transformedEvents);
  } catch (error) {
    console.error('Error getting proctoring events:', error);
    res.status(500).json({ error: 'Failed to get proctoring events' });
  }
};

export const getCandidateViolations = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.query;
    
    if (!assessmentId) {
      return res.status(400).json({ error: 'Assessment ID is required' });
    }

    const sessions = await prisma.proctoringSession.findMany({
      where: { assessmentId: assessmentId as string },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
            status: true
          }
        }
      },
      orderBy: { totalViolations: 'desc' }
    });

    // Get last violation for each candidate
    const candidateViolations = await Promise.all(sessions.map(async (session) => {
      const lastEvent = await prisma.proctoringEvent.findFirst({
        where: { candidateId: session.candidateId },
        orderBy: { timestamp: 'desc' }
      });

      return {
        candidateId: session.candidateId,
        name: session.candidate.name,
        email: session.candidate.email,
        status: session.candidate.status,
        totalViolations: session.totalViolations,
        criticalViolations: session.criticalViolations,
        warningViolations: session.warningViolations,
        minorViolations: session.minorViolations,
        lastViolation: lastEvent ? lastEvent.timestamp.toISOString() : null,
        riskLevel: session.riskLevel
      };
    }));
    
    res.json(candidateViolations);
  } catch (error) {
    console.error('Error getting candidate violations:', error);
    res.status(500).json({ error: 'Failed to get candidate violations' });
  }
}; 
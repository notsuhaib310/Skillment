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

    // Update or create proctoring session using upsert to avoid race conditions
    const currentSession = await prisma.proctoringSession.findUnique({
      where: { candidateId: candidate.id }
    });

    // Calculate increments based on severity
    const criticalIncrement = severity === 'critical' ? 1 : 0;
    const warningIncrement = severity === 'warning' ? 1 : 0;
    const minorIncrement = severity === 'minor' ? 1 : 0;

    // Calculate new totals for risk level calculation
    const newTotalViolations = (currentSession?.totalViolations || 0) + 1;
    const newCriticalViolations = (currentSession?.criticalViolations || 0) + criticalIncrement;
    
    let riskLevel = 'low';
    if (newCriticalViolations >= 2 || newTotalViolations >= 8) {
      riskLevel = 'high';
    } else if (newCriticalViolations >= 1 || newTotalViolations >= 4) {
      riskLevel = 'medium';
    }

    // Use upsert to atomically update or create the session
    await prisma.proctoringSession.upsert({
      where: { candidateId: candidate.id },
      update: {
        totalViolations: { increment: 1 },
        criticalViolations: { increment: criticalIncrement },
        warningViolations: { increment: warningIncrement },
        minorViolations: { increment: minorIncrement },
        riskLevel: riskLevel,
        updatedAt: new Date()
      },
      create: {
        candidateId: candidate.id,
        assessmentId: candidate.assessmentId,
        totalViolations: 1,
        criticalViolations: criticalIncrement,
        warningViolations: warningIncrement,
        minorViolations: minorIncrement,
        riskLevel: riskLevel
      }
    });

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
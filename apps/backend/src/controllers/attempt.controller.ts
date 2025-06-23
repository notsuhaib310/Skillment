import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Assign assessment to candidates
export const assignAssessment = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { candidates } = req.body; // [{name, email, ...}]
    const created = [];
    for (const candidate of candidates) {
      const existing = await prisma.candidate.findFirst({
        where: { email: candidate.email, assessmentId },
      });
      if (!existing) {
        const c = await prisma.candidate.create({
          data: { ...candidate, assessmentId, status: 'invited' },
        });
        created.push(c);
      }
    }
    return res.status(201).json({ created });
  } catch (error) {
    console.error('Error assigning assessment:', error);
    return res.status(500).json({ error: 'Failed to assign assessment' });
  }
};

// Candidate starts an attempt
export const startAttempt = async (req: Request, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { candidateId } = req.body;
    // Mark candidate as started
    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'started', startedAt: new Date() },
    });
    return res.json(candidate);
  } catch (error) {
    console.error('Error starting attempt:', error);
    return res.status(500).json({ error: 'Failed to start attempt' });
  }
};

// Candidate submits answers
export const submitAttempt = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { answers, score, timeSpent } = req.body;
    // Mark candidate as submitted
    const candidate = await prisma.candidate.update({
      where: { id: attemptId },
      data: {
        status: 'submitted',
        answers,
        score,
        timeSpent,
        submittedAt: new Date(),
      },
    });
    return res.json(candidate);
  } catch (error) {
    console.error('Error submitting attempt:', error);
    return res.status(500).json({ error: 'Failed to submit attempt' });
  }
};

// Get attempt/result
export const getAttempt = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const candidate = await prisma.candidate.findUnique({
      where: { id: attemptId },
      include: { assessment: true },
    });
    if (!candidate) return res.status(404).json({ error: 'Attempt not found' });
    return res.json(candidate);
  } catch (error) {
    console.error('Error fetching attempt:', error);
    return res.status(500).json({ error: 'Failed to fetch attempt' });
  }
}; 
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List assigned assessments for a candidate (by email or userId)
export const listAssignedAssessments = async (req: Request, res: Response) => {
  try {
    const { email, userId } = req.query;
    const where: any = {};
    if (email) where.email = email;
    if (userId) where.userId = userId;
    const candidates = await prisma.candidate.findMany({
      where,
      include: { assessment: { include: { questions: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(candidates);
  } catch (error) {
    console.error('Error listing assigned assessments:', error);
    return res.status(500).json({ error: 'Failed to list assigned assessments' });
  }
};

// Get assessment details for candidate
export const getCandidateAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { assessment: { include: { questions: true } } },
    });
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    return res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate assessment:', error);
    return res.status(500).json({ error: 'Failed to fetch candidate assessment' });
  }
};

// Get attempt/result for candidate
export const getCandidateAttempt = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { assessment: true },
    });
    if (!candidate) return res.status(404).json({ error: 'Not found' });
    return res.json(candidate);
  } catch (error) {
    console.error('Error fetching candidate attempt:', error);
    return res.status(500).json({ error: 'Failed to fetch candidate attempt' });
  }
}; 
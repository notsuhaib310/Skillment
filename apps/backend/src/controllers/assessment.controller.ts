import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  AssessmentWithRelations,
  CreateAssessmentInput,
  UpdateAssessmentInput,
  AssessmentListFilters,
  AssessmentStats,
  AssessmentStatus,
  CandidateStatus,
} from '../types/assessment';

const prisma = new PrismaClient();

// Helper function to build where clause for assessment listing
const buildAssessmentWhere = (filters: AssessmentListFilters) => {
  const where: any = {};

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { tags: { hasSome: [filters.search] } },
    ];
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  return where;
};

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const data: CreateAssessmentInput = req.body;
    
    // Validate input
    if (!data.title || !data.type || !data.duration || !data.totalMarks || !data.totalQuestions || !data.createdById) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const assessment = await prisma.assessment.create({
      data: {
        ...data,
        status: 'draft',
        attemptLimit: data.attemptLimit || 1,
        showResults: data.showResults !== false, // default to true
        enableProctoring: data.enableProctoring || false,
        randomizeQuestions: data.randomizeQuestions || false,
        tags: data.tags || [],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Create analytics entry
    await prisma.assessmentAnalytics.create({
      data: {
        assessmentId: assessment.id,
        totalCandidates: 0,
        completedCandidates: 0,
        averageScore: 0,
        completionRate: 0,
      },
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
};

export const getAssessments = async (req: Request, res: Response) => {
  try {
    const filters: AssessmentListFilters = {
      search: req.query.search as string,
      status: req.query.status as AssessmentStatus,
      type: req.query.type as any,
      createdById: req.query.createdById as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const where = buildAssessmentWhere(filters);
    const skip = (filters.page! - 1) * filters.limit!;

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              candidates: true,
              questions: true,
            },
          },
        },
      }),
      prisma.assessment.count({ where }),
    ]);

    res.json({
      data: assessments,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit!),
      },
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};

export const getAssessmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        questions: true,
        analytics: true,
        _count: {
          select: {
            candidates: true,
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
};

export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateAssessmentInput = req.body;

    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
};

export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete related records first
    await prisma.$transaction([
      prisma.assessmentAnalytics.deleteMany({ where: { assessmentId: id } }),
      prisma.question.deleteMany({ where: { assessmentId: id } }),
      prisma.candidate.deleteMany({ where: { assessmentId: id } }),
      prisma.assessment.delete({ where: { id } }),
    ]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
};

export const getAssessmentStats = async (req: Request, res: Response) => {
  try {
    const { createdById } = req.query;
    
    const where: any = {};
    if (createdById) {
      where.createdById = createdById as string;
    }

    const [
      totalAssessments,
      liveAssessments,
      draftAssessments,
      assessmentsWithCandidates,
    ] = await Promise.all([
      prisma.assessment.count({ where }),
      prisma.assessment.count({ where: { ...where, status: 'live' } }),
      prisma.assessment.count({ where: { ...where, status: 'draft' } }),
      prisma.assessment.findMany({
        where,
        include: {
          _count: {
            select: { candidates: true },
          },
        },
      }),
    ]);

    const totalCandidates = assessmentsWithCandidates.reduce(
      (sum, assessment) => sum + assessment._count.candidates,
      0
    );

    const stats: AssessmentStats = {
      totalAssessments,
      liveAssessments,
      draftAssessments,
      totalCandidates,
      averageScore: 0, // This would require more complex calculation
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching assessment stats:', error);
    res.status(500).json({ error: 'Failed to fetch assessment stats' });
  }
};

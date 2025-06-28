import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import type {
  CreateAssessmentInput,
  UpdateAssessmentInput,
  AssessmentListFilters,
  AssessmentStatus,
  AssessmentStats,
  AssessmentType,
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

export const createAssessment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { questions, ...assessmentData } = req.body;
    // Debug log to help diagnose Prisma Client issues
    console.log('prisma.assessment keys:', Object.keys(prisma.assessment));
    console.log('Assessment data:', {
      ...assessmentData,
      status: 'draft',
      attemptLimit: req.body.attemptLimit || 1,
      showResults: req.body.showResults !== false,
      enableProctoring: req.body.enableProctoring || false,
      randomizeQuestions: req.body.randomizeQuestions || false,
      randomizeOptions: req.body.randomizeOptions || false,
      allowBackNavigation: req.body.allowBackNavigation ?? true,
      timeWarnings: req.body.timeWarnings ?? true,
      autoSubmit: req.body.autoSubmit ?? true,
      warningTimes: req.body.warningTimes,
      webcamMonitoring: req.body.webcamMonitoring || false,
      screenRecording: req.body.screenRecording || false,
      tabSwitchDetection: req.body.tabSwitchDetection || false,
      copyPasteDetection: req.body.copyPasteDetection || false,
      rightClickDisable: req.body.rightClickDisable || false,
      fullscreenMode: req.body.fullscreenMode || false,
      idVerification: req.body.idVerification || false,
      environmentCheck: req.body.environmentCheck || false,
      suspiciousActivityThreshold: req.body.suspiciousActivityThreshold,
      warningBeforeFlagging: req.body.warningBeforeFlagging ?? true,
      videoQuality: req.body.videoQuality,
      recordingFrequency: req.body.recordingFrequency,
      dataRetention: req.body.dataRetention,
      autoDeleteAfter: req.body.autoDeleteAfter,
      tags: req.body.tags || [],
      createdBy: { connect: { id: req.user?.id } },
    });
    // Require authentication for assessment creation
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required to create assessment' });
    }
    if (!req.user.orgId) {
      return res.status(400).json({ error: 'User must belong to an organization to create an assessment' });
    }
    const creatorId = req.user.id;
    const assessment = await prisma.assessment.create({
      data: {
        ...assessmentData,
        status: 'draft',
        attemptLimit: req.body.attemptLimit || 1,
        showResults: req.body.showResults !== false,
        enableProctoring: req.body.enableProctoring || false,
        randomizeQuestions: req.body.randomizeQuestions || false,
        randomizeOptions: req.body.randomizeOptions || false,
        allowBackNavigation: req.body.allowBackNavigation ?? true,
        timeWarnings: req.body.timeWarnings ?? true,
        autoSubmit: req.body.autoSubmit ?? true,
        warningTimes: req.body.warningTimes,
        webcamMonitoring: req.body.webcamMonitoring || false,
        screenRecording: req.body.screenRecording || false,
        tabSwitchDetection: req.body.tabSwitchDetection || false,
        copyPasteDetection: req.body.copyPasteDetection || false,
        rightClickDisable: req.body.rightClickDisable || false,
        fullscreenMode: req.body.fullscreenMode || false,
        idVerification: req.body.idVerification || false,
        environmentCheck: req.body.environmentCheck || false,
        suspiciousActivityThreshold: req.body.suspiciousActivityThreshold,
        warningBeforeFlagging: req.body.warningBeforeFlagging ?? true,
        videoQuality: req.body.videoQuality,
        recordingFrequency: req.body.recordingFrequency,
        dataRetention: req.body.dataRetention,
        autoDeleteAfter: req.body.autoDeleteAfter,
        tags: req.body.tags || [],
        createdBy: { connect: { id: creatorId } },
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
    // Bulk create questions if provided
    let createdQuestions = [];
    if (questions.length > 0) {
      createdQuestions = await Promise.all(
        questions.map((q, idx) =>
          prisma.question.create({
            data: {
              ...q,
              assessmentId: assessment.id,
              order: q.order ?? idx + 1,
            },
          })
        )
      );
    }
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
    return res.status(201).json({ ...assessment, questions: createdQuestions });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return res.status(500).json({ error: 'Failed to create assessment' });
  }
};

export const getAssessmentById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Remove orgId check for broader access
    // const orgId = req.orgId;
    // if (!orgId) {
    //   return res.status(401).json({ error: 'Organization access required' });
    // }

    const assessment = await prisma.assessment.findFirst({
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

    return res.json(assessment);
  } catch (error) {
    console.error('Error fetching assessment:', error);
    return res.status(500).json({ error: 'Failed to fetch assessment' });
  }
};

export const getAssessments = async (req: Request, res: Response) => {
  try {
    // Get organization ID from authenticated user (optional)
    const orgId = req.orgId;
    console.log('getAssessments orgId:', orgId);
    // Build where clause for organization filtering
    let where = buildAssessmentWhere({
      search: req.query.search as string,
      status: req.query.status as AssessmentStatus,
      type: req.query.type as AssessmentType,
    });
    if (orgId) {
      where = {
        ...where,
        createdBy: { orgId },
      };
    }
    console.log('getAssessments where:', JSON.stringify(where));
    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            orgId: true,
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
      orderBy: { createdAt: 'desc' },
    });
    console.log('getAssessments found:', assessments.length);
    return res.json(assessments);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};

export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateAssessmentInput = req.body;

    // Get organization ID from authenticated user
    const orgId = req.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Organization access required' });
    }

    // First check if assessment exists and belongs to user's organization
    const existingAssessment = await prisma.assessment.findFirst({
      where: { 
        id,
        createdBy: {
          orgId: orgId
        }
      }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

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

    return res.json(assessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    return res.status(500).json({ error: 'Failed to update assessment' });
  }
};

export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get organization ID from authenticated user
    const orgId = req.orgId;
    if (!orgId) {
      return res.status(401).json({ error: 'Organization access required' });
    }

    // First check if assessment exists and belongs to user's organization
    const existingAssessment = await prisma.assessment.findFirst({
      where: { 
        id,
        createdBy: {
          orgId: orgId
        }
      }
    });

    if (!existingAssessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    await prisma.assessment.delete({
      where: { id },
    });

    return res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return res.status(500).json({ error: 'Failed to delete assessment' });
  }
};

export const getAssessmentStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const stats = {
      totalAssessments: 0,
      liveAssessments: 0,
      draftAssessments: 0,
      totalCandidates: 0,
      averageScore: 0,
    }

    const [totalAssessments, liveAssessments, draftAssessments, totalCandidates, averageScore] = await Promise.all([
      prisma.assessment.count(),
      prisma.assessment.count({ where: { status: 'live' } }),
      prisma.assessment.count({ where: { status: 'draft' } }),
      prisma.candidate.count(),
      prisma.candidate.aggregate({
        _avg: {
          score: true,
        },
      }),
    ])

    stats.totalAssessments = totalAssessments
    stats.liveAssessments = liveAssessments
    stats.draftAssessments = draftAssessments
    stats.totalCandidates = totalCandidates
    stats.averageScore = averageScore._avg.score || 0

    return res.json(stats)
  } catch (error) {
    console.error('Error fetching assessment stats:', error)
    return res.status(500).json({ error: 'Failed to fetch assessment stats' })
  }
}

export const getCandidateCredentialsStatus = async (req: Request, res: Response) => {
  try {
    const { id: assessmentId } = req.params;
    // Get all candidates for this assessment
    const candidates = await prisma.candidate.findMany({
      where: { assessmentId },
      select: { id: true, name: true, email: true },
    });
    // Get credentials for these candidates
    const credentials = await prisma.credential.findMany({
      where: { candidateId: { in: candidates.map((c) => c.id) } },
      select: { candidateId: true },
    });
    // Get email logs for these candidates (sent credentials)
    const logs = await prisma.emailLog.findMany({
      where: {
        candidateId: { in: candidates.map((c) => c.id) },
        status: { in: ["sent", "delivered", "opened", "clicked"] },
      },
      select: { candidateId: true },
    });
    const sentIds = new Set(logs.map((l) => l.candidateId));
    const result = candidates.map((c) => ({
      candidateId: c.id,
      name: c.name,
      email: c.email,
      credentialSent: sentIds.has(c.id),
    }));
    return res.json(result);
  } catch (error) {
    console.error("Error fetching candidate credentials status:", error);
    return res.status(500).json({ error: "Failed to fetch candidate credentials status" });
  }
};

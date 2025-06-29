import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

interface ParticipantWithScores {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  tags: string[];
  location: string | null;
  organization: string;
  createdAt: Date;
  updatedAt: Date;
  assessmentScores: {
    id: string;
    score: number;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    assessment: {
      id: string;
      title: string;
      totalMarks: number;
    };
  }[];
  activityLogs: { id: string; createdAt: Date }[];
}

const prisma = new PrismaClient();

interface AddParticipantRequest {
  name: string;
  email: string;
  phone?: string;
  tags?: string[];
  location?: string;
  organization: string;
  assessmentIds?: string[];
}

// Helper function to generate Gravatar URL
const getGravatarUrl = (email: string) => {
  const hash = crypto.createHash('md5').update(email.trim().toLowerCase()).digest('hex');
  // 'd=identicon' is a default image if no Gravatar exists for the email
  return `https://www.gravatar.com/avatar/${hash}?d=identicon`;
};

export const getParticipants = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const skip = (page - 1) * limit;

    // Get organization ID from authenticated user
    // const orgId = req.orgId;
    // if (!orgId) {
    //   return res.status(401).json({ 
    //     success: false, 
    //     error: 'Organization access required' 
    //   });
    // }

    const where: any = {};
    // Remove organization filter for public access
    // where.organization = orgId; // Filter by organization
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
      ];
      if (search.match(/^\d+$/)) {
        where.OR.push({ phone: { contains: search } });
      }
    }

    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' as const },
        include: {
          assessmentScores: {
            include: {
              assessment: {
                select: {
                  id: true,
                  title: true,
                  totalMarks: true,
                },
              },
            },
          },
          activityLogs: {
            select: {
              id: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc' as const,
            },
            take: 1,
          },
        },
      }) as unknown as ParticipantWithScores[],
      prisma.participant.count({ where }),
    ]);

    // Transform participants to include additional fields
    const transformedParticipants = participants.map(participant => {
      const completedAssessments = participant.assessmentScores.filter(
        score => score.status === 'completed' && score.score >= 70
      ).length;
      
      const ongoingAssessments = participant.assessmentScores.filter(
        score => score.status === 'in_progress' || (score.status === 'completed' && score.score < 70)
      ).length;
      
      const notStartedAssessments = participant.assessmentScores.filter(
        score => score.status === 'not_started'
      ).length;
      
      const totalAssessments = participant.assessmentScores.length;

      // Calculate average score
      const averageScore = participant.assessmentScores.length > 0
        ? Math.round(
            participant.assessmentScores.reduce((sum, score) => sum + score.score, 0) / 
            participant.assessmentScores.length
          )
        : 0;

      // Determine performance based on average score
      let performance: "excellent" | "good" | "average" | "pending" = "pending";
      if (averageScore >= 90) performance = "excellent";
      else if (averageScore >= 70) performance = "good";
      else if (averageScore > 0) performance = "average";

      // Determine status based on assessment completion
      let status: "completed" | "ongoing" | "not-started" = "not-started";
      if (completedAssessments > 0) status = "completed";
      else if (ongoingAssessments > 0) status = "ongoing";

      // Get last activity from assessment scores and activity logs
      let lastActivity: string | undefined;
      const allActivities = [
        ...participant.assessmentScores
          .filter(score => score.completedAt)
          .map(score => new Date(score.completedAt as Date)),
        ...participant.activityLogs.map(log => new Date(log.createdAt)),
      ];
      
      if (allActivities.length > 0) {
        lastActivity = new Date(Math.max(...allActivities.map(d => d.getTime()))).toISOString();
      }

      return {
        ...participant,
        status,
        score: averageScore,
        performance,
        lastActivity,
        completedAssessments,
        ongoingAssessments,
        notStartedAssessments,
        totalAssessments,
        avatar: getGravatarUrl(participant.email),
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        participants: transformedParticipants,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const addParticipant = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      tags = [], 
      location, 
      assessmentIds = []
    } = req.body as Omit<AddParticipantRequest, 'organization'>;

    // Get organization ID from authenticated user
    // const orgId = req.orgId;
    // if (!orgId) {
    //   return res.status(401).json({ 
    //     success: false, 
    //     error: 'Organization access required' 
    //   });
    // }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and email are required' 
      });
    }

    // Check if participant with the same email already exists in this organization
    const existingParticipant = await prisma.participant.findFirst({
      where: { 
        email,
        // organization: orgId
      },
    });

    if (existingParticipant) {
      return res.status(400).json({ 
        success: false, 
        error: 'Participant with this email already exists in your organization' 
      });
    }

    // Start a transaction to ensure data consistency
    const participant = await prisma.$transaction(async (tx: any) => {
      // Create the participant
      const createdParticipant = await tx.participant.create({
        data: {
          name,
          email,
          phone: phone || null,
          tags,
          location: location || null,
          // organization: orgId, // Use orgId from authenticated user
        },
      });

      // Create assessment scores for the participant if assessmentIds are provided
      if (assessmentIds.length > 0) {
        await tx.participantScore.createMany({
          data: assessmentIds.map((assessmentId: string) => ({
            participantId: createdParticipant.id,
            assessmentId,
            score: 0,
            status: 'not_started',
          })),
          skipDuplicates: true,
        });
      }

      return createdParticipant;
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        participantId: participant.id,
        activity: 'participant_created',
        details: `Participant ${name} was created`,
      },
    });

    // Get the created participant with all relations
    const participantWithRelations = await prisma.participant.findUnique({
      where: { id: participant.id },
      include: {
        assessmentScores: {
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                totalMarks: true,
              },
            },
          },
        },
        activityLogs: {
          select: {
            id: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!participantWithRelations) {
      throw new Error('Failed to fetch created participant');
    }

    return res.status(201).json({
      success: true,
      data: {
        ...participantWithRelations,
        avatar: getGravatarUrl(participantWithRelations.email),
      },
    });
  } catch (error: any) {
    console.error('Error adding participant:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getParticipant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get organization ID from authenticated user
    // const orgId = req.orgId;
    // if (!orgId) {
    //   return res.status(401).json({ 
    //     success: false, 
    //     error: 'Organization access required' 
    //   });
    // }

    const participant = await prisma.participant.findFirst({
      where: { 
        id,
        // organization: orgId // Filter by organization
      },
      include: {
        assessmentScores: {
          include: {
            assessment: {
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                totalMarks: true,
              },
            },
          },
          orderBy: {
            completedAt: 'desc',
          },
        },
        activityLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    }) as unknown as ParticipantWithScores;

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found' });
    }

    // Calculate assessment statistics
    const completedScores = participant.assessmentScores.filter(
      score => score.status === 'completed'
    );
    
    const totalAssessments = participant.assessmentScores.length;
    const completedAssessments = completedScores.length;
    const ongoingAssessments = participant.assessmentScores.filter(
      score => score.status === 'in_progress' || (score.status === 'completed' && score.score < 70)
    ).length;
    const notStartedAssessments = participant.assessmentScores.filter(
      score => score.status === 'not_started'
    ).length;

    const averageScore = completedScores.length > 0
      ? Math.round(
          completedScores.reduce((sum: number, score) => sum + score.score, 0) / 
          completedScores.length
        )
      : 0;

    // Determine overall performance
    let performance: 'excellent' | 'good' | 'needs-improvement' | 'pending' = 'pending';
    if (averageScore >= 90) performance = 'excellent';
    else if (averageScore >= 70) performance = 'good';
    else if (averageScore > 0) performance = 'needs-improvement';

    // Determine participant status
    let status: 'completed' | 'ongoing' | 'not-started' = 'not-started';
    if (completedAssessments > 0) status = 'completed';
    else if (ongoingAssessments > 0) status = 'ongoing';

    // Get last activity from assessment scores and activity logs
    let lastActivity: string | undefined;
    const allActivities = [
      ...participant.assessmentScores
        .filter(score => score.completedAt)
        .map(score => new Date(score.completedAt as Date)),
      ...participant.activityLogs.map(log => new Date(log.createdAt)),
    ];
    
    if (allActivities.length > 0) {
      lastActivity = new Date(Math.max(...allActivities.map(d => d.getTime()))).toISOString();
    }

    // Transform assessment scores for the response
    const assessmentHistory = participant.assessmentScores.map(score => ({
      id: score.id,
      score: score.score,
      status: score.status,
      startedAt: score.startedAt,
      completedAt: score.completedAt,
      assessment: score.assessment,
      performance: score.status === 'completed' 
        ? score.score >= 90 
          ? 'excellent' 
          : score.score >= 70 
            ? 'good' 
            : 'needs-improvement'
        : 'in-progress',
    }));

    // Prepare the response
    const response = {
      ...participant,
      assessmentHistory,
      statistics: {
        totalAssessments,
        completedAssessments,
        ongoingAssessments,
        notStartedAssessments,
        averageScore,
      },
      status,
      performance,
      lastActivity,
      avatar: getGravatarUrl(participant.email),
    };

    return res.status(200).json({ success: true, data: response });
  } catch (error: any) {
    console.error('Error fetching participant by ID:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}; 
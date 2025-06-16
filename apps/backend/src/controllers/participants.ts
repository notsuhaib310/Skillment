import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

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

    const where: Prisma.ParticipantWhereInput = search ? {
      OR: [
        { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { phone: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ],
    } : {};

    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assessmentHistory: true,
          activityLogs: true,
        },
      }),
      prisma.participant.count({ where }),
    ]);

    // Transform participants to include additional fields
    const transformedParticipants = participants.map(participant => {
      const completedAssessments = participant.assessmentHistory.filter(a => a.score >= 70).length;
      const ongoingAssessments = participant.assessmentHistory.filter(a => a.score < 70 && a.score > 0).length;
      const notStartedAssessments = participant.assessmentHistory.filter(a => a.score === 0).length;
      const totalAssessments = participant.assessmentHistory.length;

      // Calculate average score
      const averageScore = totalAssessments > 0
        ? Math.round(participant.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / totalAssessments)
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

      // Calculate last activity
      let lastActivity: string | undefined;
      const allActivities = [
        ...participant.assessmentHistory.map(a => new Date(a.createdAt)),
        ...participant.activityLogs.map(l => new Date(l.createdAt))
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
    const { name, email, phone, tags, location, organization } = req.body;

    if (!name || !email || !organization) {
      return res.status(400).json({ success: false, error: 'Name, email, and organization are required.' });
    }

    // Check if participant with email already exists
    const existingParticipant = await prisma.participant.findUnique({
      where: { email },
    });

    if (existingParticipant) {
      return res.status(400).json({ success: false, error: 'Participant with this email already exists.' });
    }

    const newParticipant = await prisma.participant.create({
      data: {
        name,
        email,
        phone,
        tags: tags || [],
        location,
        organization,
      },
      include: {
        assessmentHistory: true,
        activityLogs: true,
      },
    });

    // Transform the new participant to include additional fields
    const transformedParticipant = {
      ...newParticipant,
      status: "not-started" as const,
      score: 0,
      performance: "pending" as const,
      completedAssessments: 0,
      ongoingAssessments: 0,
      notStartedAssessments: 0,
      totalAssessments: 0,
      avatar: getGravatarUrl(newParticipant.email),
    };

    return res.status(201).json({ success: true, data: transformedParticipant });
  } catch (error: any) {
    console.error('Error adding participant:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getParticipantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        assessmentHistory: true,
        activityLogs: true,
      },
    });

    if (!participant) {
      return res.status(404).json({ success: false, error: 'Participant not found.' });
    }

    // Transform participant to include additional fields
    const completedAssessments = participant.assessmentHistory.filter(a => a.score >= 70).length;
    const ongoingAssessments = participant.assessmentHistory.filter(a => a.score < 70 && a.score > 0).length;
    const notStartedAssessments = participant.assessmentHistory.filter(a => a.score === 0).length;
    const totalAssessments = participant.assessmentHistory.length;

    const averageScore = totalAssessments > 0
      ? Math.round(participant.assessmentHistory.reduce((sum, a) => sum + a.score, 0) / totalAssessments)
      : 0;

    let performance: "excellent" | "good" | "average" | "pending" = "pending";
    if (averageScore >= 90) performance = "excellent";
    else if (averageScore >= 70) performance = "good";
    else if (averageScore > 0) performance = "average";

    let status: "completed" | "ongoing" | "not-started" = "not-started";
    if (completedAssessments > 0) status = "completed";
    else if (ongoingAssessments > 0) status = "ongoing";

    // Calculate last activity
    let lastActivity: string | undefined;
    const allActivities = [
      ...participant.assessmentHistory.map(a => new Date(a.createdAt)),
      ...participant.activityLogs.map(l => new Date(l.createdAt))
    ];
    if (allActivities.length > 0) {
      lastActivity = new Date(Math.max(...allActivities.map(d => d.getTime()))).toISOString();
    }

    const transformedParticipant = {
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

    return res.status(200).json({ success: true, data: transformedParticipant });
  } catch (error: any) {
    console.error('Error fetching participant by ID:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}; 
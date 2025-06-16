import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Validation schemas
const createParticipantSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  tags: z.array(z.string()),
  location: z.string().optional(),
})

const updateParticipantSchema = createParticipantSchema.partial()

export const participantController = {
  // Get all participants with pagination and filters
  async getParticipants(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, status, batch } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      // Get current user's organization
      const userId = (req as any).user?.userId
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { orgName: true }
      })

      if (!user?.orgName) {
        return res.status(403).json({ error: "Organization not found" })
      }

      // Build where clause based on filters
      const where: any = {
        organization: user.orgName
      }
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: "insensitive" } },
          { email: { contains: search as string, mode: "insensitive" } },
          { tags: { hasSome: [search as string] } },
        ]
      }
      if (batch) {
        where.tags = { hasSome: [batch as string] }
      }

      // Get participants with their latest assessment
      const participants = await prisma.participant.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          assessmentHistory: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          activityLogs: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
      })

      // Get total count for pagination
      const total = await prisma.participant.count({ where })

      // Transform data to match frontend expectations
      const transformedParticipants = participants.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone || "",
        avatar: "/placeholder.svg?height=40&width=40",
        tags: p.tags,
        status: p.assessmentHistory[0]?.type || "not-started",
        score: p.assessmentHistory[0]?.score || 0,
        joinedDate: p.createdAt.toISOString().split("T")[0],
        lastActivity: p.activityLogs[0]?.createdAt.toISOString().split("T")[0] || "Never",
        assessments: p.assessmentHistory.length,
        location: p.location || "",
        completedAssessments: p.assessmentHistory.filter((a) => a.type === "completed").length,
        ongoingAssessments: p.assessmentHistory.filter((a) => a.type === "ongoing").length,
        notStartedAssessments: p.assessmentHistory.filter((a) => a.type === "not-started").length,
        performance: p.assessmentHistory[0]?.score >= 90 ? "excellent" : p.assessmentHistory[0]?.score >= 70 ? "good" : "average",
      }))

      res.json({
        participants: transformedParticipants,
        total,
        page: Number(page),
        limit: Number(limit),
      })
    } catch (error) {
      console.error("Error fetching participants:", error)
      res.status(500).json({ error: "Failed to fetch participants" })
    }
  },

  // Get a single participant by ID
  async getParticipant(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.userId
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { orgName: true }
      })

      if (!user?.orgName) {
        return res.status(403).json({ error: "Organization not found" })
      }

      const participant = await prisma.participant.findFirst({
        where: { 
          id,
          organization: user.orgName
        },
        include: {
          assessmentHistory: {
            orderBy: { createdAt: "desc" },
          },
          activityLogs: {
            orderBy: { createdAt: "desc" },
          },
        },
      })

      if (!participant) {
        return res.status(404).json({ error: "Participant not found" })
      }

      res.json(participant)
    } catch (error) {
      console.error("Error fetching participant:", error)
      res.status(500).json({ error: "Failed to fetch participant" })
    }
  },

  // Create a new participant
  async createParticipant(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { orgName: true }
      })

      if (!user?.orgName) {
        return res.status(403).json({ error: "Organization not found" })
      }

      const data = createParticipantSchema.parse(req.body)

      const participant = await prisma.participant.create({
        data: {
          ...data,
          organization: user.orgName,
          activityLogs: {
            create: {
              activity: "created",
              details: "Participant account created",
            },
          },
        },
        include: {
          activityLogs: true,
        },
      })

      res.status(201).json(participant)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error("Error creating participant:", error)
      res.status(500).json({ error: "Failed to create participant" })
    }
  },

  // Update a participant
  async updateParticipant(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.userId
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { orgName: true }
      })

      if (!user?.orgName) {
        return res.status(403).json({ error: "Organization not found" })
      }

      const data = updateParticipantSchema.parse(req.body)

      const participant = await prisma.participant.update({
        where: { 
          id,
          organization: user.orgName
        },
        data: {
          ...data,
          activityLogs: {
            create: {
              activity: "updated",
              details: "Participant information updated",
            },
          },
        },
        include: {
          activityLogs: true,
        },
      })

      res.json(participant)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors })
      }
      console.error("Error updating participant:", error)
      res.status(500).json({ error: "Failed to update participant" })
    }
  },

  // Delete a participant
  async deleteParticipant(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.userId
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { orgName: true }
      })

      if (!user?.orgName) {
        return res.status(403).json({ error: "Organization not found" })
      }

      await prisma.participant.delete({
        where: { 
          id,
          organization: user.orgName
        },
      })
      res.status(204).send()
    } catch (error) {
      console.error("Error deleting participant:", error)
      res.status(500).json({ error: "Failed to delete participant" })
    }
  },

  // Add assessment for a participant
  async addAssessment(req: Request, res: Response) {
    try {
      const { id } = req.params
      const userId = (req as any).user?.userId
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { orgName: true }
      })

      if (!user?.orgName) {
        return res.status(403).json({ error: "Organization not found" })
      }

      const { score, type, notes } = req.body

      const assessment = await prisma.assessment.create({
        data: {
          participantId: id,
          score,
          type,
          notes,
        },
      })

      // Add activity log
      await prisma.activityLog.create({
        data: {
          participantId: id,
          activity: "assessment_added",
          details: `New ${type} assessment added with score ${score}`,
        },
      })

      res.status(201).json(assessment)
    } catch (error) {
      console.error("Error adding assessment:", error)
      res.status(500).json({ error: "Failed to add assessment" })
    }
  },
} 
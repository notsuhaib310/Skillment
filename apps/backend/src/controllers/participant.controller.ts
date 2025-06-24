import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

type ApiResponse = Response<any, Record<string, any>>

const prisma = new PrismaClient()

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
    orgId: string
    orgName: string
  }
}

type ParticipantWithScores = {
  id: string
  name: string
  email: string
  phone: string | null
  tags: string[]
  location: string | null
  organization: string
  createdAt: Date
  updatedAt: Date
  assessmentScores: {
    id: string
    participantId: string
    assessmentId: string
    score: number
    status: string
    startedAt: Date | null
    completedAt: Date | null
    answers: any | null
    createdAt: Date
    updatedAt: Date
    assessment: {
      id: string
      title: string
    }
  }[]
  activityLogs: {
    createdAt: Date
  }[]
}

export class ParticipantController {
  // Get all participants with pagination and filters
  async getParticipants(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { page = 1, limit = 10, search, batch } = req.query
      const skip = (Number(page) - 1) * Number(limit)

      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      // Get user with organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      })

      if (!user?.organization) {
        return res.status(403).json({ error: "Organization not found" })
      }

      // Build where clause based on filters
      const where: any = {
        organization: user.organization.name
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
      const [participants, total] = await Promise.all([
        prisma.participant.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            assessmentScores: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: {
                assessment: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            },
            activityLogs: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.participant.count({ where })
      ])

      // Transform data to match frontend expectations
      const transformedParticipants = participants.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone || "",
        avatar: "/placeholder.svg?height=40&width=40",
        tags: p.tags,
        status: p.assessmentScores[0]?.status || "not-started",
        score: p.assessmentScores[0]?.score || 0,
        joinedDate: p.createdAt.toISOString().split("T")[0],
        lastActivity: p.activityLogs[0]?.createdAt.toISOString().split("T")[0] || "Never",
        assessments: p.assessmentScores.length,
        location: p.location || "",
        completedAssessments: p.assessmentScores.filter((a: any) => a.status === "completed").length,
        ongoingAssessments: p.assessmentScores.filter((a: any) => a.status === "in_progress").length,
        notStartedAssessments: p.assessmentScores.filter((a: any) => a.status === "not_started").length,
        performance: p.assessmentScores[0]?.score >= 90 ? "excellent" : p.assessmentScores[0]?.score >= 70 ? "good" : "average",
      }))

      return res.json({
        participants: transformedParticipants,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      })
    } catch (error) {
      console.error("Error fetching participants:", error)
      return res.status(500).json({ error: "Failed to fetch participants" })
    }
  }

  // Get a single participant by ID
  async getParticipant(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { id } = req.params
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      // Get user with organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      })

      if (!user?.organization) {
        return res.status(403).json({ error: "Organization not found" })
      }

      const participant = await prisma.participant.findFirst({
        where: { 
          id,
          organization: user.organization.name
        },
        include: {
          assessmentScores: {
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

      return res.json(participant)
    } catch (error) {
      console.error("Error fetching participant:", error)
      return res.status(500).json({ error: "Failed to fetch participant" })
    }
  }

  // Create a new participant
  async createParticipant(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { name, email, phone, tags, location } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      // Get user with organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true
        }
      })

      if (!user?.organization) {
        return res.status(400).json({ error: "User not associated with any organization" })
      }

      const existingParticipant = await prisma.participant.findUnique({
        where: { email: email }
      })

      if (existingParticipant) {
        return res.status(400).json({ error: "Participant with this email already exists" })
      }

      const participant = await prisma.participant.create({
        data: {
          name,
          email,
          phone,
          tags,
          location,
          organization: user.organization.name
        },
      })

      return res.status(201).json(participant)
    } catch (error) {
      console.error("Error creating participant:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // Update a participant
  async updateParticipant(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { id } = req.params
      const { name, email, phone, tags, location } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      // Get user with organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true
        }
      })

      if (!user?.organization) {
        return res.status(400).json({ error: "User not associated with any organization" })
      }

      const existingParticipant = await prisma.participant.findUnique({
        where: { id }
      })

      if (!existingParticipant) {
        return res.status(404).json({ error: "Participant not found" })
      }

      const participant = await prisma.participant.update({
        where: { 
          id,
          organization: user.organization.name
        },
        data: {
          name,
          email,
          phone,
          tags,
          location,
        },
      })

      return res.json(participant)
    } catch (error) {
      console.error("Error updating participant:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // Delete a participant
  async deleteParticipant(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { id } = req.params
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      // Get user with organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true
        }
      })

      if (!user?.organization) {
        return res.status(400).json({ error: "User not associated with any organization" })
      }

      const existingParticipant = await prisma.participant.findUnique({
        where: { id }
      })

      if (!existingParticipant) {
        return res.status(404).json({ error: "Participant not found" })
      }

      await prisma.participant.delete({
        where: { 
          id,
          organization: user.organization.name
        },
      })
      return res.status(204).json({ message: "Participant deleted successfully" })
    } catch (error) {
      console.error("Error deleting participant:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // Add assessment for a participant
  async addAssessment(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { id } = req.params
      const userId = req.user?.id
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      // Get user with organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true
        }
      })

      if (!user?.organization) {
        return res.status(400).json({ error: "User not associated with any organization" })
      }

      const { score, type, notes } = req.body

      const participant = await prisma.participant.findUnique({
        where: { id }
      })

      if (!participant) {
        return res.status(404).json({ error: "Participant not found" })
      }

      const assessment = await prisma.assessment.create({
        data: {
          title: `${participant.name}'s Assessment`,
          description: `Assessment for ${participant.name}`,
          type: type || "technical",
          status: "draft",
          duration: 60, // Default duration in minutes
          totalMarks: 100, // Default total marks
          totalQuestions: 0, // Will be updated when questions are added
          createdBy: {
            connect: { id: userId }
          },
          questions: {
            create: []
          }
        },
      });

      // Create participant score
      await prisma.participantScore.create({
        data: {
          participantId: id,
          assessmentId: assessment.id,
          score: score || 0,
          status: "not_started"
        }
      });

      // Add activity log
      await prisma.activityLog.create({
        data: {
          participantId: id,
          activity: "assessment_added",
          details: `New ${type} assessment added with score ${score}`,
        },
      })

      return res.status(201).json(assessment)
    } catch (error) {
      console.error("Error adding assessment:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  async createActivityLog(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { participantId } = req.params
      const { activity, details } = req.body
      const userId = req.user?.id

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" })
      }

      // Get user with organization
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          organization: true
        }
      })

      if (!user?.organization) {
        return res.status(400).json({ error: "User not associated with any organization" })
      }

      const activityLog = await prisma.activityLog.create({
        data: {
          participantId,
          activity,
          details,
        },
      })

      return res.status(201).json(activityLog)
    } catch (error) {
      console.error("Error creating activity log:", error)
      return res.status(500).json({ error: "Internal server error" })
    }
  }

  // Bulk action on participants
  async bulkAction(req: AuthenticatedRequest, res: Response): Promise<ApiResponse> {
    try {
      const { action, ids, assignBatch, updateFields } = req.body;
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
      if (!user?.organization) return res.status(403).json({ error: "Organization not found" });
      if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: "No participant IDs provided" });
      let result = null;
      if (action === "delete") {
        result = await prisma.participant.deleteMany({ where: { id: { in: ids }, organization: user.organization.name } });
      } else if (action === "assign" && assignBatch) {
        result = await prisma.participant.updateMany({ where: { id: { in: ids }, organization: user.organization.name }, data: { tags: { push: assignBatch } } });
      } else if (action === "update" && updateFields) {
        result = await prisma.participant.updateMany({ where: { id: { in: ids }, organization: user.organization.name }, data: updateFields });
      } else {
        return res.status(400).json({ error: "Invalid action or missing parameters" });
      }
      return res.json({ success: true, result });
    } catch (error) {
      console.error("Bulk action error:", error);
      return res.status(500).json({ error: "Bulk action failed" });
    }
  }

  // Export selected participants as CSV
  async exportParticipants(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      let ids: string[] = [];
      if (req.query.ids) {
        if (Array.isArray(req.query.ids)) {
          ids = req.query.ids as string[];
        } else if (typeof req.query.ids === 'string') {
          ids = req.query.ids.split(",");
        } else {
          ids = String(req.query.ids).split(",");
        }
      }
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
      if (!user?.organization) return res.status(403).json({ error: "Organization not found" });
      const where: any = { organization: user.organization.name };
      if (ids.length > 0) where.id = { in: ids };
      const participants = await prisma.participant.findMany({ where });
      // CSV header
      const header = ["id","name","email","phone","location","tags","createdAt","updatedAt"];
      const rows = participants.map(p => [p.id, p.name, p.email, p.phone || "", p.location || "", (p.tags||[]).join(";"), p.createdAt.toISOString(), p.updatedAt.toISOString()]);
      const csv = [header.join(","), ...rows.map(r => r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(","))].join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=participants.csv");
      return res.send(csv);
    } catch (error) {
      console.error("Export error:", error);
      return res.status(500).json({ error: "Export failed" });
    }
  }
} 
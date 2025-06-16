import { api } from "./api"

export interface Participant {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  organization: string
  tags: string[]
  createdAt: string
  updatedAt: string
  status: "completed" | "ongoing" | "not-started"
  score: number
  performance: "excellent" | "good" | "average" | "pending"
  avatar?: string
  lastActivity?: string
  completedAssessments: number
  ongoingAssessments: number
  notStartedAssessments: number
  totalAssessments: number
  assessmentHistory: Array<{
    id: string
    score: number
    type: string
    notes?: string
    createdAt: string
  }>
  activityLogs: Array<{
    id: string
    activity: string
    details?: string
    createdAt: string
  }>
}

export interface ParticipantsResponse {
  success: boolean
  data: {
    participants: Participant[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
}

export interface ParticipantResponse {
  success: boolean
  data: Participant
}

export const participantsApi = {
  // Get all participants with pagination and filters
  getParticipants: async (params: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ParticipantsResponse> => {
    const searchParams = new URLSearchParams()
    if (params.page) searchParams.append("page", params.page.toString())
    if (params.limit) searchParams.append("limit", params.limit.toString())
    if (params.search) searchParams.append("search", params.search)

    const response = await api.get(`/participants?${searchParams.toString()}`)
    return response.data
  },

  // Get a single participant
  getParticipant: async (id: string): Promise<ParticipantResponse> => {
    const response = await api.get(`/participants/${id}`)
    return response.data
  },

  // Create a new participant
  createParticipant: async (data: {
    name: string
    email: string
    phone?: string
    tags: string[]
    location?: string
    organization: string
  }): Promise<ParticipantResponse> => {
    const response = await api.post("/participants", data)
    return response.data
  },

  // Update a participant
  updateParticipant: async (
    id: string,
    data: {
      name?: string
      email?: string
      phone?: string
      tags?: string[]
      location?: string
      organization?: string
    }
  ): Promise<ParticipantResponse> => {
    const response = await api.put(`/participants/${id}`, data)
    return response.data
  },

  // Delete a participant
  deleteParticipant: async (id: string): Promise<void> => {
    await api.delete(`/participants/${id}`)
  },

  // Add assessment for a participant
  addAssessment: async (
    id: string,
    data: {
      score: number
      type: string
      notes?: string
    }
  ): Promise<ParticipantResponse> => {
    const response = await api.post(`/participants/${id}/assessments`, data)
    return response.data
  },
} 
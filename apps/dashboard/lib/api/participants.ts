import { api } from "./api"
import { getAuthHeaders } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

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
  avatar?: string
  lastActivity?: string
  activityLogs: Array<{
    id: string
    activity: string
    details?: string
    createdAt: string
  }>
  assessmentHistory?: Array<any>
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
    try {
      const response = await api.get(`/participants/${id}`)
      return response.data
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Throw a custom error for UI to handle
        throw new Error('AUTH_ERROR')
      }
      throw error
    }
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

  // Bulk action on participants (delete, assign, update)
  bulkAction: async (data: { action: string; ids: string[]; assignBatch?: string; updateFields?: any }): Promise<any> => {
    const response = await api.post("/participants/bulk", data)
    return response.data
  },

  // Export selected participants as CSV
  exportParticipants: async (ids: string[]): Promise<Blob> => {
    const params = ids.length > 0 ? `?ids=${ids.join(",")}` : "";
    const url = `${API_URL}/participants/export${params}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(getAuthHeaders() as Record<string, string>),
      },
    });
    if (!response.ok) {
      throw new Error("Failed to export participants");
    }
    return await response.blob();
  }
} 
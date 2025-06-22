import { getAuthHeaders } from './auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in"

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  }

  const response = await fetch(url, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Convenience methods for common HTTP methods
export const apiGet = (endpoint: string) => apiCall(endpoint, { method: 'GET' })
export const apiPost = (endpoint: string, data?: any) => 
  apiCall(endpoint, { 
    method: 'POST', 
    body: data ? JSON.stringify(data) : undefined 
  })
export const apiPut = (endpoint: string, data?: any) => 
  apiCall(endpoint, { 
    method: 'PUT', 
    body: data ? JSON.stringify(data) : undefined 
  })
export const apiDelete = (endpoint: string) => 
  apiCall(endpoint, { method: 'DELETE' })

// API endpoints for participants
export const participantsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    
    const query = searchParams.toString()
    return apiGet(`/api/participants${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiGet(`/api/participants/${id}`),
  create: (data: any) => apiPost('/api/participants', data),
}

// API endpoints for assessments
export const assessmentsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.type) searchParams.append('type', params.type)
    
    const query = searchParams.toString()
    return apiGet(`/api/assessments${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiGet(`/api/assessments/${id}`),
  create: (data: any) => apiPost('/api/assessments', data),
  update: (id: string, data: any) => apiPut(`/api/assessments/${id}`, data),
  delete: (id: string) => apiDelete(`/api/assessments/${id}`),
  getStats: () => apiGet('/api/assessments/stats'),
} 
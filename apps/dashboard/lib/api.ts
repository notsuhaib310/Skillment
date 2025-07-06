import { getAuthHeaders } from './auth'
import * as participantsApiModule from './api/participants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`
  
  const authHeaders = getAuthHeaders()
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    } as HeadersInit,
  }

  // Debug log for Authorization header
  console.log('API Request:', url)
  console.log('Authorization Header:', authHeaders.Authorization ? 'Present' : 'Missing')
  console.log('Token preview:', authHeaders.Authorization ? `${authHeaders.Authorization.substring(0, 30)}...` : 'None')
  console.log('Full Headers:', config.headers)

  try {
    const response = await fetch(url, config)
    
    console.log('Response Status:', response.status)
    
    if (!response.ok) {
      let errorData: any = {}
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` }
      }
      
      console.error('API Error:', errorData)
      
      // Handle authentication errors
      if (response.status === 401) {
        console.error('Authentication failed - redirecting to login')
        // Clear auth data and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('token')
          window.location.href = '/auth/login'
        }
      }
      
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('API Call Failed:', error)
    throw error
  }
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
  ...participantsApiModule.participantsApi,
  getAll: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    
    const query = searchParams.toString()
    return apiGet(`/participants${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiGet(`/participants/${id}`),
  create: (data: any) => apiPost('/participants', data),
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
    return apiGet(`/assessments${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiGet(`/assessments/${id}`),
  create: (data: any) => apiPost('/assessments', data),
  update: (id: string, data: any) => apiPut(`/assessments/${id}`, data),
  delete: (id: string) => apiDelete(`/assessments/${id}`),
  getStats: () => apiGet('/assessments/stats'),
}

// API endpoints for team management
export const teamApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    
    const query = searchParams.toString()
    return apiGet(`/team${query ? `?${query}` : ''}`)
  },
  getById: (id: string) => apiGet(`/team/${id}`),
  invite: (data: any) => apiPost('/team', data),
  update: (id: string, data: any) => apiPut(`/team/${id}`, data),
  remove: (id: string) => apiDelete(`/team/${id}`),
}

// API endpoints for questions
export const questionsApi = {
  getAll: (assessmentId: string) => apiGet(`/assessments/${assessmentId}/questions`),
  create: (assessmentId: string, data: any) => apiPost(`/assessments/${assessmentId}/questions`, data),
  update: (id: string, data: any) => apiPut(`/questions/${id}`, data),
  delete: (id: string) => apiDelete(`/questions/${id}`),
};

// API endpoints for candidate assignment
export const assignmentApi = {
  assign: (assessmentId: string, candidates: any[]) => apiPost(`/assessments/${assessmentId}/assign`, { candidates }),
};

// API endpoints for candidates
export const candidatesApi = {
  getAll: (assessmentId?: string) => {
    const query = assessmentId ? `?assessmentId=${assessmentId}` : ''
    return apiGet(`/admin/candidates${query}`)
  },
  allocate: (assessmentId: string, candidates: any[]) => 
    apiPost('/admin/candidates/allocate', { assessmentId, candidates }),
  getByAssessment: (assessmentId: string) => apiGet(`/admin/candidates?assessmentId=${assessmentId}`),
  login: (candidateId: string, password: string) => 
    apiPost('/candidates/login', { candidateId, password }),
  startAssessment: (id: string) => apiPost(`/admin/candidates/${id}/start`),
  sendEmail: (id: string) => apiPost(`/admin/candidates/${id}/send-email`),
  resetPassword: (id: string) => apiPost(`/admin/candidates/${id}/reset-password`),
  fixCredentialIds: () => apiPost('/admin/candidates/fix-credential-ids'),
}

// API endpoints for attempt flows
export const attemptApi = {
  start: (assessmentId: string, candidateId: string) => apiPost(`/assessments/${assessmentId}/attempt`, { candidateId }),
  submit: (attemptId: string, data: any) => apiPost(`/attempts/${attemptId}/submit`, data),
  get: (attemptId: string) => apiGet(`/attempts/${attemptId}`),
};

// API endpoints for proctoring
export const proctoringApi = {
  getEvents: (assessmentId: string) => apiGet(`/admin/proctoring/events?assessmentId=${assessmentId}`),
  getViolations: (assessmentId: string) => apiGet(`/admin/proctoring/violations?assessmentId=${assessmentId}`),
  logEvent: (event: any) => apiPost('/proctoring/event', event),
  uploadMedia: (media: any) => apiPost('/proctoring/media', media),
}; 
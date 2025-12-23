/**
 * Centralized API configuration for the candidate panel
 * This ensures all API calls use the correct backend URL
 */

// Get API URL from environment variable or default to localhost
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// API endpoints used by the candidate panel
export const API_ENDPOINTS = {
  // Authentication
  candidateLogin: `${API_URL}/api/candidates/login`,
  
  // Assessments
  candidateAssessments: `${API_URL}/api/candidates/assessments`,
  assessmentDetails: (candidateId: string) => `${API_URL}/api/candidates/assessments?candidateId=${encodeURIComponent(candidateId)}`,
  
  // Exam operations
  submitAssessment: `${API_URL}/api/candidates/submit-assessment`,
  
  // Proctoring
  proctoringEvent: `${API_URL}/api/proctoring/event`,
  proctoringMedia: `${API_URL}/api/proctoring/media`,
} as const

/**
 * Helper function to create API headers with authentication
 */
export function getApiHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Helper function to make authenticated API calls
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...getApiHeaders(token),
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

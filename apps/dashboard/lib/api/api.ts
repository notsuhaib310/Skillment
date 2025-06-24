import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios"
import { handleAuthError } from '../auth'

// const API_BASE_URL = 'http://localhost:5000/api'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"
// API response types
interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

interface Assessment {
  id: string
  title: string
  description: string
  type: string
  status: string
  duration: number
  totalMarks: number
  totalQuestions: number
  attemptLimit: number
  showResults: boolean
  enableProctoring: boolean
  randomizeQuestions: boolean
  randomizeOptions: boolean
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  createdById: string
  allowBackNavigation: boolean
  timeWarnings: boolean
  autoSubmit: true
  warningTimes: string
  webcamMonitoring: boolean
  screenRecording: boolean
  tabSwitchDetection: boolean
  copyPasteDetection: boolean
  rightClickDisable: boolean
  fullscreenMode: boolean
  idVerification: boolean
  environmentCheck: boolean
  suspiciousActivityThreshold: number
  warningBeforeFlagging: boolean
  videoQuality: string
  recordingFrequency: string
  dataRetention: string
  autoDeleteAfter: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  questions: Question[]
  candidates?: any[]
}

interface Question {
  id: string
  assessmentId: string
  question: string
  type: string
  options?: string[]
  correctAnswer?: string
  marks: number
  order: number
  hints: string[]
  explanation?: string
  difficulty?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface CreateAssessmentPayload {
  title: string
  description: string
  type: string
  duration: number
  totalMarks: number
  totalQuestions: number
  attemptLimit: number
  showResults: boolean
  enableProctoring: boolean
  randomizeQuestions: boolean
  randomizeOptions: boolean
  allowBackNavigation: boolean
  timeWarnings: boolean
  autoSubmit: boolean
  warningTimes: string
  webcamMonitoring: boolean
  screenRecording: boolean
  tabSwitchDetection: boolean
  copyPasteDetection: boolean
  rightClickDisable: boolean
  fullscreenMode: boolean
  idVerification: boolean
  environmentCheck: boolean
  suspiciousActivityThreshold: number
  warningBeforeFlagging: boolean
  videoQuality: string
  recordingFrequency: string
  dataRetention: string
  autoDeleteAfter: string
  tags: string[]
  questions: {
    question: string
    type: string
    options?: string[]
    correctAnswer?: string
    marks: number
    order: number
  }[]
}

// Helper to get token from localStorage or cookies
function getToken() {
  if (typeof window === 'undefined') return null;
  // Try localStorage first
  const localToken = localStorage.getItem('token');
  if (localToken) return localToken;
  // Fallback: Try cookies
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Get token from localStorage or cookies
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      
      // Handle authentication errors
      if (response.status === 401) {
        handleAuthError(errorData)
        throw new Error('Authentication failed - please log in again')
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Assessments API
export const assessmentsApi = {
  // Get all assessments
  async getAll(): Promise<ApiResponse<Assessment[]>> {
    return apiRequest<ApiResponse<Assessment[]>>('/assessments')
  },

  // Get assessment by ID
  async getById(id: string): Promise<Assessment> {
    return apiRequest<Assessment>(`/assessments/${id}`)
  },

  // Create new assessment
  async create(data: Partial<CreateAssessmentPayload>): Promise<Assessment> {
    // Transform the data to match backend expectations
    const payload: CreateAssessmentPayload = {
      title: data.title || '',
      description: data.description || '',
      type: data.type || 'mcq',
      duration: data.duration || 60,
      totalMarks: data.totalMarks || 100,
      totalQuestions: data.questions?.length || 0,
      attemptLimit: data.attemptLimit || 1,
      showResults: data.showResults ?? true,
      enableProctoring: data.enableProctoring ?? false,
      randomizeQuestions: data.randomizeQuestions ?? false,
      randomizeOptions: data.randomizeOptions ?? false,
      allowBackNavigation: data.allowBackNavigation ?? true,
      timeWarnings: data.timeWarnings ?? true,
      autoSubmit: data.autoSubmit ?? true,
      warningTimes: data.warningTimes || "30,15,5",
      webcamMonitoring: data.webcamMonitoring ?? false,
      screenRecording: data.screenRecording ?? false,
      tabSwitchDetection: data.tabSwitchDetection ?? false,
      copyPasteDetection: data.copyPasteDetection ?? false,
      rightClickDisable: data.rightClickDisable ?? false,
      fullscreenMode: data.fullscreenMode ?? false,
      idVerification: data.idVerification ?? false,
      environmentCheck: data.environmentCheck ?? false,
      suspiciousActivityThreshold: data.suspiciousActivityThreshold || 3,
      warningBeforeFlagging: data.warningBeforeFlagging ?? true,
      videoQuality: data.videoQuality || "720p",
      recordingFrequency: data.recordingFrequency || "continuous",
      dataRetention: data.dataRetention || "30 days",
      autoDeleteAfter: data.autoDeleteAfter || "after review",
      tags: data.tags || [],
      questions: (data.questions || []).map((q: any, index: number) => ({
        question: q.question || q.title || '',
        type: q.type || 'mcq',
        options: q.options || [],
        correctAnswer: q.correctAnswer || q.answer || '',
        marks: q.marks || 10,
        order: index + 1,
      })),
    }

    return apiRequest<Assessment>('/assessments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Update assessment
  async update(id: string, data: Partial<CreateAssessmentPayload>): Promise<Assessment> {
    return apiRequest<Assessment>(`/assessments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // Delete assessment
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/assessments/${id}`, {
      method: 'DELETE',
    })
  },

  // Archive assessment
  async archive(id: string): Promise<Assessment> {
    return apiRequest<Assessment>(`/assessments/${id}/archive`, {
      method: 'PATCH',
    })
  },
}

// Questions API
export const questionsApi = {
  // Get questions for an assessment
  async getAll(assessmentId: string): Promise<Question[]> {
    return apiRequest<Question[]>(`/assessments/${assessmentId}/questions`)
  },

  // Add question to assessment
  async create(assessmentId: string, question: Partial<Question>): Promise<Question> {
    return apiRequest<Question>(`/assessments/${assessmentId}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    })
  },

  // Update question
  async update(assessmentId: string, questionId: string, question: Partial<Question>): Promise<Question> {
    return apiRequest<Question>(`/assessments/${assessmentId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(question),
    })
  },

  // Delete question
  async delete(assessmentId: string, questionId: string): Promise<void> {
    return apiRequest<void>(`/assessments/${assessmentId}/questions/${questionId}`, {
      method: 'DELETE',
    })
  },
}

// Export types for use in components
export type { Assessment, Question, CreateAssessmentPayload, ApiResponse }

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies
})

// Add request interceptor for authentication
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Get token from localStorage or cookies (robust)
  let token = localStorage.getItem("auth_token") || localStorage.getItem("token");
  if (!token) {
    const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
    token = match ? decodeURIComponent(match[1]) : null;
  }
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      // BUT: Do NOT redirect for /participants/* endpoints, let the UI handle it
      const url = error.config?.url || '';
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/auth/login") &&
        !url.includes('/participants')
      ) {
        // Clear token
        localStorage.removeItem("auth_token")
        // Redirect to login
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  }
)

// Fetch all org participants (candidates)
export async function getAllParticipants() {
  return apiRequest<any>(`/participants`)
}

// Assign a candidate to an assessment
export async function assignCandidateToAssessment(participantId: string, assessmentId: string) {
  return apiRequest<any>(`/participants/${participantId}/assessments`, {
    method: 'POST',
    body: JSON.stringify({ assessmentId }),
  })
} 
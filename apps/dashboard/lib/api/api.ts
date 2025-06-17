import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in"

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies
})

// Add request interceptor for authentication
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Get token from localStorage if available
  const token = localStorage.getItem("auth_token")
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on the login page
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        // Clear token
        localStorage.removeItem("auth_token")
        // Redirect to login
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
) 
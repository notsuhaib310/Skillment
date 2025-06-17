import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in"

export const getAuthToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_token", token)
}

export const removeAuthToken = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_token")
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

export const login = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Login failed")
  }

  // Store token
  setAuthToken(data.token)
  return data
}

export const logout = () => {
  removeAuthToken()
} 
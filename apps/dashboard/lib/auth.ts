import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in"

export const getAuthToken = () => {
  if (typeof window === "undefined") return null
  
  // Try to get token from cookie first, then localStorage as fallback
  const cookiesArr = document.cookie.split(';')
  const tokenCookie = cookiesArr.find(cookie => cookie.trim().startsWith('token='))
  if (tokenCookie) {
    const token = tokenCookie.split('=')[1]
    console.log('Found token in cookie:', token ? `${token.substring(0, 20)}...` : 'Empty')
    return token
  }
  
  const authTokenCookie = cookiesArr.find(cookie => cookie.trim().startsWith('auth_token='))
  if (authTokenCookie) {
    const token = authTokenCookie.split('=')[1]
    console.log('Found auth_token in cookie:', token ? `${token.substring(0, 20)}...` : 'Empty')
    return token
  }
  
  const localToken = localStorage.getItem("auth_token") || localStorage.getItem("token")
  console.log('Found token in localStorage:', localToken ? `${localToken.substring(0, 20)}...` : 'None')
  
  return localToken
}

export const setAuthToken = (token: string) => {
  if (typeof window === "undefined") return
  // Set token in both cookie and localStorage for compatibility
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
  document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
  localStorage.setItem("auth_token", token)
  localStorage.setItem("token", token)
}

export const removeAuthToken = () => {
  if (typeof window === "undefined") return
  // Remove token from both cookie and localStorage
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  localStorage.removeItem("auth_token")
}

export const clearAllAuthData = () => {
  if (typeof window === "undefined") return
  // Clear all authentication-related data
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  localStorage.removeItem("auth_token")
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("organization")
  localStorage.removeItem("org_info")
}

export const getOrgInfo = () => {
  if (typeof window === "undefined") return null
  const orgInfo = localStorage.getItem("org_info")
  return orgInfo ? JSON.parse(orgInfo) : null
}

export const setOrgInfo = (orgInfo: any) => {
  if (typeof window === "undefined") return
  localStorage.setItem("org_info", JSON.stringify(orgInfo))
}

export const removeOrgInfo = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("org_info")
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

export const handleAuthError = (error: any) => {
  console.error('Authentication error:', error)
  clearAllAuthData()
  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/auth/login"
  }
}

export const login = async (email: string, password: string, organization: string) => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: 'include',
    body: JSON.stringify({ email, password, organization }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Login failed")
  }

  // Store token and organization info
  setAuthToken(data.token)
  setOrgInfo(data.organization)
  return data
}

export const logout = () => {
  removeAuthToken()
  removeOrgInfo()
} 
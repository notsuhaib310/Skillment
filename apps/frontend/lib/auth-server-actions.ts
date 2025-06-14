"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Register a new user
export async function register(userData: {
  firstName: string
  lastName: string
  email: string
  password: string
  orgName?: string
  orgType?: string
  orgSize?: string
}) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }

    return data
  } catch (error: any) {
    console.error("Registration error:", error)
    throw error
  }
}

// Login user
export async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    // Set cookie for both domains
    const cookieStore = cookies()
    cookieStore.set("auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : "localhost",
    })

    return {
      user: data.user,
      token: data.token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    }
  } catch (error: any) {
    console.error("Login error:", error)
    throw error
  }
}

// Logout user
export async function logout() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })
      cookieStore.delete("auth_token")
    }

    return { success: true }
  } catch (error: any) {
    console.error("Logout error:", error)
    throw error
  }
}

// Verify session
export async function verifySession() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return { success: false, message: "Not authenticated" }
    }

    const response = await fetch(`${API_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      cookieStore.delete("auth_token")
      return { success: false, message: data.message || "Session expired" }
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Session verification error:", error)
    return { success: false, message: error.message || "Authentication failed" }
  }
}

// Redirect to login with message
export async function redirectToLogin(message?: string) {
  const searchParams = message ? `?message=${encodeURIComponent(message)}` : ""
  redirect(`/login${searchParams}`)
}

// Redirect to dashboard
export async function redirectToDashboard() {
  redirect("http://localhost:3001")
} 
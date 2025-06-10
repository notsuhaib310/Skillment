"use server"

import { AuthService } from "@/lib/auth-server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Register a new user
export async function registerUser(formData: FormData) {
  try {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const orgName = formData.get("orgName") as string
    const orgType = formData.get("orgType") as string
    const orgSize = formData.get("orgSize") as string

    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
      return { success: false, message: "All fields are required" }
    }

    if (password.length < 8) {
      return { success: false, message: "Password must be at least 8 characters" }
    }

    // Register user
    const result = await AuthService.register({
      firstName,
      lastName,
      email,
      password,
      orgName,
      orgType,
      orgSize,
    })

    return { success: true, userId: result.id }
  } catch (error: any) {
    return { success: false, message: error.message || "Registration failed" }
  }
}

// Login user
export async function loginUser(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const rememberMe = formData.get("rememberMe") === "on"

    // Validate inputs
    if (!email || !password) {
      return { success: false, message: "Email and password are required" }
    }

    // Login user
    const { user, token, expiresAt } = await AuthService.login(email, password)

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: rememberMe ? expiresAt : undefined,
      sameSite: "lax",
      path: "/",
    })

    return { success: true, user }
  } catch (error: any) {
    return { success: false, message: error.message || "Login failed" }
  }
}

// Logout user
export async function logoutUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (token) {
      await AuthService.logout(token)
      cookieStore.delete("auth_token")
    }

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || "Logout failed" }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return { success: false, message: "Not authenticated" }
    }

    const session = await AuthService.verifySession(token)

    if (!session) {
      cookieStore.delete("auth_token")
      return { success: false, message: "Session expired" }
    }

    return { success: true, user: session.user }
  } catch (error: any) {
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
  redirect("/dashboard")
}

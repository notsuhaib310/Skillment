"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001"

export async function redirectToLogin() {
  redirect("/login")
}

export async function redirectToDashboard() {
  redirect(`${DASHBOARD_URL}/dashboard`)
}

export async function loginUser(formData: FormData) {
  try {
    const userData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      orgName: formData.get("orgName") as string,
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    // Get the auth token from the response
    const authToken = data.token

    if (authToken) {
      // Set the auth token cookie
      cookies().set("auth_token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: ".skillment.in", // This allows the cookie to be shared between subdomains
      })
    }

    return { 
      success: true, 
      data,
      redirectUrl: data.redirectUrl // This will be the organization's dashboard URL
    }
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, error: error.message }
  }
}

export async function registerUser(formData: FormData) {
  try {
    const userData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      orgName: formData.get("orgName") as string,
      orgType: formData.get("orgType") as string,
      orgSize: formData.get("orgSize") as string,
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Registration failed")
    }

    // Get the auth token from the response
    const authToken = data.token

    if (authToken) {
      // Set the auth token cookie
      cookies().set("auth_token", authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        domain: ".skillment.in", // This allows the cookie to be shared between subdomains
      })
    }

    return { 
      success: true, 
      data,
      redirectUrl: data.redirectUrl // This will be the organization's subdomain URL
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return { success: false, error: error.message }
  }
}

export async function logoutUser() {
  try {
    const token = cookies().get("auth_token")?.value

    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Logout failed")
    }

    // Clear the auth token cookie
    cookies().delete("auth_token")

    return { success: true }
  } catch (error: any) {
    console.error("Logout error:", error)
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const token = cookies().get("auth_token")?.value

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Failed to get user data")
    }

    const data = await response.json()
    return { success: true, user: data }
  } catch (error: any) {
    console.error("Get user error:", error)
    return { success: false, error: error.message }
  }
}

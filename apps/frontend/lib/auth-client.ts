const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Verify session
export async function verifySession() {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.message || "Session expired" }
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Session verification error:", error)
    return { success: false, message: error.message || "Authentication failed" }
  }
}

// Logout user
export async function logout() {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    return { success: true }
  } catch (error: any) {
    console.error("Logout error:", error)
    throw error
  }
} 
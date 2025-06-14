const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function verifySession() {
  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      credentials: "include",
    })
    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Session verification error:", error)
    return { success: false, error: "Failed to verify session" }
  }
}

export async function logout() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.message)
    }

    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
} 
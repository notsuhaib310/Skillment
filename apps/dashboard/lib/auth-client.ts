const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const verifySession = async () => {
  const token = sessionStorage.getItem("auth_token")
  if (!token) {
    throw new Error("No session found")
  }

  const response = await fetch(`${API_URL}/auth/verify`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Session verification failed")
  }

  return response.json()
}

export const logout = async () => {
  const token = sessionStorage.getItem("auth_token")
  if (!token) {
    return
  }

  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    })
  } finally {
    sessionStorage.removeItem("auth_token")
  }
} 
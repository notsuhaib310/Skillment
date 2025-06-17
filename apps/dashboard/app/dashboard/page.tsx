"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DashboardContent } from "@/components/dashboard-content"
import Cookies from "js-cookie"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  orgName: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for token in cookie
    const token = Cookies.get("token")
    if (!token) {
      window.location.href = "/auth/login"
      return
    }

    // Get user info from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing user data:", error)
        window.location.href = "/auth/login"
      }
    }
  }, [])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* <h2 className="text-lg font-semibold text-foreground"></h2> */}
              <div className="text-sm text-muted-foreground">
                Logged in as {user.email}
              </div>
            </div>
            <button
              onClick={() => {
                Cookies.remove("token")
                localStorage.removeItem("user")
                window.location.href = "/auth/login"
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="py-8">
        <DashboardContent user={user} />
      </div>
    </div>
  )
}

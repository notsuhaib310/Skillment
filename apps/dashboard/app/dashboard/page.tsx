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
  const [isLoading, setIsLoading] = useState(true)

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
        toast.error("Failed to load user data")
        window.location.href = "/auth/login"
      }
    } else {
      console.error("No user data found")
      window.location.href = "/auth/login"
    }
    
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <DashboardContent user={user} />
    </div>
  )
}

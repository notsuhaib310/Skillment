"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { verifySession, logout } from "@/lib/auth-client"
import { DashboardContent } from "@/components/dashboard-content"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const session = await verifySession()
        if (!session.success) {
          window.location.href = "http://localhost:3000/login"
          return
        }

        setUser(session.user)
      } catch (error) {
        console.error("Auth verification error:", error)
        window.location.href = "http://localhost:3000/login"
      } finally {
        setLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "http://localhost:3000/login"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-foreground">Dashboard</h2>
              <div className="text-sm text-muted-foreground">Logged in as {user?.email}</div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="rounded-xl border-border/40 hover:bg-accent/80">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="py-8">
        <DashboardContent user={user} />
      </div>
    </div>
  )
}

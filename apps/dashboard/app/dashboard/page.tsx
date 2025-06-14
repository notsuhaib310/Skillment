"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { verifySession, logout } from "@/lib/auth-client"

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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user?.firstName}!</CardTitle>
              <CardDescription>You are logged in as {user?.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is your protected dashboard page.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Active Exams</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Completed Exams</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Students</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">No recent activity to display.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Cookies from "js-cookie"
import { Loader2 } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

interface UserData {
  id: string
  email: string
  firstName: string
  lastName: string
}

export function UserSettings() {
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    id: "",
    email: "",
    firstName: "",
    lastName: ""
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const userStr = localStorage.getItem("user")
      if (!userStr) {
        toast.error("User data not found")
        return
      }

      const user = JSON.parse(userStr)
      setUserData({
        id: user.id,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || ""
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Failed to load user data")
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      // First try with /users/me endpoint (API_URL already includes /api)
      let response = await fetch(`${API_URL}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName
        })
      })

      // If the first endpoint fails, try with /api/users/profile
      if (!response.ok) {
        console.log('Trying fallback endpoint /users/profile')
        response = await fetch(`${API_URL}/users/profile`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            firstName: userData.firstName,
            lastName: userData.lastName
          })
        })
      }

      if (!response.ok) {
        let errorMessage = 'Failed to update profile'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.error('Error parsing error response:', e)
        }
        throw new Error(errorMessage)
      }

      // Update user in localStorage
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        user.firstName = userData.firstName
        user.lastName = userData.lastName
        localStorage.setItem("user", JSON.stringify(user))
      }

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    setLoading(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      // First try with /users/change-password endpoint
      let response = await fetch(`${API_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      // If the first endpoint fails, try with /auth/change-password
      if (!response.ok) {
        console.log('Trying fallback endpoint /auth/change-password')
        response = await fetch(`${API_URL.replace('/api', '')}/auth/change-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        })
      }

      if (!response.ok) {
        let errorMessage = 'Failed to update password'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          console.error('Error parsing error response:', e)
        }
        throw new Error(errorMessage)
      }

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setIsPasswordSectionOpen(false)

      toast.success("Password updated successfully")
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account's profile information and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={userData.firstName}
                  onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                  placeholder="Enter your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={userData.lastName}
                  onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                Contact support to change your email address.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>
            Ensure your account is using a long, random password to stay secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPasswordSectionOpen ? (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPasswordSectionOpen(false)
                    setCurrentPassword("")
                    setNewPassword("")
                    setConfirmPassword("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsPasswordSectionOpen(true)}
            >
              Change Password
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

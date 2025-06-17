"use client"

import { usePathname } from "next/navigation"
import { Bell, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CommandSearch } from "./command-search"
import { useEffect, useState } from "react"
import { logout } from "@/lib/auth-client"

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/participants": "Participants",
  "/dashboard/assessments": "Assessments",
  "/dashboard/events": "Events & Interviews",
  "/dashboard/email": "Email & Invites",
  "/dashboard/reports": "Reports & Results",
  "/dashboard/ai-tools": "AI Tools",
  "/dashboard/settings": "Settings",
  "/dashboard/help": "Help & Support",
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  orgName?: string;
}

interface Organization {
  name: string;
  logo?: string;
}

export function DashboardHeader() {
  const pathname = usePathname()
  const currentPageName = pageNames[pathname] || "Dashboard"
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)

  // Fetch organization data
  const fetchOrganization = async (orgName: string) => {
    try {
      const response = await fetch(`/api/organizations/${orgName}`)
      if (response.ok) {
        const data = await response.json()
        setOrganization(data)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  // Listen for organization updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'organization') {
        try {
          const orgData = JSON.parse(e.newValue || '{}')
          setOrganization(orgData)
        } catch (error) {
          console.error('Error parsing organization data:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Initial data load
  useEffect(() => {
    // Get user info from localStorage
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        
        // Fetch organization data if orgName is available
        if (userData.orgName) {
          fetchOrganization(userData.orgName)
          
          // Also check if we have organization data in localStorage
          const orgData = localStorage.getItem('organization')
          if (orgData) {
            try {
              setOrganization(JSON.parse(orgData))
            } catch (e) {
              console.error('Error parsing stored organization data:', e)
            }
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    } else {
      logout()
    }
  }, [])

  // Update organization data in localStorage when it changes
  useEffect(() => {
    if (organization) {
      localStorage.setItem('organization', JSON.stringify(organization))
    }
  }, [organization])

  if (!user) {
    return null
  }

  return (
    <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">{currentPageName}</h2>
          <div className="text-sm text-muted-foreground">
            {/* Logged in as {user.email} */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Command Search */}
          <CommandSearch />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-accent/80">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-2xl">
                <Avatar className="h-10 w-10 rounded-2xl">
                  <AvatarImage src={organization?.logo || "/placeholder.svg"} />
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl p-2" align="end">
              <div className="flex items-center gap-2 px-2 py-1.5">
                {organization?.logo ? (
                  <img 
                    src={organization.logo} 
                    alt={organization.name} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-orange-600 text-sm font-medium text-white">
                    {organization?.name?.[0]?.toUpperCase() || 'O'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{organization?.name || 'Organization'}</p>
                  <p className="text-xs text-muted-foreground">Organization</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl">
                <User className="mr-2 h-4 w-4" />
                {user.firstName} {user.lastName}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl">
                <Settings className="mr-2 h-4 w-4" />
                Organization Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={logout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

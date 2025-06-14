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
import { verifySession } from "@/lib/auth-client"
import { logout } from "@/app/actions/auth"

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

export function DashboardHeader() {
  const pathname = usePathname()
  const currentPageName = pageNames[pathname] || "Dashboard"
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const session = await verifySession()
        if (session.success) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Auth verification error:", error)
      }
    }

    verifyAuth()
  }, [])

  const handleLogout = async () => {
    try {
      // Call the server action
      await logout()
      
      // Force a hard refresh to clear any client-side state
      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'
      window.location.href = `${frontendUrl}/login`
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <header className="border-b border-border/40 bg-card/30 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">{currentPageName}</h2>
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
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl" align="end">
              <DropdownMenuItem className="rounded-xl">
                <User className="mr-2 h-4 w-4" />
                {user?.firstName} {user?.lastName}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50" 
                onClick={handleLogout}
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

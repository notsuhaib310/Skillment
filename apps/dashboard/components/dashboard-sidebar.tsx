"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Users, FileText, Calendar, Mail, TrendingUp, Bot, Settings, HelpCircle, LayoutDashboard, UserPlus, Plus, Key, BarChart3, Shield, ChevronRight, LogOut, Building2, User, ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { logout } from "@/lib/auth-client"
import Cookies from "js-cookie"
import React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const menuSections = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard Overview",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        title: "Participants",
        icon: Users,
        href: "/dashboard/participants",
      },
    ],
  },
  {
    label: "Assessments",
    items: [
      {
        title: "All Assessments",
        icon: FileText,
        href: "/dashboard/assessments",
      },
      {
        title: "Create Assessment",
        icon: Plus,
        href: "/dashboard/assessments/create",
      },
      {
        title: "Candidate Management",
        icon: Users,
        href: "/dashboard/assessments/candidates",
      },
      {
        title: "Credentials",
        icon: Key,
        href: "/dashboard/assessments/credentials",
      },
      {
        title: "Results & Analytics",
        icon: BarChart3,
        href: "/dashboard/assessments/results",
      },
      {
        title: "Proctoring",
        icon: Shield,
        href: "/dashboard/assessments/proctoring",
      },
    ],
  },
  {
    label: "Events",
    items: [
      {
        title: "Events & Interviews",
        icon: Calendar,
        href: "/dashboard/events",
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        title: "Email & Invites",
        icon: Mail,
        href: "/dashboard/email",
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        title: "Reports & Results",
        icon: TrendingUp,
        href: "/dashboard/reports",
      },
      {
        title: "AI Tools",
        icon: Bot,
        href: "/dashboard/ai-tools",
      },
    ],
  },
  {
    label: "Team",
    items: [
      {
        title: "Team Management",
        icon: UserPlus,
        href: "/dashboard/team",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
      },
      {
        title: "Help & Support",
        icon: HelpCircle,
        href: "/dashboard/help",
      },
    ],
  },
]

export function DashboardSidebar({ onCollapse }: { onCollapse?: (collapsed: boolean) => void }) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (onCollapse) onCollapse(collapsed)
  }, [collapsed, onCollapse])

  useEffect(() => {
    // Get user and organization info
    const userStr = localStorage.getItem("user")
    const orgStr = localStorage.getItem("organization")
    
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
    
    if (orgStr) {
      try {
        const orgData = JSON.parse(orgStr)
        setOrganization(orgData)
      } catch (error) {
        console.error("Error parsing organization data:", error)
      }
    }
  }, [])

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`
    }
    return user?.email?.[0]?.toUpperCase() || "U"
  }

  const getOrgInitials = () => {
    if (organization?.name) {
      return organization.name[0]?.toUpperCase()
    }
    return user?.orgName?.[0]?.toUpperCase() || "O"
  }

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user?.email || "User"
  }

  const getOrgDisplayName = () => {
    return organization?.name || user?.orgName || "Organization"
  }

  return (
    <Sidebar className="border-r border-border/40 bg-gradient-to-b from-card/95 to-card/80 backdrop-blur-xl h-screen w-64 transition-all duration-300 ease-in-out">
      {/* Header */}
      <SidebarHeader className="p-6 border-b border-border/20">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-orange-500 shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-500/20 blur opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Skillment
              </span>
              <span className="text-xs text-muted-foreground">Assessment Platform</span>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-4 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuSections.map((section) => (
                <React.Fragment key={section.label}>
                  <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
                    {section.label}
                  </SidebarGroupLabel>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href}
                          className="w-full h-11 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-accent/60 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary data-[active=true]:to-primary/90 data-[active=true]:text-primary-foreground data-[active=true]:shadow-md data-[active=true]:shadow-primary/20 group"
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full">
                            <div className="flex items-center justify-center w-5 h-5">
                              <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                            </div>
                            <span className="text-sm font-medium flex-1">{item.title}</span>
                            {pathname === item.href && (
                              <ChevronRight className="h-4 w-4 opacity-80" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </div>
                  {section.label !== "Settings" && (
                    <SidebarSeparator className="my-4 bg-border/30" />
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Consolidated Profile Section */}
      <SidebarFooter className="p-4 border-t border-border/20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-14 px-3 py-2 rounded-xl hover:bg-accent/60 transition-colors"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-primary/80 to-orange-500/80 text-white text-sm font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {getOrgDisplayName()}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-64 p-2 bg-card/95 backdrop-blur-xl border border-border/40 shadow-xl rounded-xl"
          >
            <DropdownMenuLabel className="px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-orange-500/80 text-white text-sm font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 py-3 px-3 rounded-xl hover:bg-accent/60 cursor-pointer">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Building2 className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {getOrgDisplayName()}
                </span>
                <span className="text-xs text-muted-foreground">Organization</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3 py-3 px-3 rounded-xl hover:bg-accent/60 cursor-pointer">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                <User className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-sm text-foreground">Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={logout}
              className="gap-3 py-3 px-3 rounded-xl hover:bg-red-50 hover:text-red-600 cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500/20 to-pink-500/20">
                <LogOut className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-sm">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

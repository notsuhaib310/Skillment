"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Users, FileText, Calendar, Mail, TrendingUp, Bot, Settings, HelpCircle, LayoutDashboard, UserPlus } from "lucide-react"
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
import { useState, useEffect } from "react"
import React from "react"

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
        title: "Assessment Management",
        icon: FileText,
        href: "/dashboard/assessment-manage",
      },
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
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (onCollapse) onCollapse(collapsed)
    // Optionally, add/remove a class to the body for global layout
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed')
    } else {
      document.body.classList.remove('sidebar-collapsed')
    }
  }, [collapsed, onCollapse])

  // useEffect(() => {
  //   const verifyAuth = async () => {
  //     try {
  //       const session = await verifySession()
  //       if (session.success) {
  //         setUser(session.user)
  //       }
  //     } catch (error) {
  //       console.error("Auth verification error:", error)
  //     }
  //   }

  //   verifyAuth()
  // }, [])

  return (
    <Sidebar className={`border-r border-border/40 bg-card/30 backdrop-blur-xl h-screen ${collapsed ? 'w-20' : 'w-64'} transition-all duration-200`}>
      <SidebarHeader className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-primary to-orange-600 shadow-lg glow-primary" />
            {!collapsed && (
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Skillment
              </span>
            )}
          </Link>
        </div>
        <button
          className="ml-2 p-1 rounded hover:bg-accent/40 transition"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="sr-only">Toggle Sidebar</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-muted-foreground">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuSections.map((section) => (
                <React.Fragment key={section.label}>
                  <SidebarGroupLabel className={`mt-2 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest ${collapsed ? 'hidden' : ''}`}>{section.label}</SidebarGroupLabel>
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        className={`h-12 px-4 rounded-2xl transition-all duration-200 hover:bg-accent/80 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:glow-primary ${collapsed ? 'justify-center px-2' : ''}`}
                      >
                        <Link href={item.href}>
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarSeparator />
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
{/* 
      <SidebarFooter className={`border-t border-border/40 p-4 flex flex-col gap-2 ${collapsed ? 'justify-center items-center' : ''}`}>
        <div className={`flex items-center gap-3 rounded-2xl bg-accent/30 p-4 backdrop-blur-sm border border-border/40 ${collapsed ? 'justify-center' : ''}`}>
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-orange-600 shadow-lg glow-primary" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{user?.firstName} {user?.lastName}</span>
              <span className="text-xs text-muted-foreground">Administrator</span>
            </div>
          )}
        </div>
        <button
          className="mt-4 p-1 rounded hover:bg-accent/40 transition"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="sr-only">Toggle Sidebar</span>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-muted-foreground">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            )}
          </svg>
        </button>
      </SidebarFooter> */}
    </Sidebar>
  )
}

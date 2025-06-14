"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Users, FileText, Calendar, Mail, TrendingUp, Bot, Settings, HelpCircle, LayoutDashboard } from "lucide-react"
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
} from "@/components/ui/sidebar"

const menuItems = [
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
  {
    title: "Assessments",
    icon: FileText,
    href: "/dashboard/assessments",
  },
  {
    title: "Events & Interviews",
    icon: Calendar,
    href: "/dashboard/events",
  },
  {
    title: "Email & Invites",
    icon: Mail,
    href: "/dashboard/email",
  },
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
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-border/40 bg-card/50 backdrop-blur-xl">
      <SidebarHeader className="border-b border-border/40 p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl primary-gradient glow-primary shadow-lg">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">Skillment</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="h-12 px-4 rounded-2xl transition-all duration-200 hover:bg-accent/80 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-lg data-[active=true]:glow-primary"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-accent/30 p-4 backdrop-blur-sm border border-border/40">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-orange-600 shadow-lg glow-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">Sarah Chen</span>
            <span className="text-xs text-muted-foreground">Administrator</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

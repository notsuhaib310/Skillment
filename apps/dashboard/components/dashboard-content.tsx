"use client"

import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  Eye,
  Sparkles,
  Mail,
  Target,
  AlertTriangle,
  Plus,
  Send,
  Upload,
  CalendarPlus,
  Bot,
  Edit,
  Play,
  Filter,
  Clock,
  CheckCircle,
  Activity,
  Zap,
  Settings,
  Bell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useState } from "react"
import { useRouter } from "next/navigation"

// Mock data for charts
const chartData = [
  { name: "Jan", participants: 65, assessments: 28, completion: 78 },
  { name: "Feb", participants: 78, assessments: 35, completion: 82 },
  { name: "Mar", participants: 92, assessments: 42, completion: 75 },
  { name: "Apr", participants: 88, assessments: 38, completion: 88 },
  { name: "May", participants: 105, assessments: 48, completion: 91 },
  { name: "Jun", participants: 118, assessments: 52, completion: 85 },
]

const emailDeliveryData = [
  { name: "Week 1", delivered: 95, failed: 5 },
  { name: "Week 2", delivered: 98, failed: 2 },
  { name: "Week 3", delivered: 92, failed: 8 },
  { name: "Week 4", delivered: 97, failed: 3 },
]

// Recent activity data
const recentActivities = [
  {
    id: 1,
    type: "invite",
    message: "Sent invite to Rohit Sharma for React Test",
    time: "2 minutes ago",
    category: "emails",
  },
  {
    id: 2,
    type: "completion",
    message: "Assessment DSA Basics completed by 25 students",
    time: "15 minutes ago",
    category: "assessments",
  },
  {
    id: 3,
    type: "creation",
    message: "New MCQ test created: System Design Round 1",
    time: "1 hour ago",
    category: "assessments",
  },
  {
    id: 4,
    type: "participant",
    message: "New participant registered: Sarah Wilson",
    time: "2 hours ago",
    category: "participants",
  },
  {
    id: 5,
    type: "interview",
    message: "Interview scheduled with Alex Johnson for tomorrow",
    time: "3 hours ago",
    category: "interviews",
  },
]

// Recent assessments data
const recentAssessments = [
  {
    id: 1,
    title: "React Round 1",
    type: "Coding",
    status: "Active",
    date: "June 13",
    createdBy: "Sarah Chen",
    participants: 24,
    tags: ["React", "JavaScript"],
  },
  {
    id: 2,
    title: "Python Basics",
    type: "MCQ",
    status: "Draft",
    date: "June 12",
    createdBy: "Mike Johnson",
    participants: 0,
    tags: ["Python", "Basics"],
  },
  {
    id: 3,
    title: "AI MCQ Set 2025",
    type: "MCQ",
    status: "Closed",
    date: "June 10",
    createdBy: "David Chen",
    participants: 45,
    tags: ["AI", "ML"],
  },
]

const statusColors = {
  Active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Closed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

const activityIcons = {
  invite: Mail,
  completion: CheckCircle,
  creation: Plus,
  participant: Users,
  interview: Calendar,
}

interface DashboardContentProps {
  user: any
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [activityFilter, setActivityFilter] = useState("all")
  const router = useRouter()

  const filteredActivities = recentActivities.filter(
    (activity) => activityFilter === "all" || activity.category === activityFilter,
  )

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome back, {user?.firstName || "User"}
          </h1>
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground">{"Here's what's happening with your talent assessments today."}</p>
      </div>

      {/* Enhanced Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Participants</CardTitle>
            <div className="rounded-2xl bg-blue-500/10 p-2">
              <Users className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">1,247</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-400 font-medium">+12.5%</span> from last month
            </p>
            <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Assessments Created</CardTitle>
            <div className="rounded-2xl bg-purple-500/10 p-2">
              <FileText className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-400 font-medium">+8.2%</span> from last month
            </p>
            <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Invitations Sent</CardTitle>
            <div className="rounded-2xl bg-green-500/10 p-2">
              <Send className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">342</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-400 font-medium">+15.3%</span> this week
            </p>
            <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-green-500 to-green-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Upcoming Interviews</CardTitle>
            <div className="rounded-2xl bg-orange-500/10 p-2">
              <Calendar className="h-4 w-4 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-cyan-400 font-medium">+3</span> this week
            </p>
            <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Avg. Score This Month</CardTitle>
            <div className="rounded-2xl bg-cyan-500/10 p-2">
              <Target className="h-4 w-4 text-cyan-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">84.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-400 font-medium">+2.1%</span> improvement
            </p>
            <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-5/6 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Proctoring Alerts</CardTitle>
            <div className="rounded-2xl bg-red-500/10 p-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">7</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-400 font-medium">3 new</span> flagged today
            </p>
            <div className="mt-3 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-gradient-to-r from-red-500 to-red-400 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button
              onClick={() => router.push("/dashboard/assessments")}
              className="h-20 flex-col gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Create Assessment</span>
            </Button>
            <Button
              onClick={() => router.push("/dashboard/email")}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-border/40 hover:bg-accent/80"
            >
              <Send className="h-5 w-5" />
              <span className="text-sm">Send Invite</span>
            </Button>
            <Button
              onClick={() => router.push("/dashboard/participants")}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-border/40 hover:bg-accent/80"
            >
              <Upload className="h-5 w-5" />
              <span className="text-sm">Import Participants</span>
            </Button>
            <Button
              onClick={() => router.push("/dashboard/events")}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-border/40 hover:bg-accent/80"
            >
              <CalendarPlus className="h-5 w-5" />
              <span className="text-sm">Schedule Interview</span>
            </Button>
            <Button
              onClick={() => router.push("/dashboard/ai-tools")}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-border/40 hover:bg-accent/80"
            >
              <Bot className="h-5 w-5" />
              <span className="text-sm">Use AI Tool</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Assessments Table */}
        <div className="lg:col-span-2">
          <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-muted-foreground">Title</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentAssessments.map((assessment) => (
                    <TableRow key={assessment.id} className="border-border/40">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">{assessment.title}</div>
                          <div className="flex flex-wrap gap-1">
                            {assessment.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="rounded-xl bg-accent/50 text-foreground border-border/40 text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By {assessment.createdBy} • {assessment.participants} participants
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-xl">
                          {assessment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-xl border ${statusColors[assessment.status as keyof typeof statusColors]}`}
                        >
                          {assessment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">{assessment.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl"
                          >
                            <DropdownMenuItem className="rounded-xl">
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {assessment.status === "Draft" && (
                              <DropdownMenuItem className="rounded-xl">
                                <Play className="mr-2 h-4 w-4" />
                                Resume
                              </DropdownMenuItem>
                            )}
                            {assessment.status === "Closed" && (
                              <DropdownMenuItem className="rounded-xl">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                View Results
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-24 h-8 rounded-xl bg-input/50 border-border/40">
                    <Filter className="h-3 w-3" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="participants">Participants</SelectItem>
                    <SelectItem value="assessments">Assessments</SelectItem>
                    <SelectItem value="emails">Emails</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredActivities.map((activity) => {
                  const IconComponent = activityIcons[activity.type as keyof typeof activityIcons]
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-accent/20 hover:bg-accent/30 transition-colors"
                    >
                      <div className="rounded-xl bg-primary/10 p-2 mt-0.5">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Assessment Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completion"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Mail className="h-5 w-5 text-primary" />
              Email Delivery Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emailDeliveryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Bar dataKey="delivered" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status & Notices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
              <Settings className="h-4 w-4" />
              Plan Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email Quota</span>
                <span className="text-foreground">800/1000</span>
              </div>
              <Progress value={80} className="h-2 rounded-full" />
              <p className="text-xs text-amber-400">{"You've used 80% of your email quota"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">SMTP</span>
                <Badge variant="destructive" className="rounded-xl text-xs">
                  Not Configured
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calendar</span>
                <Badge variant="default" className="rounded-xl text-xs">
                  Connected
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/40 shadow-xl backdrop-blur-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-foreground">
              <Bell className="h-4 w-4 text-primary" />
              Latest Update
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-foreground font-medium">New AI Test Generator</p>
              <p className="text-xs text-muted-foreground">
                Generate questions automatically with our new AI-powered tool.
              </p>
              <Button size="sm" variant="outline" className="rounded-xl text-xs">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

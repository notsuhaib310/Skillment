"use client"

import { TrendingUp, Mail, Eye, MousePointer, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const emailMetrics = {
  totalSent: 156,
  delivered: 152,
  opened: 98,
  clicked: 42,
  bounced: 4,
  unsubscribed: 2,
}

const timeSeriesData = [
  { date: "Jan 20", sent: 12, opened: 8, clicked: 3 },
  { date: "Jan 21", sent: 18, opened: 14, clicked: 6 },
  { date: "Jan 22", sent: 15, opened: 11, clicked: 4 },
  { date: "Jan 23", sent: 22, opened: 16, clicked: 8 },
  { date: "Jan 24", sent: 28, opened: 19, clicked: 9 },
  { date: "Jan 25", sent: 35, opened: 24, clicked: 12 },
]

const templatePerformance = [
  { name: "Assessment Invite", sent: 45, opened: 32, clicked: 18, openRate: 71, clickRate: 40 },
  { name: "Interview Schedule", sent: 38, opened: 28, clicked: 12, openRate: 74, clickRate: 32 },
  { name: "Result Notification", sent: 32, opened: 22, clicked: 8, openRate: 69, clickRate: 25 },
  { name: "Event Reminder", sent: 25, opened: 16, clicked: 4, openRate: 64, clickRate: 16 },
]

const statusDistribution = [
  { name: "Delivered", value: emailMetrics.delivered, color: "#10b981" },
  { name: "Opened", value: emailMetrics.opened, color: "#f59e0b" },
  { name: "Clicked", value: emailMetrics.clicked, color: "#8b5cf6" },
  { name: "Bounced", value: emailMetrics.bounced, color: "#ef4444" },
]

export function EmailMetrics() {
  const deliveryRate = Math.round((emailMetrics.delivered / emailMetrics.totalSent) * 100)
  const openRate = Math.round((emailMetrics.opened / emailMetrics.delivered) * 100)
  const clickRate = Math.round((emailMetrics.clicked / emailMetrics.opened) * 100)
  const bounceRate = Math.round((emailMetrics.bounced / emailMetrics.totalSent) * 100)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{emailMetrics.totalSent}</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{openRate}%</div>
            <Progress value={openRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Click Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{clickRate}%</div>
            <Progress value={clickRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Delivery Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{deliveryRate}%</div>
            <div className="text-xs text-red-400 mt-1">{bounceRate}% bounce rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Performance Over Time */}
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle>Email Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis dataKey="date" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "1rem",
                      backdropFilter: "blur(12px)",
                    }}
                  />
                  <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={3} name="Sent" />
                  <Line type="monotone" dataKey="opened" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Opened" />
                  <Line type="monotone" dataKey="clicked" stroke="hsl(var(--chart-3))" strokeWidth={3} name="Clicked" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle>Email Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              {statusDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-muted-foreground">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Performance */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle>Template Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templatePerformance.map((template) => (
              <div key={template.name} className="p-4 rounded-2xl bg-accent/30">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{template.name}</h4>
                  <div className="flex gap-2">
                    <Badge className="rounded-xl bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      {template.openRate}% open
                    </Badge>
                    <Badge className="rounded-xl bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {template.clickRate}% click
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sent:</span>
                    <span className="font-medium text-foreground ml-2">{template.sent}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Opened:</span>
                    <span className="font-medium text-foreground ml-2">{template.opened}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Clicked:</span>
                    <span className="font-medium text-foreground ml-2">{template.clicked}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

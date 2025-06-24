"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import * as api from "@/lib/api/email"
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

export function EmailMetrics() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getEmailMetrics()
      .then(setMetrics)
      .catch(() => toast.error("Failed to load metrics"))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !metrics) {
    return <div className="p-8 text-center text-muted-foreground">Loading metrics...</div>
  }

  const deliveryRate = metrics.totalSent ? Math.round((metrics.delivered / metrics.totalSent) * 100) : 0
  const openRate = metrics.delivered ? Math.round((metrics.opened / metrics.delivered) * 100) : 0
  const clickRate = metrics.opened ? Math.round((metrics.clicked / metrics.opened) * 100) : 0
  const bounceRate = metrics.totalSent ? Math.round((metrics.bounced / metrics.totalSent) * 100) : 0

  const statusDistribution = [
    { name: "Delivered", value: metrics.delivered, color: "#10b981" },
    { name: "Opened", value: metrics.opened, color: "#f59e0b" },
    { name: "Clicked", value: metrics.clicked, color: "#8b5cf6" },
    { name: "Bounced", value: metrics.bounced, color: "#ef4444" },
  ]

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
            <div className="text-2xl font-bold text-foreground">{metrics.totalSent}</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              {/* TODO: Add week-over-week change if needed */}
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
                <LineChart data={metrics.timeSeriesData}>
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
    </div>
  )
}

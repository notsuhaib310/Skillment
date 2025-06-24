"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Users,
  Target,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  PieChart as RechartsPieChart,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Pie,
} from "recharts"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

interface Assessment {
  id: string
  title: string
  description: string
  type: string
  status: string
  duration: number
  analytics: {
    totalCandidates: number
    completedCandidates: number
    averageScore: number
    completionRate: number
  }
}

interface Candidate {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  score?: number
  attemptCount: number
  maxAttempts: number
  startedAt?: string
  completedAt?: string
  flags: {
    tabSwitches: number
    suspiciousActivity: number
    timeViolations: number
  }
}

interface ResultsPageProps {
  assessmentId: string
  onBack: () => void
}

export function ResultsPage({ assessmentId, onBack }: ResultsPageProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])

  useEffect(() => {
    loadData()
  }, [assessmentId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken();
      // Load assessment details
      const assessmentResponse = await fetch(`${API_URL}/assessments/${assessmentId}`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      
      if (assessmentResponse.ok) {
        const assessmentData = await assessmentResponse.json()
        setAssessment(assessmentData)
      }

      // Load candidates
      const candidatesResponse = await fetch(`${API_URL}/assessments/${assessmentId}/candidates`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      
      if (candidatesResponse.ok) {
        const candidatesData = await candidatesResponse.json()
        setCandidates(candidatesData)
      }
      
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error Loading Data",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={onBack} variant="outline" className="rounded-2xl">
          Go Back
        </Button>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground">Assessment not found.</div>
        <Button onClick={onBack} variant="outline" className="mt-4 rounded-2xl">
          Go Back
        </Button>
      </div>
    )
  }

  const submittedCandidates = candidates.filter((c) => c.status === "submitted" || c.status === "completed")

  // Calculate analytics data
  const totalCandidates = candidates.length
  const submittedCount = submittedCandidates.length
  const flaggedCount = candidates.filter((c) => 
    c.flags.tabSwitches > 0 || c.flags.suspiciousActivity > 0 || c.flags.timeViolations > 0
  ).length
  const avgScore = assessment.analytics?.averageScore || 0

  // Score distribution data
  const scoreRanges = [
    { range: "90-100%", count: submittedCandidates.filter((c) => (c.score || 0) >= 90).length, color: "#10b981" },
    {
      range: "80-89%",
      count: submittedCandidates.filter((c) => (c.score || 0) >= 80 && (c.score || 0) < 90).length,
      color: "#3b82f6",
    },
    {
      range: "70-79%",
      count: submittedCandidates.filter((c) => (c.score || 0) >= 70 && (c.score || 0) < 80).length,
      color: "#f59e0b",
    },
    {
      range: "60-69%",
      count: submittedCandidates.filter((c) => (c.score || 0) >= 60 && (c.score || 0) < 70).length,
      color: "#ef4444",
    },
    { range: "Below 60%", count: submittedCandidates.filter((c) => (c.score || 0) < 60).length, color: "#6b7280" },
  ]

  // Flag statistics
  const flagStats = [
    { type: "Tab Switches", count: submittedCandidates.reduce((sum, c) => sum + c.flags.tabSwitches, 0) },
    { type: "Suspicious Activity", count: submittedCandidates.reduce((sum, c) => sum + c.flags.suspiciousActivity, 0) },
    { type: "Time Violations", count: submittedCandidates.reduce((sum, c) => sum + c.flags.timeViolations, 0) },
  ]

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Assessment Results
          </h1>
          <p className="text-muted-foreground">{assessment.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCandidates}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{submittedCount}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round((submittedCount / totalCandidates) * 100)}% completion rate
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgScore}%</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Flagged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{flaggedCount}</div>
            <div className="text-xs text-muted-foreground">
              {totalCandidates > 0 ? Math.round((flaggedCount / totalCandidates) * 100) : 0}% of total
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-xl">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="individual" className="rounded-xl">
            Individual Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Score Distribution */}
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={scoreRanges.filter((r) => r.count > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="count"
                        label={({ range, count }) => `${range}: ${count}`}
                      >
                        {scoreRanges.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Flag Statistics */}
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Flag Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flagStats.map((stat) => (
                    <div key={stat.type} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{stat.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{stat.count}</span>
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-400 rounded-full"
                            style={{
                              width: `${Math.min((stat.count / Math.max(...flagStats.map((s) => s.count))) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-2xl bg-accent/30">
                  <div className="text-2xl font-bold text-foreground">
                    {submittedCandidates.filter((c) => (c.score || 0) >= 80).length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Performers (80%+)</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-accent/30">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(submittedCandidates.reduce((sum, c) => sum + (c.timeSpent || 0), 0) / submittedCount) ||
                      0}
                    m
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Time Spent</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-accent/30">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.max(...submittedCandidates.map((c) => c.score || 0))}%
                  </div>
                  <div className="text-sm text-muted-foreground">Highest Score</div>
                </div>
                <div className="text-center p-4 rounded-2xl bg-accent/30">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.min(...submittedCandidates.map((c) => c.score || 0))}%
                  </div>
                  <div className="text-sm text-muted-foreground">Lowest Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Score Distribution Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreRanges}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Individual Results</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-muted-foreground font-medium">Candidate</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Score</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Time Spent</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Flags</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Submitted At</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submittedCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">No submitted results to display</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    submittedCandidates
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map((candidate, index) => (
                        <TableRow key={candidate.id} className="border-border/40 hover:bg-accent/30">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <Avatar className="h-8 w-8 rounded-2xl">
                                <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground font-semibold">
                                  {candidate.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-foreground">{candidate.name}</div>
                                <div className="text-sm text-muted-foreground">{candidate.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`rounded-xl border ${
                                candidate.status === "submitted"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-red-500/20 text-red-400 border-red-500/30"
                              } capitalize`}
                            >
                              {candidate.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-foreground">{candidate.score}%</div>
                              <Progress value={candidate.score} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{candidate.timeSpent}m</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {candidate.flags.tabSwitches > 0 && (
                                <div className="text-xs text-amber-400">{candidate.flags.tabSwitches} tab switches</div>
                              )}
                              {candidate.flags.suspiciousActivity > 0 && (
                                <div className="text-xs text-red-400">
                                  {candidate.flags.suspiciousActivity} suspicious
                                </div>
                              )}
                              {Object.values(candidate.flags).every((v) => v === 0) && (
                                <div className="text-xs text-emerald-400">Clean</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleString() : "-"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" className="rounded-xl">
                                <FileText className="mr-1 h-3 w-3" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="rounded-xl">
                                <Download className="mr-1 h-3 w-3" />
                                PDF
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

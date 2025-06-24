"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Search,
  MoreHorizontal,
  Users,
  Clock,
  Target,
  AlertTriangle,
  RefreshCw,
  UserX,
  Plus,
  Eye,
  Activity,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

const statusColors = {
  "not-started": "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  submitted: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  flagged: "bg-red-500/20 text-red-400 border-red-500/30",
  expired: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

const activityColors = {
  started: "bg-emerald-500/20 text-emerald-400",
  "tab-switch": "bg-amber-500/20 text-amber-400",
  "suspicious-activity": "bg-red-500/20 text-red-400",
  submitted: "bg-blue-500/20 text-blue-400",
  flagged: "bg-red-500/20 text-red-400",
  "time-warning": "bg-amber-500/20 text-amber-400",
}

interface Assessment {
  id: string
  title: string
  description: string
  type: string
  status: string
  duration: number
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
  timeSpent?: number
  lastActivity?: string
  flags: {
    tabSwitches: number
    suspiciousActivity: number
    timeViolations: number
  }
}

interface LiveActivity {
  id: string
  candidateId: string
  candidateName: string
  type: string
  timestamp: string
  details: string
  activity: string
  severity: string
}

interface ManageCandidatesPageProps {
  assessmentId: string
  onBack: () => void
}

export function ManageCandidatesPage({ assessmentId, onBack }: ManageCandidatesPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("candidates")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([])

  useEffect(() => {
    loadData()
  }, [assessmentId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = getAuthToken()

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

      // Load live activities (if available)
      try {
        const activitiesResponse = await fetch(`${API_URL}/assessments/${assessmentId}/activities`, {
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        
        if (activitiesResponse.ok) {
          const activitiesData = await activitiesResponse.json()
          setLiveActivities(activitiesData)
        }
      } catch (err) {
        // Activities endpoint might not exist yet, so we'll ignore this error
        console.log("Activities endpoint not available")
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

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate summary stats
  const totalAssigned = candidates.length
  const started = candidates.filter((c) => c.status !== "not-started").length
  const submitted = candidates.filter((c) => c.status === "submitted" || c.status === "completed").length
  const flagged = candidates.filter((c) => 
    c.flags.tabSwitches > 0 || c.flags.suspiciousActivity > 0 || c.flags.timeViolations > 0
  ).length
  const avgScore =
    submitted > 0
      ? Math.round(candidates.filter((c) => c.score).reduce((sum, c) => sum + (c.score || 0), 0) / submitted)
      : 0

  const handleResetAttempt = async (candidateId: string) => {
    try {
      const response = await fetch(`${API_URL}/assessments/${assessmentId}/candidates/${candidateId}/reset`, {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        await loadData() // Reload data
        toast({
          title: "Attempt Reset",
          description: "Candidate's attempt has been reset successfully.",
        })
      } else {
        throw new Error("Failed to reset attempt")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset attempt",
        variant: "destructive",
      })
    }
  }

  const handleRevokeAccess = async (candidateId: string) => {
    try {
      const response = await fetch(`${API_URL}/assessments/${assessmentId}/candidates/${candidateId}/revoke`, {
        method: "POST",
        credentials: "include",
      })
      
      if (response.ok) {
        await loadData() // Reload data
        toast({
          title: "Access Revoked",
          description: "Candidate's access has been revoked.",
          variant: "destructive",
        })
      } else {
        throw new Error("Failed to revoke access")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to revoke access",
        variant: "destructive",
      })
    }
  }

  const handleExtendTime = async (candidateId: string) => {
    try {
      const response = await fetch(`${API_URL}/assessments/${assessmentId}/candidates/${candidateId}/extend-time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ additionalMinutes: 30 }),
      })
      
      if (response.ok) {
        await loadData() // Reload data
        toast({
          title: "Time Extended",
          description: "Additional 30 minutes have been granted to the candidate.",
        })
      } else {
        throw new Error("Failed to extend time")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to extend time",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading candidates...</p>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Manage Candidates
          </h1>
          <p className="text-muted-foreground">{assessment.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl">
            <Plus className="mr-2 h-4 w-4" />
            Add Candidates
          </Button>
          <Button className="rounded-2xl primary-gradient glow-primary">
            <Activity className="mr-2 h-4 w-4" />
            Live Monitor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-5">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAssigned}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{started}</div>
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
            <div className="text-2xl font-bold text-emerald-400">{submitted}</div>
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
            <div className="text-2xl font-bold text-red-400">{flagged}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{avgScore}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="candidates" className="rounded-xl">
            Candidates ({totalAssigned})
          </TabsTrigger>
          <TabsTrigger value="live-monitor" className="rounded-xl">
            Live Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-6">
          {/* Filters */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-2xl bg-input/50 border-border/40"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 rounded-2xl bg-input/50 border-border/40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Candidates Table */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-muted-foreground font-medium">Candidate</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Score</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Time Spent</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Flags</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Last Activity</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-muted-foreground">
                          {searchTerm || statusFilter !== "all"
                            ? "No candidates match your filters"
                            : "No candidates assigned to this assessment."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id} className="border-border/40 hover:bg-accent/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-2xl">
                              <AvatarImage src="/placeholder.svg" />
                              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground font-semibold">
                                {`${candidate.firstName?.[0] || ''}${candidate.lastName?.[0] || ''}`}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">{`${candidate.firstName} ${candidate.lastName}`}</div>
                              <div className="text-sm text-muted-foreground">{candidate.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-xl border ${statusColors[candidate.status as keyof typeof statusColors] || statusColors["not-started"]} capitalize`}>
                            {candidate.status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-foreground">
                              {candidate.score !== undefined ? `${candidate.score}%` : "-"}
                            </div>
                            {candidate.score !== undefined && <Progress value={candidate.score} className="w-16 h-2" />}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {candidate.timeSpent ? `${candidate.timeSpent}m` : "-"}
                          </div>
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
                            {candidate.flags.timeViolations > 0 && (
                              <div className="text-xs text-orange-400">
                                {candidate.flags.timeViolations} time violations
                              </div>
                            )}
                            {Object.values(candidate.flags).every((v) => v === 0) && (
                              <div className="text-xs text-emerald-400">Clean</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {candidate.lastActivity ? new Date(candidate.lastActivity).toLocaleTimeString() : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-accent/80">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl"
                            >
                              <DropdownMenuItem className="rounded-xl" onClick={() => handleResetAttempt(candidate.id)}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reset Attempt
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl">
                                <Plus className="mr-2 h-4 w-4" />
                                Extend Time
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl">
                                <Eye className="mr-2 h-4 w-4" />
                                View Response
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="rounded-xl text-red-400 focus:text-red-300"
                                onClick={() => handleRevokeAccess(candidate.id)}
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Revoke Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-monitor" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No live activities to display</div>
                ) : (
                  liveActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30">
                      <div className={`w-3 h-3 rounded-full ${activityColors[activity.activity as keyof typeof activityColors] || activityColors.started}`} />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{activity.candidateName}</div>
                        <div className="text-sm text-muted-foreground">
                          {activity.activity.replace("-", " ")} - {activity.details}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                      <Badge
                        className={`rounded-xl ${
                          activity.severity === "high"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : activity.severity === "medium"
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {activity.severity}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

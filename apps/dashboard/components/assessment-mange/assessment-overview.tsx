"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  MoreHorizontal,
  Users,
  Play,
  BarChart3,
  Calendar,
  Clock,
  Target,
  AlertTriangle,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AllotCandidatesModal } from "./allot-candidates-modal"
import { ManageCandidatesPage } from "./manage-candidates-page"
import { ResultsPage } from "./results-page"
import { AssessmentDetailView } from "./assessment-detail-view"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

const statusColors = {
  scheduled: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ongoing: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  completed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

const typeColors = {
  mcq: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  coding: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  proctored: "bg-red-500/20 text-red-400 border-red-500/30",
  hybrid: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
}

interface Assessment {
  id: string
  title: string
  type: string
  status: string
  duration: number
  totalCandidates: number
  completedCandidates: number
  averageScore: number
  tags: string[]
  candidatesFlagged: number
}

interface AssessmentOverviewProps {
  onCreateNew: () => void
}

export function AssessmentOverview({ onCreateNew }: AssessmentOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"overview" | "allot" | "manage" | "results" | "details">("overview")
  const [showAllotModal, setShowAllotModal] = useState(false)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allotModalOpen, setAllotModalOpen] = useState(false)

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/assessments`, {
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!response.ok) {
          throw new Error("Failed to fetch assessments")
        }
        const data = await response.json()
        setAssessments(Array.isArray(data) ? data : data.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch assessments")
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter
    const matchesType = typeFilter === "all" || assessment.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const handleAllotCandidates = (assessmentId: string) => {
    setSelectedAssessment(assessmentId)
    setAllotModalOpen(true)
  }

  const handleManageCandidates = (assessmentId: string) => {
    setSelectedAssessment(assessmentId)
    setCurrentView("manage")
  }

  const handleViewResults = (assessmentId: string) => {
    setSelectedAssessment(assessmentId)
    setCurrentView("results")
  }

  const handleBackToOverview = () => {
    setCurrentView("overview")
    setSelectedAssessment(null)
  }

  const handleViewDetails = (assessmentId: string) => {
    setSelectedAssessment(assessmentId)
    setCurrentView("details")
  }

  if (currentView === "manage" && selectedAssessment) {
    return <ManageCandidatesPage assessmentId={selectedAssessment} onBack={handleBackToOverview} />
  }

  if (currentView === "results" && selectedAssessment) {
    return <ResultsPage assessmentId={selectedAssessment} onBack={handleBackToOverview} />
  }

  if (currentView === "details" && selectedAssessment) {
    return <AssessmentDetailView assessmentId={selectedAssessment} onBack={handleBackToOverview} />
  }

  // Calculate summary stats
  const totalAssessments = assessments.length
  const ongoingAssessments = assessments.filter((a) => a.status === "ongoing").length
  const totalCandidates = assessments.reduce((sum, a) => sum + a.totalCandidates, 0)
  const flaggedCandidates = assessments.reduce((sum, a) => sum + a.candidatesFlagged, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Assessment Management
          </h1>
          <p className="text-muted-foreground">Manage assessments, allot candidates, and monitor progress</p>
        </div>
        <Button onClick={onCreateNew} className="rounded-2xl primary-gradient glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalAssessments}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Play className="h-4 w-4" />
              Ongoing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{ongoingAssessments}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{Number(totalCandidates) || 0}</div>
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
            <div className="text-2xl font-bold text-red-400">{Number(flaggedCandidates) || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
              <TabsList className="grid w-full grid-cols-5 lg:w-[500px] rounded-2xl bg-muted/50 p-1">
                <TabsTrigger value="all" className="rounded-xl">
                  All
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="rounded-xl">
                  Scheduled
                </TabsTrigger>
                <TabsTrigger value="ongoing" className="rounded-xl">
                  Ongoing
                </TabsTrigger>
                <TabsTrigger value="completed" className="rounded-xl">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="draft" className="rounded-xl">
                  Draft
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-2xl bg-input/50 border-border/40"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 rounded-2xl bg-input/50 border-border/40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="proctored">Proctored</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40">
                <TableHead className="text-muted-foreground font-medium">Assessment</TableHead>
                <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                <TableHead className="text-muted-foreground font-medium">Candidates</TableHead>
                <TableHead className="text-muted-foreground font-medium">Progress</TableHead>
                <TableHead className="text-muted-foreground font-medium">Avg Score</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                        ? "No assessments match your filters"
                        : "No assessments found. Create your first assessment to get started."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id} className="border-border/40 hover:bg-accent/30">
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground">{assessment.title}</div>
                        <div className="flex flex-wrap gap-1">
                          {assessment.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="rounded-xl bg-accent/50 text-foreground border-border/40 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {assessment.tags.length > 2 && (
                            <Badge
                              variant="secondary"
                              className="rounded-xl bg-accent/50 text-foreground border-border/40 text-xs"
                            >
                              +{assessment.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-xl border ${typeColors[assessment.type]} capitalize`}>
                        {assessment.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-xl border ${statusColors[assessment.status]} capitalize`}>
                        {assessment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{assessment.duration}m</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{assessment.totalCandidates}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">
                          {assessment.completedCandidates}/{assessment.totalCandidates} submitted
                        </div>
                        {assessment.candidatesFlagged > 0 && (
                          <div className="text-xs text-red-400">{assessment.candidatesFlagged} flagged</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {assessment.averageScore > 0 ? `${assessment.averageScore}%` : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAllotCandidates(assessment.id)}
                          className="rounded-xl"
                          disabled={assessment.status === "completed"}
                        >
                          <Users className="mr-1 h-3 w-3" />
                          Allot
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageCandidates(assessment.id)}
                          className="rounded-xl"
                          disabled={assessment.totalCandidates === 0}
                        >
                          <Target className="mr-1 h-3 w-3" />
                          Manage
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewResults(assessment.id)}
                          className="rounded-xl"
                          disabled={assessment.completedCandidates === 0}
                        >
                          <BarChart3 className="mr-1 h-3 w-3" />
                          Results
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(assessment.id)}
                          className="rounded-xl"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Details
                        </Button>

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
                            <DropdownMenuItem className="rounded-xl">
                              <Calendar className="mr-2 h-4 w-4" />
                              Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl">
                              <Play className="mr-2 h-4 w-4" />
                              Start Now
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Allot Candidates Modal */}
      <AllotCandidatesModal open={allotModalOpen} onOpenChange={setAllotModalOpen} assessmentId={selectedAssessment} />
    </div>
  )
}

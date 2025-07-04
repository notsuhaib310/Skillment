"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft, 
  Users, 
  Eye, 
  Edit, 
  Play, 
  BarChart3, 
  Settings, 
  Calendar,
  Clock,
  Target,
  Mail,
  Download
} from "lucide-react"
import { CandidateAllocation } from "./candidate-allocation"
import { useToast } from "@/hooks/use-toast"
import { assessmentsApi } from "@/lib/api/api"

interface AssessmentManagePageProps {
  assessmentId: string
}

interface Assessment {
  id: string
  title: string
  description: string
  type: string
  status: string
  duration: number
  totalMarks: number
  totalQuestions: number
  createdAt: string
  createdBy: {
    firstName: string
    lastName: string
  }
}

interface Candidate {
  id: string
  name: string
  email: string
  status: string
  score?: number
  timeSpent?: number
  startedAt?: string
  submittedAt?: string
}

export function AssessmentManagePage({ assessmentId }: AssessmentManagePageProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [candidatesLoading, setCandidatesLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadAssessment()
    loadCandidates()
  }, [assessmentId])

  const loadAssessment = async () => {
    try {
      const data = await assessmentsApi.getById(assessmentId)
      setAssessment(data)
    } catch (error: any) {
      toast({
        title: "Error Loading Assessment",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCandidates = async () => {
    setCandidatesLoading(true)
    try {
      const { candidatesApi } = await import("@/lib/api")
      const data = await candidatesApi.getByAssessment(assessmentId)
      setCandidates(data)
    } catch (error: any) {
      toast({
        title: "Error Loading Candidates",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setCandidatesLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      invited: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      started: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      expired: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[status as keyof typeof colors] || colors.invited
  }

  const downloadResults = () => {
    const csvContent = [
      ["Name", "Email", "Status", "Score", "Time Spent", "Started At", "Submitted At"],
      ...candidates.map(c => [
        c.name,
        c.email,
        c.status,
        c.score?.toString() || "",
        c.timeSpent ? `${Math.round(c.timeSpent / 60)}m` : "",
        c.startedAt ? new Date(c.startedAt).toLocaleString() : "",
        c.submittedAt ? new Date(c.submittedAt).toLocaleString() : "",
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assessment?.title || 'assessment'}-results.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Assessment not found</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  const completedCandidates = candidates.filter(c => c.status === 'completed').length
  const averageScore = candidates
    .filter(c => c.score !== null && c.score !== undefined)
    .reduce((sum, c) => sum + (c.score || 0), 0) / (completedCandidates || 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {assessment.title}
            </h1>
            <p className="text-muted-foreground">
              Created by {assessment.createdBy.firstName} {assessment.createdBy.lastName} • {new Date(assessment.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={`rounded-xl border ${assessment.status === 'live' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
            {assessment.status}
          </Badge>
          <Button variant="outline" className="rounded-xl">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button className="rounded-xl primary-gradient glow-primary">
            <Play className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{candidates.length}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{completedCandidates}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {completedCandidates > 0 ? `${Math.round(averageScore)}%` : "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assessment.duration}m</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px] rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="candidates" className="rounded-xl">
            Candidates
          </TabsTrigger>
          <TabsTrigger value="overview" className="rounded-xl">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Candidates ({candidates.length})
                </CardTitle>
                <div className="flex items-center gap-3">
                  {candidates.length > 0 && (
                    <Button onClick={downloadResults} variant="outline" className="rounded-xl">
                      <Download className="mr-2 h-4 w-4" />
                      Export Results
                    </Button>
                  )}
                  <CandidateAllocation
                    assessmentId={assessmentId}
                    assessmentTitle={assessment.title}
                    onSuccess={loadCandidates}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {candidatesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : candidates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No candidates allocated yet</p>
                  <CandidateAllocation
                    assessmentId={assessmentId}
                    assessmentTitle={assessment.title}
                    onSuccess={loadCandidates}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Time Spent</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidates.map((candidate) => (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>
                          <Badge className={`rounded-xl border ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {candidate.score !== null && candidate.score !== undefined
                            ? `${candidate.score}/${assessment.totalMarks}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {candidate.timeSpent ? `${Math.round(candidate.timeSpent / 60)}m` : "N/A"}
                        </TableCell>
                        <TableCell>
                          {candidate.submittedAt
                            ? new Date(candidate.submittedAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="rounded-xl">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="rounded-xl">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">{assessment.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{assessment.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Questions</p>
                  <p className="font-medium">{assessment.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="font-medium">{assessment.totalMarks}</p>
                </div>
              </div>
              {assessment.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{assessment.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Analytics will be available once candidates complete the assessment</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Assessment Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Assessment settings and configuration options</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
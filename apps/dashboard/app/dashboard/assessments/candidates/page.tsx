"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft,
  Users, 
  Eye, 
  Mail, 
  Download,
  Plus,
  Target,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CandidateAllocation } from "@/components/assessments/candidate-allocation"
import { assessmentsApi } from "@/lib/api/api"

interface Candidate {
  id: string
  name: string
  email: string
  status: string
  score?: number
  timeSpent?: number
  startedAt?: string
  submittedAt?: string
  assessmentId: string
  assessment?: {
    title: string
    type: string
    duration: number
  }
}

interface Assessment {
  id: string
  title: string
  type: string
  duration: number
  totalMarks: number
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    loadAssessments()
    const assessmentId = searchParams.get('assessmentId')
    if (assessmentId) {
      setSelectedAssessment(assessmentId)
    }
  }, [searchParams])

  useEffect(() => {
    if (Array.isArray(assessments) && assessments.length > 0 && selectedAssessment) {
      loadCandidates()
    }
  }, [selectedAssessment, assessments])

  const loadAssessments = async () => {
    try {
      const data = await assessmentsApi.getAll()
      setAssessments(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error loading assessments:', error)
      setAssessments([])
      toast({
        title: "Error Loading Assessments",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCandidates = async () => {
    if (!selectedAssessment) return
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/candidates?assessmentId=${selectedAssessment}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCandidates(Array.isArray(data) ? data : [])
    } catch (error: any) {
      console.error('Error loading candidates:', error)
      setCandidates([])
      toast({
        title: "Error Loading Candidates",
        description: error.message,
        variant: "destructive",
      })
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'started':
        return <Clock className="h-4 w-4" />
      case 'expired':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const downloadResults = () => {
    if (!selectedAssessment) return
    
    const assessment = Array.isArray(assessments) ? assessments.find(a => a.id === selectedAssessment) : null
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
    a.download = `${assessment?.title || 'assessment'}-candidates.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading candidates...</p>
        </div>
      </div>
    )
  }

  const currentAssessment = Array.isArray(assessments) ? assessments.find(a => a.id === selectedAssessment) : null
  const completedCandidates = Array.isArray(candidates) ? candidates.filter(c => c.status === 'completed').length : 0
  const averageScore = Array.isArray(candidates) && completedCandidates > 0 ? 
    candidates
      .filter(c => c.score !== null && c.score !== undefined)
      .reduce((sum, c) => sum + (c.score || 0), 0) / completedCandidates : 0

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
              Candidate Management
            </h1>
            <p className="text-muted-foreground">
              Manage candidates across all assessments
            </p>
          </div>
        </div>
      </div>

      {/* Assessment Selector */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <select
              value={selectedAssessment}
              onChange={(e) => setSelectedAssessment(e.target.value)}
              className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an assessment...</option>
              {Array.isArray(assessments) && assessments.map((assessment) => (
                <option key={assessment.id} value={assessment.id}>
                  {assessment.title} ({assessment.type.toUpperCase()})
                </option>
              ))}
            </select>
            {selectedAssessment && (
              <Button onClick={loadCandidates} variant="outline" className="rounded-xl">
                <BarChart3 className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAssessment && currentAssessment && (
        <>
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
                  <CheckCircle className="h-4 w-4" />
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
                <div className="text-2xl font-bold text-foreground">{currentAssessment.duration}m</div>
              </CardContent>
            </Card>
          </div>

          {/* Candidates Table */}
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
                    assessmentId={selectedAssessment}
                    assessmentTitle={currentAssessment.title}
                    onSuccess={loadCandidates}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No candidates allocated to this assessment yet</p>
                  <CandidateAllocation
                    assessmentId={selectedAssessment}
                    assessmentTitle={currentAssessment.title}
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
                          <div className="flex items-center gap-2">
                            {getStatusIcon(candidate.status)}
                            <Badge className={`rounded-xl border ${getStatusColor(candidate.status)}`}>
                              {candidate.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {candidate.score !== null && candidate.score !== undefined
                            ? `${candidate.score}/${currentAssessment.totalMarks}`
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
        </>
      )}
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  AlertTriangle,
  User,
  Calendar,
  Timer,
  Award,
  Send
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
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isResending, setIsResending] = useState<string | null>(null)
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
      const { candidatesApi } = await import("@/lib/api")
      const data = await candidatesApi.getByAssessment(selectedAssessment)
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

  const viewCandidateDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsDetailsOpen(true)
  }

  const resendEmail = async (candidate: Candidate) => {
    setIsResending(candidate.id)
    try {
      const { candidatesApi } = await import("@/lib/api")
      await candidatesApi.sendEmail(candidate.id)
      toast({
        title: "Email Sent Successfully",
        description: `New credentials have been sent to ${candidate.email}`,
      })
    } catch (error: any) {
      console.error('Error resending email:', error)
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResending(null)
    }
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
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="rounded-xl hover:bg-blue-500/10 hover:text-blue-400"
                              onClick={() => viewCandidateDetails(candidate)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="rounded-xl hover:bg-green-500/10 hover:text-green-400"
                              onClick={() => resendEmail(candidate)}
                              disabled={isResending === candidate.id}
                              title="Resend Credentials Email"
                            >
                              {isResending === candidate.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
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

      {/* Candidate Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Candidate Details
            </DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg font-semibold">{selectedCandidate.name}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{selectedCandidate.email}</p>
                </div>
              </div>

              {/* Status and Assessment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedCandidate.status)}
                    <Badge className={`rounded-xl border ${getStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Assessment</label>
                  <p className="text-lg">{currentAssessment?.title}</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Score
                  </label>
                  <p className="text-2xl font-bold">
                    {selectedCandidate.score !== null && selectedCandidate.score !== undefined
                      ? `${selectedCandidate.score}/${currentAssessment?.totalMarks}`
                      : "Not Available"}
                  </p>
                  {selectedCandidate.score !== null && selectedCandidate.score !== undefined && currentAssessment?.totalMarks && (
                    <p className="text-sm text-muted-foreground">
                      {Math.round((selectedCandidate.score / currentAssessment.totalMarks) * 100)}% Score
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Timer className="h-4 w-4" />
                    Time Spent
                  </label>
                  <p className="text-2xl font-bold">
                    {selectedCandidate.timeSpent ? `${Math.round(selectedCandidate.timeSpent / 60)}m` : "N/A"}
                  </p>
                  {selectedCandidate.timeSpent && currentAssessment?.duration && (
                    <p className="text-sm text-muted-foreground">
                      {Math.round((selectedCandidate.timeSpent / 60 / currentAssessment.duration) * 100)}% of allotted time
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration
                  </label>
                  <p className="text-2xl font-bold">{currentAssessment?.duration}m</p>
                  <p className="text-sm text-muted-foreground">Allotted Time</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Started At
                  </label>
                  <p className="text-lg">
                    {selectedCandidate.startedAt 
                      ? new Date(selectedCandidate.startedAt).toLocaleString()
                      : "Not Started"}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Submitted At
                  </label>
                  <p className="text-lg">
                    {selectedCandidate.submittedAt 
                      ? new Date(selectedCandidate.submittedAt).toLocaleString()
                      : "Not Submitted"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button 
                  onClick={() => resendEmail(selectedCandidate)}
                  disabled={isResending === selectedCandidate.id}
                  className="rounded-xl"
                  variant="outline"
                >
                  {isResending === selectedCandidate.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Resend Credentials
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setIsDetailsOpen(false)}
                  variant="ghost"
                  className="rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ArrowLeft,
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock,
  Target,
  Users,
  Activity,
  RefreshCw,
  Download,
  XCircle,
  CheckCircle,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { assessmentsApi } from "@/lib/api/api"

interface ProctoringEvent {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  eventType: string
  severity: 'critical' | 'warning' | 'minor'
  description: string
  timestamp: string
  metadata: any
}

interface CandidateViolation {
  candidateId: string
  name: string
  email: string
  status: string
  totalViolations: number
  criticalViolations: number
  warningViolations: number
  minorViolations: number
  lastViolation: string
  riskLevel: 'high' | 'medium' | 'low'
}

interface Assessment {
  id: string
  title: string
  type: string
  duration: number
  totalMarks: number
}

export default function ProctoringPage() {
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([])
  const [candidateViolations, setCandidateViolations] = useState<CandidateViolation[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [realTimeEnabled, setRealTimeEnabled] = useState(false)
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
    if (selectedAssessment && Array.isArray(assessments) && assessments.length > 0) {
      loadProctoringData()
    }
  }, [selectedAssessment, assessments])

  // Real-time updates
  useEffect(() => {
    if (realTimeEnabled && selectedAssessment) {
      const interval = setInterval(() => {
        loadProctoringData()
      }, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [realTimeEnabled, selectedAssessment])

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

  const loadProctoringData = async () => {
    if (!selectedAssessment) return
    
    setEventsLoading(true)
    try {
      // Load proctoring events
      const eventsResponse = await fetch(`http://localhost:5000/api/admin/proctoring/events?assessmentId=${selectedAssessment}`, {
        credentials: 'include',
      })
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json()
        setProctoringEvents(Array.isArray(eventsData) ? eventsData : [])
      } else {
        setProctoringEvents([])
      }

      // Load candidate violations summary
      const violationsResponse = await fetch(`http://localhost:5000/api/admin/proctoring/violations?assessmentId=${selectedAssessment}`, {
        credentials: 'include',
      })
      if (violationsResponse.ok) {
        const violationsData = await violationsResponse.json()
        setCandidateViolations(Array.isArray(violationsData) ? violationsData : [])
      } else {
        setCandidateViolations([])
      }
    } catch (error: any) {
      console.error('Error loading proctoring data:', error)
      setProctoringEvents([])
      setCandidateViolations([])
      toast({
        title: "Error Loading Proctoring Data",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setEventsLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: "bg-red-500/20 text-red-400 border-red-500/30",
      warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      minor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    }
    return colors[severity as keyof typeof colors] || colors.minor
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'minor':
        return <Eye className="h-4 w-4" />
      default:
        return <Eye className="h-4 w-4" />
    }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    const colors = {
      high: "bg-red-500/20 text-red-400 border-red-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      low: "bg-green-500/20 text-green-400 border-green-500/30",
    }
    return colors[riskLevel as keyof typeof colors] || colors.low
  }

  const downloadProctoringReport = () => {
    if (!selectedAssessment) return
    
    const assessment = Array.isArray(assessments) ? assessments.find(a => a.id === selectedAssessment) : null
    const csvContent = [
      ["Candidate Name", "Email", "Event Type", "Severity", "Description", "Timestamp"],
      ...proctoringEvents.map(event => [
        event.candidateName,
        event.candidateEmail,
        event.eventType,
        event.severity,
        event.description,
        new Date(event.timestamp).toLocaleString()
      ])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${assessment?.title || 'assessment'}-proctoring-report.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading proctoring data...</p>
        </div>
      </div>
    )
  }

  const currentAssessment = Array.isArray(assessments) ? assessments.find(a => a.id === selectedAssessment) : null
  const totalViolations = Array.isArray(proctoringEvents) ? proctoringEvents.length : 0
  const criticalViolations = Array.isArray(proctoringEvents) ? proctoringEvents.filter(e => e.severity === 'critical').length : 0
  const highRiskCandidates = Array.isArray(candidateViolations) ? candidateViolations.filter(c => c.riskLevel === 'high').length : 0

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
              Proctoring Monitor
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and violation tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            variant={realTimeEnabled ? "default" : "outline"}
            className="rounded-xl"
          >
            <Activity className="mr-2 h-4 w-4" />
            {realTimeEnabled ? "Live" : "Enable Live"}
          </Button>
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
              <Button onClick={loadProctoringData} variant="outline" className="rounded-xl">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAssessment && currentAssessment && (
        <>
          {/* Proctoring Overview */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Total Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalViolations}</div>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Critical Violations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{criticalViolations}</div>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  High Risk Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{highRiskCandidates}</div>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Monitored Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{candidateViolations.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Candidate Risk Assessment */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Candidate Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidateViolations.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No proctoring data available</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Total Violations</TableHead>
                      <TableHead>Critical</TableHead>
                      <TableHead>Warning</TableHead>
                      <TableHead>Minor</TableHead>
                      <TableHead>Last Violation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {candidateViolations.map((violation) => (
                      <TableRow key={violation.candidateId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{violation.name}</div>
                            <div className="text-sm text-muted-foreground">{violation.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-xl border bg-blue-500/20 text-blue-400 border-blue-500/30`}>
                            {violation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`rounded-xl border ${getRiskLevelColor(violation.riskLevel)}`}>
                            {violation.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{violation.totalViolations}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-400 font-medium">{violation.criticalViolations}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-yellow-400 font-medium">{violation.warningViolations}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-400 font-medium">{violation.minorViolations}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {violation.lastViolation ? new Date(violation.lastViolation).toLocaleString() : "N/A"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Violations */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Violations ({proctoringEvents.length})
                </CardTitle>
                <div className="flex items-center gap-3">
                  {proctoringEvents.length > 0 && (
                    <Button onClick={downloadProctoringReport} variant="outline" className="rounded-xl">
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                  )}
                  {realTimeEnabled && (
                    <div className="flex items-center gap-2 text-green-400">
                      <Zap className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Live</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : proctoringEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <p className="text-muted-foreground">No violations detected</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {proctoringEvents.slice(0, 50).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{event.candidateName}</div>
                            <div className="text-sm text-muted-foreground">{event.candidateEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium capitalize">{event.eventType.replace('_', ' ')}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(event.severity)}
                            <Badge className={`rounded-xl border ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{event.description}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
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
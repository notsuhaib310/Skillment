"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Activity,
  Search,
  Filter,
  Shield,
  Camera,
  Video,
  AlertCircle,
  PlayCircle,
  FileText,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Wifi,
  MousePointer,
  Copy,
  FileX,
  Timer,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { assessmentsApi, candidatesApi } from "@/lib/api"

interface CandidateResult {
  id: string
  name: string
  email: string
  status: string
  score: number
  totalMarks: number
  percentage: number
  timeSpent: number
  startedAt: string
  submittedAt: string
  violations: {
    critical: number
    warning: number
    minor: number
  }
  answers: any[]
  proctoring: {
    webcamMonitored: boolean
    screenRecorded: boolean
    tabSwitches: number
    copyPasteAttempts: number
    rightClickAttempts: number
    fullscreenExits: number
    suspiciousActivity: number
    faceDetectionFailures: number
    multiplePersonsDetected: number
    phoneDetected: boolean
    environmentFlags: string[]
    videoRecordingUrl?: string
    screenshots: string[]
    browserInfo: {
      userAgent: string
      screenResolution: string
      browserName: string
    }
  }
  device: {
    type: "desktop" | "mobile" | "tablet"
    os: string
    browser: string
    ipAddress: string
    location?: string
  }
}

interface Assessment {
  id: string
  title: string
  type: string
  duration: number
  totalMarks: number
  totalQuestions: number
}

interface AssessmentAnalytics {
  totalCandidates: number
  completedCandidates: number
  averageScore: number
  averageTime: number
  passRate: number
  scoreDistribution: {
    range: string
    count: number
    percentage: number
  }[]
  topPerformers: {
    name: string
    score: number
    percentage: number
  }[]
}

interface QuestionAnalytics {
  questionId: string
  questionText: string
  questionType: string
  correctAnswer: any
  totalMarks: number
  order: number
  candidateResponses: {
    candidateId: string
    candidateName: string
    candidateEmail: string
    response: any
    isCorrect: boolean
    scoreEarned: number
    isAnswered: boolean
  }[]
  optionAnalytics: {
    [key: string]: {
      text: string
      count: number
      percentage: number
      isCorrect: boolean
    }
  }
  correctResponses: number
  incorrectResponses: number
  unansweredResponses: number
  averageScore: number
}

interface DetailedQuestionAnalytics {
  assessment: {
    id: string
    title: string
    type: string
    totalQuestions: number
    totalMarks: number
  }
  analytics: {
    totalCandidates: number
    questionAnalytics: QuestionAnalytics[]
  }
}

export default function ResultsPage() {
  const [candidateResults, setCandidateResults] = useState<CandidateResult[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null)
  const [questionAnalytics, setQuestionAnalytics] = useState<DetailedQuestionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [questionAnalyticsLoading, setQuestionAnalyticsLoading] = useState(false)
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
      loadResults()
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

  const loadResults = async () => {
    if (!selectedAssessment) return
    
    setResultsLoading(true)
    try {
      // Load candidates with proctoring data
      const candidatesData = await candidatesApi.getByAssessment(selectedAssessment)
      
      // Load analytics data
      const analyticsData = await candidatesApi.getAnalytics(selectedAssessment)
      
      // Load detailed question analytics
      loadQuestionAnalytics()
      
      // Transform candidates data to include results - the backend now provides proctoring data
      const resultsData = Array.isArray(candidatesData) ? candidatesData.map((candidate: any) => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        status: candidate.status,
        score: candidate.score || 0,
        totalMarks: candidate.assessment?.totalMarks || analyticsData?.assessment?.totalMarks || 0,
        percentage: candidate.assessment?.totalMarks ? Math.round((candidate.score || 0) / candidate.assessment.totalMarks * 100) : 0,
        timeSpent: candidate.timeSpent || 0,
        startedAt: candidate.startedAt,
        submittedAt: candidate.submittedAt,
        violations: candidate.violations || { critical: 0, warning: 0, minor: 0 },
        answers: candidate.answers || [],
        proctoring: candidate.proctoring || {
          webcamMonitored: false,
          screenRecorded: false,
          tabSwitches: 0,
          copyPasteAttempts: 0,
          rightClickAttempts: 0,
          fullscreenExits: 0,
          suspiciousActivity: 0,
          faceDetectionFailures: 0,
          multiplePersonsDetected: 0,
          phoneDetected: false,
          environmentFlags: [],
          screenshots: [],
          browserInfo: {
            userAgent: "",
            screenResolution: "",
            browserName: ""
          }
        },
        device: candidate.device || {
          type: "desktop",
          os: "",
          browser: "",
          ipAddress: "",
          location: ""
        }
      })) : []
      
      setCandidateResults(resultsData)
      
      // Set analytics data from backend
      if (analyticsData) {
        setAnalytics({
          totalCandidates: analyticsData.analytics?.totalCandidates || 0,
          completedCandidates: analyticsData.analytics?.completedCandidates || 0,
          averageScore: analyticsData.analytics?.averageScore || 0,
          averageTime: analyticsData.analytics?.averageTime || 0,
          passRate: analyticsData.analytics?.passRate || 0,
          scoreDistribution: analyticsData.analytics?.scoreDistribution || [],
          topPerformers: analyticsData.analytics?.topPerformers || []
        })
      } else {
        // Fallback to generated analytics if backend doesn't provide them
        generateAnalytics(resultsData)
      }
    } catch (error: any) {
      console.error('Error loading results:', error)
      setCandidateResults([])
      setAnalytics(null)
      toast({
        title: "Error Loading Results",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setResultsLoading(false)
    }
  }

  const loadQuestionAnalytics = async () => {
    if (!selectedAssessment) return
    
    setQuestionAnalyticsLoading(true)
    try {
      const questionAnalyticsData = await candidatesApi.getQuestionAnalytics(selectedAssessment)
      setQuestionAnalytics(questionAnalyticsData)
    } catch (error: any) {
      console.error('Error loading question analytics:', error)
      setQuestionAnalytics(null)
      toast({
        title: "Error Loading Question Analytics",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setQuestionAnalyticsLoading(false)
    }
  }

  const generateAnalytics = (results: CandidateResult[]) => {
    const completed = results.filter(r => r.status === 'submitted')
    const totalCandidates = results.length
    const completedCandidates = completed.length
    
    if (completedCandidates === 0) {
      setAnalytics({
        totalCandidates,
        completedCandidates,
        averageScore: 0,
        averageTime: 0,
        passRate: 0,
        scoreDistribution: [],
        topPerformers: []
      })
      return
    }

    const averageScore = completed.reduce((sum, r) => sum + r.percentage, 0) / completedCandidates
    const averageTime = completed.reduce((sum, r) => sum + r.timeSpent, 0) / completedCandidates
    const passRate = (completed.filter(r => r.percentage >= 60).length / completedCandidates) * 100

    // Score distribution
    const scoreRanges = [
      { range: '90-100%', min: 90, max: 100 },
      { range: '80-89%', min: 80, max: 89 },
      { range: '70-79%', min: 70, max: 79 },
      { range: '60-69%', min: 60, max: 69 },
      { range: '50-59%', min: 50, max: 59 },
      { range: '0-49%', min: 0, max: 49 }
    ]

    const scoreDistribution = scoreRanges.map(range => {
      const count = completed.filter(r => r.percentage >= range.min && r.percentage <= range.max).length
      return {
        range: range.range,
        count,
        percentage: (count / completedCandidates) * 100
      }
    })

    // Top performers
    const topPerformers = completed
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)
      .map(r => ({
        name: r.name,
        score: r.score,
        percentage: r.percentage
      }))

    setAnalytics({
      totalCandidates,
      completedCandidates,
      averageScore,
      averageTime: averageTime / 60, // Convert to minutes
      passRate,
      scoreDistribution,
      topPerformers
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      invited: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      started: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      submitted: "bg-green-500/20 text-green-400 border-green-500/30",
      completed: "bg-green-500/20 text-green-400 border-green-500/30",
      expired: "bg-red-500/20 text-red-400 border-red-500/30",
    }
    return colors[status as keyof typeof colors] || colors.invited
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const downloadResults = () => {
    if (!selectedAssessment) return
    
    const assessment = Array.isArray(assessments) ? assessments.find(a => a.id === selectedAssessment) : null
    const csvContent = [
      ["Name", "Email", "Status", "Score", "Total Marks", "Percentage", "Time Spent (min)", "Started At", "Submitted At", "Critical Violations", "Warning Violations", "Minor Violations"],
      ...candidateResults.map(r => [
        r.name,
        r.email,
        r.status,
        r.score.toString(),
        r.totalMarks.toString(),
        `${r.percentage}%`,
        Math.round(r.timeSpent / 60).toString(),
        r.startedAt ? new Date(r.startedAt).toLocaleString() : "",
        r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "",
        r.violations.critical.toString(),
        r.violations.warning.toString(),
        r.violations.minor.toString()
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
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const currentAssessment = Array.isArray(assessments) ? assessments.find(a => a.id === selectedAssessment) : null

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
              Results & Analytics
            </h1>
            <p className="text-muted-foreground">
              Detailed assessment results and performance analytics
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
              <Button onClick={loadResults} variant="outline" className="rounded-xl">
                <BarChart3 className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAssessment && currentAssessment && analytics && (
        <>
          {/* Analytics Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {analytics.totalCandidates > 0 ? `${Math.round((analytics.completedCandidates / analytics.totalCandidates) * 100)}%` : "0%"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.completedCandidates} of {analytics.totalCandidates} candidates
                </p>
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
                  {Math.round(analytics.averageScore)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall performance
                </p>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">
                  {Math.round(analytics.passRate)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  60% or above
                </p>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Average Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(analytics.averageTime)}m
                </div>
                <p className="text-xs text-muted-foreground">
                  of {currentAssessment.duration}m allowed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Score Distribution and Top Performers */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.scoreDistribution.map((dist, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{dist.range}</span>
                        <span>{dist.count} candidates ({Math.round(dist.percentage)}%)</span>
                      </div>
                      <Progress value={dist.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topPerformers.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-medium">{performer.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{performer.percentage}%</div>
                        <div className="text-xs text-muted-foreground">{performer.score} points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Results with Proctoring */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Detailed Results & Proctoring ({candidateResults.length})
                </CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates..."
                      className="w-64 rounded-xl"
                    />
                  </div>
                  <Button variant="outline" className="rounded-xl">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                  {candidateResults.length > 0 && (
                    <Button onClick={downloadResults} variant="outline" className="rounded-xl">
                      <Download className="mr-2 h-4 w-4" />
                      Export Results
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {resultsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : candidateResults.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No results available for this assessment</p>
                </div>
              ) : (
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-accent/20">
                    <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
                    <TabsTrigger value="proctoring" className="rounded-xl">Proctoring</TabsTrigger>
                    <TabsTrigger value="analytics" className="rounded-xl">Analytics</TabsTrigger>
                    <TabsTrigger value="detailed" className="rounded-xl">Detailed View</TabsTrigger>
                    <TabsTrigger value="questions" className="rounded-xl">Question Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Risk Level</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidateResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                                  <span className="font-medium text-primary">
                                    {result.name[0]?.toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium">{result.name}</div>
                                  <div className="text-sm text-muted-foreground">{result.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-xl border ${getStatusColor(result.status)}`}>
                                {result.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-right">
                                <div className={`font-bold text-lg ${getScoreColor(result.percentage)}`}>
                                  {result.percentage}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {result.score}/{result.totalMarks} pts
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Timer className="h-4 w-4 text-muted-foreground" />
                                <span>{Math.round(result.timeSpent / 60)}m</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {result.device.type === "desktop" && <Monitor className="h-4 w-4" />}
                                {result.device.type === "mobile" && <Smartphone className="h-4 w-4" />}
                                {result.device.type === "tablet" && <Smartphone className="h-4 w-4" />}
                                <span className="text-sm">{result.device.browser}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {(result.violations.critical + result.violations.warning) > 5 ? (
                                <Badge variant="destructive" className="rounded-xl">High Risk</Badge>
                              ) : (result.violations.critical + result.violations.warning) > 2 ? (
                                <Badge variant="secondary" className="rounded-xl">Medium Risk</Badge>
                              ) : (
                                <Badge variant="outline" className="rounded-xl">Low Risk</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="rounded-xl">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="rounded-xl">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="proctoring">
                    <div className="space-y-6">
                      {candidateResults.map((result) => (
                        <Card key={result.id} className="rounded-2xl border-border/30">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-orange-500/20 flex items-center justify-center">
                                  <span className="font-medium text-primary">
                                    {result.name[0]?.toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="font-semibold">{result.name}</h4>
                                  <p className="text-sm text-muted-foreground">{result.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.proctoring.videoRecordingUrl && (
                                  <Button size="sm" variant="outline" className="rounded-xl">
                                    <Video className="mr-2 h-4 w-4" />
                                    View Recording
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="rounded-xl">
                                  <Shield className="mr-2 h-4 w-4" />
                                  Proctoring Report
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Camera className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm font-medium">Webcam Monitoring</span>
                                </div>
                                <Badge variant={result.proctoring.webcamMonitored ? "default" : "secondary"} className="rounded-xl">
                                  {result.proctoring.webcamMonitored ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  <span className="text-sm font-medium">Tab Switches</span>
                                </div>
                                <div className="text-2xl font-bold text-orange-500">
                                  {result.proctoring.tabSwitches}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Copy className="h-4 w-4 text-red-500" />
                                  <span className="text-sm font-medium">Copy/Paste</span>
                                </div>
                                <div className="text-2xl font-bold text-red-500">
                                  {result.proctoring.copyPasteAttempts}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Monitor className="h-4 w-4 text-purple-500" />
                                  <span className="text-sm font-medium">Fullscreen Exits</span>
                                </div>
                                <div className="text-2xl font-bold text-purple-500">
                                  {result.proctoring.fullscreenExits}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <div className="grid gap-6 md:grid-cols-3">
                      <Card className="rounded-2xl border-border/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-500" />
                            Security Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>High Risk Candidates</span>
                              <span className="font-bold text-red-500">
                                {candidateResults.filter(r => (r.violations.critical + r.violations.warning) > 5).length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Medium Risk Candidates</span>
                              <span className="font-bold text-orange-500">
                                {candidateResults.filter(r => (r.violations.critical + r.violations.warning) > 2 && (r.violations.critical + r.violations.warning) <= 5).length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Low Risk Candidates</span>
                              <span className="font-bold text-green-500">
                                {candidateResults.filter(r => (r.violations.critical + r.violations.warning) <= 2).length}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-border/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-green-500" />
                            Device Analytics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>Desktop Users</span>
                              <span className="font-bold">
                                {candidateResults.filter(r => r.device.type === "desktop").length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Mobile Users</span>
                              <span className="font-bold">
                                {candidateResults.filter(r => r.device.type === "mobile").length}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tablet Users</span>
                              <span className="font-bold">
                                {candidateResults.filter(r => r.device.type === "tablet").length}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="rounded-2xl border-border/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-500" />
                            Behavior Insights
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between">
                              <span>Avg Tab Switches</span>
                              <span className="font-bold">
                                {Math.round(candidateResults.reduce((sum, r) => sum + r.proctoring.tabSwitches, 0) / candidateResults.length || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Copy/Paste Attempts</span>
                              <span className="font-bold">
                                {candidateResults.reduce((sum, r) => sum + r.proctoring.copyPasteAttempts, 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Suspicious Activity</span>
                              <span className="font-bold">
                                {candidateResults.reduce((sum, r) => sum + r.proctoring.suspiciousActivity, 0)}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="detailed">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Time Spent</TableHead>
                          <TableHead>Violations</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {candidateResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{result.name}</div>
                                <div className="text-sm text-muted-foreground">{result.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`rounded-xl border ${getStatusColor(result.status)}`}>
                                {result.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{result.score}/{result.totalMarks}</span>
                            </TableCell>
                            <TableCell>
                              <span className={`font-bold ${getScoreColor(result.percentage)}`}>
                                {result.percentage}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{Math.round(result.timeSpent / 60)}m</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {result.violations.critical > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {result.violations.critical} Critical
                                  </Badge>
                                )}
                                {result.violations.warning > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {result.violations.warning} Warning
                                  </Badge>
                                )}
                                {result.violations.minor > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {result.violations.minor} Minor
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="ghost" className="rounded-xl">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  <TabsContent value="questions">
                    {questionAnalyticsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading question analytics...</span>
                      </div>
                    ) : questionAnalytics ? (
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-3">
                          <Card className="rounded-2xl border-border/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Total Questions
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-foreground">
                                {questionAnalytics.assessment.totalQuestions}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {questionAnalytics.assessment.totalMarks} total marks
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="rounded-2xl border-border/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Analyzed Responses
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-foreground">
                                {questionAnalytics.analytics.totalCandidates}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Submitted candidates
                              </p>
                            </CardContent>
                          </Card>

                          <Card className="rounded-2xl border-border/30">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Average Performance
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-foreground">
                                {Math.round((questionAnalytics.analytics.questionAnalytics.reduce((sum, q) => sum + q.averageScore, 0) / questionAnalytics.analytics.questionAnalytics.length) * 100) / 100}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Average score per question
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-6">
                          {questionAnalytics.analytics.questionAnalytics.map((question, index) => (
                            <Card key={question.questionId} className="rounded-2xl border-border/30">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                      <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                                        {question.order || index + 1}
                                      </span>
                                      Question {question.order || index + 1}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                      {question.questionText}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <Badge variant="outline" className="rounded-xl">
                                      {question.questionType.replace('_', ' ').toUpperCase()}
                                    </Badge>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {question.totalMarks} marks
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid gap-6 md:grid-cols-2">
                                  {/* Response Statistics */}
                                  <div className="space-y-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <BarChart3 className="h-4 w-4" />
                                      Response Statistics
                                    </h4>
                                    <div className="grid gap-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Correct Responses:</span>
                                        <Badge className="bg-green-900/30 text-green-400 border-green-500/30 rounded-xl">
                                          {question.correctResponses} ({Math.round((question.correctResponses / questionAnalytics.analytics.totalCandidates) * 100)}%)
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Incorrect Responses:</span>
                                        <Badge className="bg-red-900/30 text-red-400 border-red-500/30 rounded-xl">
                                          {question.incorrectResponses} ({Math.round((question.incorrectResponses / questionAnalytics.analytics.totalCandidates) * 100)}%)
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Unanswered:</span>
                                        <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-500/30 rounded-xl">
                                          {question.unansweredResponses} ({Math.round((question.unansweredResponses / questionAnalytics.analytics.totalCandidates) * 100)}%)
                                        </Badge>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm">Average Score:</span>
                                        <span className="font-bold">
                                          {Math.round(question.averageScore * 100) / 100} / {question.totalMarks}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Option Analytics for MCQ */}
                                  {question.questionType === 'multiple_choice' && Object.keys(question.optionAnalytics).length > 0 && (
                                    <div className="space-y-4">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Option Breakdown
                                      </h4>
                                      <div className="space-y-3">
                                        {Object.entries(question.optionAnalytics).map(([optionValue, analytics], optIndex) => (
                                          <div key={optionValue} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">
                                                  {String.fromCharCode(65 + optIndex)}. {analytics.text}
                                                </span>
                                                {analytics.isCorrect && (
                                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">
                                                  {analytics.count} ({analytics.percentage}%)
                                                </span>
                                              </div>
                                            </div>
                                            <Progress 
                                              value={analytics.percentage} 
                                              className={`h-2 ${analytics.isCorrect ? 'bg-green-900/30' : 'bg-gray-900/30'}`}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Candidate Responses Table */}
                                <div className="mt-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      Individual Responses ({question.candidateResponses.length})
                                    </h4>
                                  </div>
                                  <div className="rounded-xl border">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Candidate</TableHead>
                                          <TableHead>Response</TableHead>
                                          <TableHead>Result</TableHead>
                                          <TableHead>Score</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {question.candidateResponses.slice(0, 10).map((response) => (
                                          <TableRow key={response.candidateId}>
                                            <TableCell>
                                              <div>
                                                <div className="font-medium">{response.candidateName}</div>
                                                <div className="text-sm text-muted-foreground">{response.candidateEmail}</div>
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              <div className="max-w-xs truncate">
                                                {response.isAnswered ? (
                                                  <span>{JSON.stringify(response.response)}</span>
                                                ) : (
                                                  <span className="text-muted-foreground italic">No answer</span>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell>
                                              {response.isAnswered ? (
                                                response.isCorrect ? (
                                                  <Badge className="bg-green-900/30 text-green-400 border-green-500/30 rounded-xl">
                                                    Correct
                                                  </Badge>
                                                ) : (
                                                  <Badge className="bg-red-900/30 text-red-400 border-red-500/30 rounded-xl">
                                                    Incorrect
                                                  </Badge>
                                                )
                                              ) : (
                                                <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-500/30 rounded-xl">
                                                  Unanswered
                                                </Badge>
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              <span className="font-medium">
                                                {response.scoreEarned} / {question.totalMarks}
                                              </span>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                    {question.candidateResponses.length > 10 && (
                                      <div className="p-4 text-center border-t">
                                        <span className="text-sm text-muted-foreground">
                                          Showing 10 of {question.candidateResponses.length} responses
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No question analytics available</p>
                        <Button 
                          onClick={loadQuestionAnalytics} 
                          variant="outline" 
                          className="mt-4 rounded-xl"
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Load Question Analytics
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
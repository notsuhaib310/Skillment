"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  Download,
  Calendar,
  FileText,
  PieChart,
  LineChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Shield,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Zap,
  Eye,
  Filter,
  RefreshCw,
  Settings
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { reportsApi } from "@/lib/api"

interface ReportData {
  assessments: {
    total: number
    published: number
    draft: number
    completed: number
  }
  candidates: {
    total: number
    active: number
    completed: number
    inProgress: number
  }
  performance: {
    averageScore: number
    passRate: number
    completionRate: number
    averageTime: number
  }
  trends: {
    month: string
    assessments: number
    candidates: number
    averageScore: number
  }[]
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  securityMetrics: {
    lowRisk: number
    mediumRisk: number
    highRisk: number
    totalViolations: number
  }
}

interface PerformanceData {
  topPerformers: {
    name: string
    score: number
    assessment: string
  }[]
  scoreRanges: {
    range: string
    count: number
    percentage: number
  }[]
  timeAnalytics: {
    averageTime: number
    fastestTime: number
    slowestTime: number
    under30MinPercentage: number
  }
}

interface SecurityData {
  securityMetrics: {
    lowRisk: number
    mediumRisk: number
    highRisk: number
    totalViolations: number
    proctoringSuccessRate: number
    falsePositiveRate: number
  }
  violationBreakdown: {
    type: string
    count: number
    severity: string
  }[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [securityData, setSecurityData] = useState<SecurityData | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState("last30days")
  const [selectedAssessmentType, setSelectedAssessmentType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  // Load initial data
  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    try {
      setLoading(true)
      
      // Load overview data
      const overviewData = await reportsApi.getOverview({
        dateRange: selectedDateRange,
        assessmentType: selectedAssessmentType,
        status: selectedStatus
      })
      setReportData(overviewData)
      
      // Load performance data
      const perfData = await reportsApi.getPerformanceAnalytics({
        dateRange: selectedDateRange,
        assessmentType: selectedAssessmentType
      })
      setPerformanceData(perfData)
      
      // Load security data
      const secData = await reportsApi.getSecurityAnalytics({
        dateRange: selectedDateRange,
        assessmentType: selectedAssessmentType
      })
      setSecurityData(secData)
      
    } catch (error) {
      console.error('Error loading reports data:', error)
      toast({
        title: "Error",
        description: "Failed to load reports data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshReports = async () => {
    setRefreshing(true)
    try {
      await loadReportsData()
      toast({
        title: "Reports Updated",
        description: "Latest data has been loaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh reports data.",
        variant: "destructive"
      })
    } finally {
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    loadReportsData()
  }

  const exportReport = async (reportType: string) => {
    try {
      const response = await reportsApi.exportReport({
        reportType,
        format: 'pdf',
        dateRange: selectedDateRange,
        assessmentType: selectedAssessmentType
      })
      
      toast({
        title: "Export Started",
        description: `${reportType} report is being generated and will be available shortly.`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading reports data...</p>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-muted-foreground">Failed to load reports data</p>
          <Button onClick={loadReportsData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive insights and detailed performance analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={refreshReports} variant="outline" disabled={refreshing} className="rounded-xl">
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => exportReport("Complete")} className="rounded-xl primary-gradient">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="last12months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assessment Type</Label>
              <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mcq">MCQ Only</SelectItem>
                  <SelectItem value="coding">Coding Only</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={applyFilters} variant="outline" className="w-full rounded-xl">
                <Eye className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Total Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{reportData.assessments.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs rounded-xl">
                {reportData.assessments.published} Published
              </Badge>
              <Badge variant="secondary" className="text-xs rounded-xl">
                {reportData.assessments.draft} Draft
              </Badge>
            </div>
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
            <div className="text-3xl font-bold text-foreground">{reportData.candidates.total.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={reportData.candidates.total > 0 ? (reportData.candidates.completed / reportData.candidates.total) * 100 : 0} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">
                {reportData.candidates.total > 0 ? Math.round((reportData.candidates.completed / reportData.candidates.total) * 100) : 0}% Complete
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{reportData.performance.averageScore}%</div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-emerald-400">
                {reportData.trends.length >= 2 ? 
                  `${reportData.trends[reportData.trends.length - 1].averageScore > reportData.trends[reportData.trends.length - 2].averageScore ? '+' : ''}${(reportData.trends[reportData.trends.length - 1].averageScore - reportData.trends[reportData.trends.length - 2].averageScore).toFixed(1)}% vs last period` :
                  'No trend data'
                }
              </span>
            </div>
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
            <div className="text-3xl font-bold text-blue-400">{reportData.performance.passRate}%</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs rounded-xl">
                60% threshold
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 rounded-2xl bg-accent/20">
          <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-xl">Performance</TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl">Security</TabsTrigger>
          <TabsTrigger value="trends" className="rounded-xl">Trends</TabsTrigger>
          <TabsTrigger value="custom" className="rounded-xl">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Assessment Distribution */}
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Assessment Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Published</span>
                      <span className="font-bold">
                        {reportData.assessments.total > 0 ? Math.round((reportData.assessments.published / reportData.assessments.total) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={reportData.assessments.total > 0 ? (reportData.assessments.published / reportData.assessments.total) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Draft</span>
                      <span className="font-bold">
                        {reportData.assessments.total > 0 ? Math.round((reportData.assessments.draft / reportData.assessments.total) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={reportData.assessments.total > 0 ? (reportData.assessments.draft / reportData.assessments.total) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="font-bold">
                        {reportData.assessments.total > 0 ? Math.round((reportData.assessments.completed / reportData.assessments.total) * 100) : 0}%
                      </span>
                    </div>
                    <Progress value={reportData.assessments.total > 0 ? (reportData.assessments.completed / reportData.assessments.total) * 100 : 0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Device Usage */}
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Device Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-blue-500" />
                      <span>Desktop</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reportData.deviceBreakdown.desktop}%</div>
                      <Progress value={reportData.deviceBreakdown.desktop} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-500" />
                      <span>Mobile</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reportData.deviceBreakdown.mobile}%</div>
                      <Progress value={reportData.deviceBreakdown.mobile} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-purple-500" />
                      <span>Tablet</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{reportData.deviceBreakdown.tablet}%</div>
                      <Progress value={reportData.deviceBreakdown.tablet} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Report Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button onClick={() => exportReport("Assessment Summary")} variant="outline" className="h-16 rounded-2xl flex-col gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="text-sm">Assessment Summary</span>
                </Button>
                <Button onClick={() => exportReport("Candidate Performance")} variant="outline" className="h-16 rounded-2xl flex-col gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-sm">Candidate Performance</span>
                </Button>
                <Button onClick={() => exportReport("Security Report")} variant="outline" className="h-16 rounded-2xl flex-col gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Security Report</span>
                </Button>
                <Button onClick={() => exportReport("Trend Analysis")} variant="outline" className="h-16 rounded-2xl flex-col gap-2">
                  <LineChart className="h-5 w-5" />
                  <span className="text-sm">Trend Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {performanceData && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.topPerformers.length > 0 ? (
                      performanceData.topPerformers.map((performer, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-primary to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{performer.name}</div>
                              <div className="text-xs text-muted-foreground">{performer.assessment}</div>
                            </div>
                          </div>
                          <div className="font-bold text-green-600">{performer.score}%</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No performance data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Score Ranges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {performanceData.scoreRanges.map((range, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{range.range}</span>
                          <span>{range.count} candidates ({range.percentage}%)</span>
                        </div>
                        <Progress value={range.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    Time Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Completion Time</span>
                      <span className="font-bold">{performanceData.timeAnalytics.averageTime}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fastest Completion</span>
                      <span className="font-bold text-green-500">{performanceData.timeAnalytics.fastestTime}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Slowest Completion</span>
                      <span className="font-bold text-red-500">{performanceData.timeAnalytics.slowestTime}m</span>
                    </div>
                    <div className="space-y-2 pt-2 border-t">
                      <span className="text-sm font-medium">Completion Rate by Time</span>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Under 30min</span>
                          <span>{performanceData.timeAnalytics.under30MinPercentage}%</span>
                        </div>
                        <Progress value={performanceData.timeAnalytics.under30MinPercentage} className="h-1" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {securityData && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Security Risk Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-500">{securityData.securityMetrics.lowRisk}</div>
                        <div className="text-sm text-muted-foreground">Low Risk</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-500">{securityData.securityMetrics.mediumRisk}</div>
                        <div className="text-sm text-muted-foreground">Medium Risk</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-500">{securityData.securityMetrics.highRisk}</div>
                        <div className="text-sm text-muted-foreground">High Risk</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Violations Detected</span>
                        <Badge variant="destructive" className="rounded-xl">
                          {securityData.securityMetrics.totalViolations}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Proctoring Success Rate</span>
                        <span className="font-bold text-green-500">{securityData.securityMetrics.proctoringSuccessRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>False Positive Rate</span>
                        <span className="font-bold text-blue-500">{securityData.securityMetrics.falsePositiveRate}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Violation Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {securityData.violationBreakdown.map((violation, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={violation.severity === "high" ? "destructive" : violation.severity === "medium" ? "secondary" : "outline"} 
                            className="text-xs rounded-xl"
                          >
                            {violation.severity.toUpperCase()}
                          </Badge>
                          <span className="text-sm">{violation.type}</span>
                        </div>
                        <div className="font-bold">{violation.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Performance Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="h-64 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Interactive Chart Placeholder</p>
                    <p className="text-sm text-muted-foreground">Assessment performance over time</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportData.trends.slice(-3).map((trend, index) => (
                    <Card key={index} className="rounded-2xl border-border/30">
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <div className="text-sm text-muted-foreground">{trend.month} 2024</div>
                          <div className="text-2xl font-bold">{trend.averageScore}%</div>
                          <div className="text-xs text-muted-foreground">
                            {trend.candidates} candidates • {trend.assessments} assessments
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Report Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select defaultValue="performance">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="performance">Performance Analysis</SelectItem>
                        <SelectItem value="security">Security Audit</SelectItem>
                        <SelectItem value="usage">Usage Statistics</SelectItem>
                        <SelectItem value="comparative">Comparative Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Include Metrics</Label>
                    <Select defaultValue="all">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Metrics</SelectItem>
                        <SelectItem value="scores">Scores Only</SelectItem>
                        <SelectItem value="time">Time Analysis</SelectItem>
                        <SelectItem value="violations">Violations Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                        <SelectItem value="excel">Excel Workbook</SelectItem>
                        <SelectItem value="json">JSON Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <h4 className="font-medium">Generate Custom Report</h4>
                    <p className="text-sm text-muted-foreground">Create a tailored report with your selected parameters</p>
                  </div>
                  <Button onClick={() => exportReport("Custom")} className="rounded-xl primary-gradient">
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

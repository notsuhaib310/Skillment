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

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    assessments: { total: 45, published: 38, draft: 7, completed: 32 },
    candidates: { total: 1247, active: 234, completed: 856, inProgress: 157 },
    performance: { averageScore: 78.5, passRate: 82.3, completionRate: 89.7, averageTime: 42.3 },
    trends: [
      { month: "Jan", assessments: 12, candidates: 156, averageScore: 75.2 },
      { month: "Feb", assessments: 15, candidates: 189, averageScore: 78.1 },
      { month: "Mar", assessments: 18, candidates: 223, averageScore: 81.4 },
      { month: "Apr", assessments: 22, candidates: 267, averageScore: 79.8 },
      { month: "May", assessments: 25, candidates: 298, averageScore: 82.1 },
      { month: "Jun", assessments: 28, candidates: 314, averageScore: 84.3 }
    ],
    deviceBreakdown: { desktop: 68, mobile: 22, tablet: 10 },
    securityMetrics: { lowRisk: 892, mediumRisk: 234, highRisk: 67, totalViolations: 156 }
  })
  
  const [selectedDateRange, setSelectedDateRange] = useState("last30days")
  const [selectedAssessmentType, setSelectedAssessmentType] = useState("all")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const refreshReports = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    toast({
      title: "Reports Updated",
      description: "Latest data has been loaded successfully.",
    })
  }

  const exportReport = (type: string) => {
    toast({
      title: "Export Started",
      description: `${type} report is being generated and will be downloaded shortly.`,
    })
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
          <Button onClick={refreshReports} variant="outline" disabled={loading} className="rounded-xl">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                  <SelectItem value="custom">Custom Range</SelectItem>
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
              <Select defaultValue="all">
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
              <Button variant="outline" className="w-full rounded-xl">
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
              <Progress value={(reportData.candidates.completed / reportData.candidates.total) * 100} className="flex-1 h-2" />
              <span className="text-xs text-muted-foreground">
                {Math.round((reportData.candidates.completed / reportData.candidates.total) * 100)}% Complete
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
              <span className="text-xs text-emerald-400">+2.3% vs last period</span>
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
                      <span className="text-sm">MCQ Assessments</span>
                      <span className="font-bold">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Coding Assessments</span>
                      <span className="font-bold">35%</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hybrid Assessments</span>
                      <span className="font-bold">20%</span>
                    </div>
                    <Progress value={20} className="h-2" />
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
                  {[
                    { name: "Alice Johnson", score: 97, assessment: "JavaScript Advanced" },
                    { name: "Bob Smith", score: 94, assessment: "React Fundamentals" },
                    { name: "Carol Davis", score: 92, assessment: "Node.js Backend" },
                    { name: "David Wilson", score: 91, assessment: "Python Data Science" },
                    { name: "Eve Brown", score: 89, assessment: "Java Spring Boot" }
                  ].map((performer, index) => (
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
                  ))}
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
                  {[
                    { range: "90-100%", count: 156, percentage: 18 },
                    { range: "80-89%", count: 234, percentage: 27 },
                    { range: "70-79%", count: 289, percentage: 33 },
                    { range: "60-69%", count: 178, percentage: 15 },
                    { range: "Below 60%", count: 67, percentage: 7 }
                  ].map((range, index) => (
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
                    <span className="font-bold">{reportData.performance.averageTime}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fastest Completion</span>
                    <span className="font-bold text-green-500">18m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slowest Completion</span>
                    <span className="font-bold text-red-500">89m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Efficiency</span>
                    <span className="font-bold text-blue-500">78%</span>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    <span className="text-sm font-medium">Completion Rate by Time</span>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Under 30min</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
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
                      <div className="text-2xl font-bold text-green-500">{reportData.securityMetrics.lowRisk}</div>
                      <div className="text-sm text-muted-foreground">Low Risk</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-500">{reportData.securityMetrics.mediumRisk}</div>
                      <div className="text-sm text-muted-foreground">Medium Risk</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-500">{reportData.securityMetrics.highRisk}</div>
                      <div className="text-sm text-muted-foreground">High Risk</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Violations Detected</span>
                      <Badge variant="destructive" className="rounded-xl">
                        {reportData.securityMetrics.totalViolations}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Proctoring Success Rate</span>
                      <span className="font-bold text-green-500">94.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>False Positive Rate</span>
                      <span className="font-bold text-blue-500">2.1%</span>
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
                  {[
                    { type: "Tab Switching", count: 45, severity: "medium" },
                    { type: "Copy/Paste Attempts", count: 23, severity: "high" },
                    { type: "Multiple Faces Detected", count: 18, severity: "high" },
                    { type: "Fullscreen Exit", count: 34, severity: "medium" },
                    { type: "Right-click Disabled", count: 12, severity: "low" },
                    { type: "Phone/Device Detected", count: 8, severity: "high" }
                  ].map((violation, index) => (
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

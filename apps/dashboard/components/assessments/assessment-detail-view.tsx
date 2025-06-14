"use client"

import { ArrowLeft, Users, Clock, Target, Download, Play, Edit, Share, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const mockAssessment = {
  id: 1,
  title: "Frontend Developer Assessment",
  type: "coding",
  status: "live",
  createdDate: "2024-01-15",
  createdBy: "Sarah Chen",
  duration: 120,
  totalMarks: 100,
  totalQuestions: 15,
  description: "Comprehensive assessment for frontend developers covering React, JavaScript, and CSS fundamentals.",
  tags: ["React", "JavaScript", "CSS", "HTML", "Frontend"],
}

const mockCandidates = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "completed",
    score: 92,
    timeSpent: 105,
    submittedAt: "2024-01-20 14:30",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "in-progress",
    score: 0,
    timeSpent: 45,
    submittedAt: null,
  },
  {
    id: 3,
    name: "David Chen",
    email: "david.chen@email.com",
    avatar: "/placeholder.svg?height=32&width=32",
    status: "completed",
    score: 78,
    timeSpent: 118,
    submittedAt: "2024-01-19 16:45",
  },
]

const scoreDistribution = [
  { range: "0-20", count: 1 },
  { range: "21-40", count: 2 },
  { range: "41-60", count: 3 },
  { range: "61-80", count: 8 },
  { range: "81-100", count: 10 },
]

const statusColors = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  pending: "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

interface AssessmentDetailViewProps {
  assessmentId: number
  onBack: () => void
}

export function AssessmentDetailView({ assessmentId, onBack }: AssessmentDetailViewProps) {
  const completedCandidates = mockCandidates.filter((c) => c.status === "completed")
  const avgScore =
    completedCandidates.length > 0
      ? Math.round(completedCandidates.reduce((sum, c) => sum + c.score, 0) / completedCandidates.length)
      : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {mockAssessment.title}
          </h1>
          <p className="text-muted-foreground">Assessment Details & Analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button className="rounded-2xl primary-gradient glow-primary">
            <Play className="mr-2 h-4 w-4" />
            Start Test
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
            <div className="text-2xl font-bold text-foreground">{mockCandidates.length}</div>
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
            <div className="text-2xl font-bold text-foreground">{avgScore}%</div>
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
            <div className="text-2xl font-bold text-foreground">{mockAssessment.duration}m</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round((completedCandidates.length / mockCandidates.length) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Info */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle>Assessment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{mockAssessment.description}</p>
          <div className="flex flex-wrap gap-2">
            {mockAssessment.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-xl bg-accent/50 text-foreground border-border/40">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Created By</div>
              <div className="font-medium text-foreground">{mockAssessment.createdBy}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created Date</div>
              <div className="font-medium text-foreground">{mockAssessment.createdDate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
              <div className="font-medium text-foreground">{mockAssessment.totalQuestions}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Marks</div>
              <div className="font-medium text-foreground">{mockAssessment.totalMarks}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="candidates" className="rounded-xl">
            Candidates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-xl">
            Questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Candidate Results</CardTitle>
              <Button variant="outline" className="rounded-2xl">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-muted-foreground font-medium">Candidate</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Score</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Time Spent</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="border-border/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
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
                          className={`rounded-xl border ${statusColors[candidate.status as keyof typeof statusColors]} capitalize`}
                        >
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-foreground">
                            {candidate.status === "completed" ? `${candidate.score}%` : "-"}
                          </div>
                          {candidate.status === "completed" && (
                            <Progress value={candidate.score} className="w-16 h-2" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{candidate.timeSpent}m</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{candidate.submittedAt || "-"}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                    <XAxis dataKey="range" className="text-muted-foreground" />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "1rem",
                        backdropFilter: "blur(12px)",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Assessment Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Question details and preview will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

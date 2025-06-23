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
import { useEffect, useState } from "react"
import { assessmentsApi, questionsApi } from "@/lib/api"

interface AssessmentDetailViewProps {
  assessmentId: number
  onBack: () => void
}

export function AssessmentDetailView({ assessmentId, onBack }: AssessmentDetailViewProps) {
  const [assessment, setAssessment] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      assessmentsApi.getById(String(assessmentId)),
      questionsApi.getAll(String(assessmentId)),
    ])
      .then(([a, q]) => {
        setAssessment(a)
        setQuestions(q)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [assessmentId])

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!assessment) return <div className="p-8 text-center">Assessment not found.</div>;

  const completedCandidates = assessment?.candidates?.filter((c: any) => c.status === "completed") || []
  const avgScore =
    completedCandidates.length > 0
      ? Math.round(completedCandidates.reduce((sum: number, c: any) => sum + c.score, 0) / completedCandidates.length)
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
            {assessment?.title}
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
            <div className="text-2xl font-bold text-foreground">{assessment?.candidates?.length || 0}</div>
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
            <div className="text-2xl font-bold text-foreground">{assessment?.duration}m</div>
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
              {Math.round((completedCandidates.length / assessment?.candidates?.length) * 100) || 0}%
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
          <p className="text-muted-foreground">{assessment?.description}</p>
          <div className="flex flex-wrap gap-2">
            {assessment?.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="rounded-xl bg-accent/50 text-foreground border-border/40">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div>
              <div className="text-sm text-muted-foreground">Created By</div>
              <div className="font-medium text-foreground">{assessment?.createdBy}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created Date</div>
              <div className="font-medium text-foreground">{assessment?.createdDate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
              <div className="font-medium text-foreground">{assessment?.totalQuestions}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Marks</div>
              <div className="font-medium text-foreground">{assessment?.totalMarks}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="candidates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="candidates" className="rounded-xl">Candidates</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl">Analytics</TabsTrigger>
          <TabsTrigger value="questions" className="rounded-xl">Questions</TabsTrigger>
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
                  {assessment.candidates?.map((candidate: any) => (
                    <TableRow key={candidate.id} className="border-border/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-2xl">
                            <AvatarImage src={candidate.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground font-semibold">
                              {candidate.name
                                .split(" ")
                                .map((n: string) => n[0])
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
                        <Badge className={`rounded-xl border capitalize`}>
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
              <div className="h-80 flex items-center justify-center text-muted-foreground">Analytics coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="questions" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Assessment Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-muted-foreground">No questions added yet.</div>
              ) : (
                <ul className="space-y-4">
                  {questions.map((q: any, idx: number) => (
                    <li key={q.id} className="border-b pb-2">
                      <div className="font-semibold">Q{idx + 1}: {q.question}</div>
                      <div className="text-sm text-muted-foreground">Type: {q.type}, Marks: {q.marks}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
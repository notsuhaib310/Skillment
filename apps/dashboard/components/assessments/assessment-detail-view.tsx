"use client"

import { ArrowLeft, Users, Clock, Target, Download, Play, Edit, Share, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { assessmentsApi, type Assessment, getAllParticipants, assignCandidateToAssessment } from "@/lib/api/api"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface AssessmentDetailViewProps {
  assessmentId: string
  onBack: () => void
}

export function AssessmentDetailView({ assessmentId, onBack }: AssessmentDetailViewProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<any[]>([])
  const [allParticipants, setAllParticipants] = useState<any[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([])

  useEffect(() => {
    loadAssessment()
    loadCandidates()
  }, [assessmentId])

  const loadAssessment = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await assessmentsApi.getById(assessmentId)
      setAssessment(data)
      setCandidates(data.candidates || [])
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error Loading Assessment",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCandidates = async () => {
    try {
      const res = await getAllParticipants()
      setAllParticipants(res.participants || [])
    } catch (err) {
      // ignore for now
    }
  }

  const unassignedCandidates = allParticipants.filter(
    (p) => !candidates.some((c) => c.email === p.email)
  )

  const handleAddCandidates = async () => {
    for (const id of selectedToAdd) {
      await assignCandidateToAssessment(id, assessmentId)
    }
    setAddDialogOpen(false)
    setSelectedToAdd([])
    await loadAssessment()
    await loadCandidates()
    toast({ title: "Candidates added" })
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

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground mb-4">Assessment not found.</div>
        <Button onClick={onBack} variant="outline">
          Go Back
        </Button>
      </div>
    )
  }

  const completedCandidates = candidates.filter((c) => c.status === "completed")
  const avgScore =
    completedCandidates.length > 0
      ? Math.round(completedCandidates.reduce((sum, c) => sum + c.score, 0) / completedCandidates.length)
      : 0

  return (
    <div className="space-y-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur border-b border-border/40 py-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 md:px-0">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-xl">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {assessment.title}
              <Badge className="ml-2 capitalize rounded-xl border px-2 py-1 text-xs font-medium">
                {assessment.status}
              </Badge>
            </h1>
            <p className="text-muted-foreground text-sm">Assessment Details & Analytics</p>
          </div>
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
            <div className="text-2xl font-bold text-foreground">{candidates.length}</div>
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
            <div className="text-2xl font-bold text-foreground">{assessment.duration}m</div>
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
              {Math.round((completedCandidates.length / candidates.length) * 100) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle>Assessment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Description</div>
              <div className="text-foreground font-medium mb-2">{assessment.description || <span className="text-muted-foreground">No description provided.</span>}</div>
              <div className="text-sm text-muted-foreground mb-1">Tags</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {assessment.tags?.length ? assessment.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="rounded-xl bg-accent/50 text-foreground border-border/40">
                    {tag}
                  </Badge>
                )) : <span className="text-muted-foreground">No tags</span>}
              </div>
              <div className="text-sm text-muted-foreground mb-1">Created By</div>
              <div className="font-medium text-foreground mb-2">
                {assessment.createdBy
                  ? `${assessment.createdBy.firstName} ${assessment.createdBy.lastName}`
                  : "Unknown"}
              </div>
              <div className="text-sm text-muted-foreground mb-1">Created Date</div>
              <div className="font-medium text-foreground mb-2">{new Date(assessment.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Total Questions</div>
              <div className="font-medium text-foreground mb-2">{assessment.totalQuestions}</div>
              <div className="text-sm text-muted-foreground mb-1">Total Marks</div>
              <div className="font-medium text-foreground mb-2">{assessment.totalMarks}</div>
              <div className="text-sm text-muted-foreground mb-1">Duration</div>
              <div className="font-medium text-foreground mb-2">{assessment.duration} minutes</div>
              <div className="text-sm text-muted-foreground mb-1">Status</div>
              <div className="font-medium text-foreground mb-2 capitalize">{assessment.status}</div>
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
              <Button variant="outline" className="rounded-2xl" onClick={() => setAddDialogOpen(true)}>
                + Add Candidates
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
                  {candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No candidates assigned yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((candidate: any) => (
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
                          <Badge className={`rounded-xl border capitalize`}>{candidate.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {candidate.score ? `${candidate.score}%` : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{candidate.timeSpent || "-"}m</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-foreground">{candidate.submittedAt || "-"}</div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add Candidates Dialog */}
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Candidates to Assessment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {unassignedCandidates.length === 0 ? (
                  <div className="text-muted-foreground text-center">All candidates are already assigned.</div>
                ) : (
                  unassignedCandidates.map((p) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedToAdd.includes(p.id)}
                        onCheckedChange={(checked) => {
                          setSelectedToAdd((prev) =>
                            checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                          )
                        }}
                        className="mr-2"
                      />
                      <Avatar className="h-7 w-7 rounded-2xl">
                        <AvatarImage src={p.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground font-semibold">
                          {p.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-sm text-muted-foreground">{p.email}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCandidates}
                  disabled={selectedToAdd.length === 0}
                  className="primary-gradient"
                >
                  Add Selected
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                Analytics coming soon...
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
              {assessment.questions && assessment.questions.length === 0 ? (
                <div className="text-muted-foreground">No questions added yet.</div>
              ) : (
                <ul className="space-y-4">
                  {assessment.questions?.map((q, idx) => (
                    <li key={q.id} className="border-b pb-2">
                      <div className="font-semibold">
                        Q{idx + 1}: {q.question}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Type: {q.type}, Marks: {q.marks}
                        {q.options && q.options.length > 0 && <span> | Options: {q.options.length}</span>}
                      </div>
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 ml-4">
                          {q.options.map((option, optIdx) => (
                            <div key={optIdx} className="text-sm text-muted-foreground">
                              {String.fromCharCode(65 + optIdx)}. {option}
                              {option === q.correctAnswer && (
                                <Badge className="ml-2 text-xs bg-emerald-500/20 text-emerald-400">Correct</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

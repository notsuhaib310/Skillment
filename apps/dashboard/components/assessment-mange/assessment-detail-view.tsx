"use client"

import { ArrowLeft, Users, Clock, Target, Play, Edit, Share, BarChart3, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

interface AssessmentDetailViewProps {
  assessmentId: string
  onBack: () => void
}

interface Assessment {
  id: string
  title: string
  description: string
  type: string
  status: string
  duration: number
  attemptLimit: number
  showResults: boolean
  enableProctoring: boolean
  randomizeQuestions: boolean
  randomizeOptions: boolean
  allowBackNavigation: boolean
  timeWarnings: boolean
  autoSubmit: boolean
  tags: string[]
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  analytics: {
    totalCandidates: number
    completedCandidates: number
    averageScore: number
    completionRate: number
  }
}

interface Candidate {
  id: string
  email: string
  firstName: string
  lastName: string
  status: string
  score?: number
  attemptCount: number
  maxAttempts: number
  startedAt?: string
  completedAt?: string
  flags: {
    tabSwitches: number
    suspiciousActivity: number
    timeViolations: number
  }
}

export function AssessmentDetailView({ assessmentId, onBack }: AssessmentDetailViewProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
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
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/assessments/${assessmentId}`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch assessment")
      }
      
      const data = await response.json()
      setAssessment(data)
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
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/assessments/${assessmentId}/candidates`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setCandidates(data)
      }
    } catch (err) {
      console.error("Failed to load candidates:", err)
    }
  }

  const handleAddCandidates = async () => {
    try {
      const response = await fetch(`${API_URL}/assessments/${assessmentId}/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          candidateIds: selectedToAdd,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add candidates")
      }

      // Reload candidates
      await loadCandidates()
      setAddDialogOpen(false)
      setSelectedToAdd([])

      toast({
        title: "Candidates Added",
        description: `${selectedToAdd.length} candidates have been added to the assessment.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add candidates",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={onBack} variant="outline" className="rounded-2xl">
          Go Back
        </Button>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="p-8 text-center">
        <div className="text-muted-foreground mb-4">Assessment not found.</div>
        <Button onClick={onBack} variant="outline" className="rounded-2xl">
          Go Back
        </Button>
      </div>
    )
  }

  const completedCandidates = candidates.filter((c) => c.status === "completed" || c.status === "submitted")
  const avgScore = assessment.analytics?.averageScore || 0

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
            <div className="text-2xl font-bold text-foreground">{assessment.analytics?.totalCandidates || 0}</div>
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
              <BarChart3 className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assessment.analytics?.completionRate || 0}%</div>
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

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px] rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
          <TabsTrigger value="candidates" className="rounded-xl">Candidates</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{assessment.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <p className="text-sm mt-1 capitalize">{assessment.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <p className="text-sm mt-1 capitalize">{assessment.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="text-sm mt-1">{assessment.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Attempt Limit</Label>
                    <p className="text-sm mt-1">{assessment.attemptLimit}</p>
                  </div>
                </div>
                {assessment.tags && assessment.tags.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {assessment.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="rounded-xl">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={assessment.showResults} disabled />
                    <Label className="text-sm">Show Results</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={assessment.enableProctoring} disabled />
                    <Label className="text-sm">Proctoring</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={assessment.randomizeQuestions} disabled />
                    <Label className="text-sm">Randomize Questions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={assessment.randomizeOptions} disabled />
                    <Label className="text-sm">Randomize Options</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={assessment.allowBackNavigation} disabled />
                    <Label className="text-sm">Back Navigation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={assessment.timeWarnings} disabled />
                    <Label className="text-sm">Time Warnings</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={assessment.autoSubmit} disabled />
                    <Label className="text-sm">Auto Submit</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Candidates</CardTitle>
              <Button onClick={() => setAddDialogOpen(true)} className="rounded-2xl primary-gradient glow-primary">
                <Users className="mr-2 h-4 w-4" />
                Add Candidates
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-muted-foreground font-medium">Candidate</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Score</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Attempts</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {candidates.map((candidate) => (
                    <TableRow key={candidate.id} className="border-border/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                            <div className="text-sm text-muted-foreground">{candidate.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={candidate.status === "completed" ? "default" : "secondary"}
                          className="rounded-xl capitalize"
                        >
                          {candidate.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {candidate.score !== undefined ? `${candidate.score}%` : "-"}
                      </TableCell>
                      <TableCell>
                        {candidate.attemptCount}/{candidate.maxAttempts}
                      </TableCell>
                      <TableCell>
                        {candidate.flags.tabSwitches + candidate.flags.suspiciousActivity + candidate.flags.timeViolations > 0 ? (
                          <Badge variant="destructive" className="rounded-xl">
                            {candidate.flags.tabSwitches + candidate.flags.suspiciousActivity + candidate.flags.timeViolations}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Completion Rate</Label>
                  <div className="mt-2">
                    <Progress value={assessment.analytics?.completionRate || 0} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessment.analytics?.completedCandidates || 0} of {assessment.analytics?.totalCandidates || 0} candidates completed
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Average Score</Label>
                  <div className="mt-2">
                    <Progress value={assessment.analytics?.averageScore || 0} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-1">
                      {assessment.analytics?.averageScore || 0}% average score
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Candidates Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="rounded-3xl border-border/40">
          <DialogHeader>
            <DialogTitle>Add Candidates</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {allParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2">
                <Checkbox
                  id={participant.id}
                  checked={selectedToAdd.includes(participant.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedToAdd([...selectedToAdd, participant.id])
                    } else {
                      setSelectedToAdd(selectedToAdd.filter((id) => id !== participant.id))
                    }
                  }}
                />
                <Label htmlFor={participant.id} className="flex-1">
                  {participant.firstName} {participant.lastName} ({participant.email})
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} className="rounded-2xl">
              Cancel
            </Button>
            <Button 
              onClick={handleAddCandidates} 
              disabled={selectedToAdd.length === 0}
              className="rounded-2xl primary-gradient glow-primary"
            >
              Add Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

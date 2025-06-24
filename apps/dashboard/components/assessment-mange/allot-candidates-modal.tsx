"use client"

import { useState, useEffect } from "react"
import { X, Search, Calendar, Users, Send, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { getAuthToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

interface Candidate {
  id: string
  name: string
  email: string
  batch?: string
  tags: string[]
  registrationDate: string
  avatar?: string
}

interface Assessment {
  id: string
  title: string
  type: string
  duration: number
  totalQuestions: number
  totalMarks: number
}

interface AllotCandidatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assessmentId: string | null
}

export function AllotCandidatesModal({ open, onOpenChange, assessmentId }: AllotCandidatesModalProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [batchFilter, setBatchFilter] = useState("all")
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [attemptLimit, setAttemptLimit] = useState("1")
  const [step, setStep] = useState<"select" | "configure" | "success">("select")
  const [loading, setLoading] = useState(false)
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (assessmentId) {
      loadAssessment()
      loadCandidates()
    }
  }, [assessmentId])

  const loadAssessment = async () => {
    if (!assessmentId) return
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/assessments/${assessmentId}`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!response.ok) throw new Error("Failed to fetch assessment")
      const data = await response.json()
      setAssessment(data)
    } catch (error) {
      console.error("Error loading assessment:", error)
      toast({
        title: "Error",
        description: "Failed to load assessment details",
        variant: "destructive",
      })
    }
  }

  const loadCandidates = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_URL}/candidates`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!response.ok) throw new Error("Failed to fetch candidates")
      const data = await response.json()
      setCandidates(data)
    } catch (error) {
      console.error("Error loading candidates:", error)
      toast({
        title: "Error",
        description: "Failed to load candidates",
        variant: "destructive",
      })
    }
  }

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBatch = batchFilter === "all" || candidate.batch === batchFilter
    return matchesSearch && matchesBatch
  })

  const uniqueBatches = Array.from(new Set(candidates.filter(c => c.batch).map((c) => c.batch!)))

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCandidates(filteredCandidates.map((c) => c.id))
    } else {
      setSelectedCandidates([])
    }
  }

  const handleSelectCandidate = (candidateId: string, checked: boolean) => {
    if (checked) {
      setSelectedCandidates([...selectedCandidates, candidateId])
    } else {
      setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId))
    }
  }

  const handleNext = () => {
    if (selectedCandidates.length === 0) {
      toast({
        title: "No candidates selected",
        description: "Please select at least one candidate to proceed.",
        variant: "destructive",
      })
      return
    }
    setStep("configure")
  }

  const handleConfirmAllotment = async () => {
    if (!startTime || !endTime) {
      toast({
        title: "Missing schedule",
        description: "Please set start and end times.",
        variant: "destructive",
      })
      return
    }

    if (!assessmentId) return

    setLoading(true)
    try {
      const selectedCandidateData = selectedCandidates.map(id => {
        const candidate = candidates.find(c => c.id === id)
        return {
          name: candidate?.name,
          email: candidate?.email,
          batch: candidate?.batch,
          tags: candidate?.tags,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          attemptLimit: parseInt(attemptLimit)
        }
      })

      const response = await fetch(`${API_URL}/assessments/${assessmentId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          candidates: selectedCandidateData
        }),
      })

      if (!response.ok) throw new Error("Failed to allot candidates")

      setStep("success")
      toast({
        title: "Candidates Allotted",
        description: `${selectedCandidates.length} candidates have been successfully allotted to the assessment.`,
      })
    } catch (error) {
      console.error("Error allotting candidates:", error)
      toast({
        title: "Error",
        description: "Failed to allot candidates to the assessment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendCredentials = async () => {
    if (!assessmentId) return

    setLoading(true)
    try {
      const promises = selectedCandidates.map(candidateId =>
        fetch(`${API_URL}/candidates/${candidateId}/send-email`, {
          method: "POST",
          credentials: "include",
        })
      )

      await Promise.all(promises)

      toast({
        title: "Credentials Sent",
        description: "Assessment credentials have been sent to all selected candidates.",
      })

      // Reset and close
      handleClose()
    } catch (error) {
      console.error("Error sending credentials:", error)
      toast({
        title: "Error",
        description: "Failed to send credentials to some candidates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep("select")
    setSelectedCandidates([])
    setSearchTerm("")
    setBatchFilter("all")
    setStartTime("")
    setEndTime("")
    setAttemptLimit("1")
    onOpenChange(false)
  }

  if (!assessment) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            {step === "select" && "Allot Candidates"}
            {step === "configure" && "Configure Schedule"}
            {step === "success" && "Allotment Successful"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {step === "select" && (
          <div className="space-y-6">
            {/* Assessment Info */}
            <Card className="card-gradient rounded-2xl border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{assessment.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Duration: {assessment.duration} minutes • {assessment.totalQuestions} questions
                    </p>
                  </div>
                  <Badge className="rounded-xl bg-primary/20 text-primary border-primary/30">{assessment.type}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-2xl"
                />
              </div>
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-40 rounded-2xl">
                  <SelectValue placeholder="Batch" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="all">All Batches</SelectItem>
                  {uniqueBatches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Count */}
            {selectedCandidates.length > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {selectedCandidates.length} candidate{selectedCandidates.length !== 1 ? "s" : ""} selected
                </span>
              </div>
            )}

            {/* Candidates Table */}
            <Card className="card-gradient rounded-2xl border-border/40">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead className="w-12 pl-6">
                        <Checkbox
                          checked={
                            selectedCandidates.length === filteredCandidates.length && filteredCandidates.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          className="rounded-md"
                        />
                      </TableHead>
                      <TableHead className="text-muted-foreground font-medium">Candidate</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Batch</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Tags</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Registration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate) => (
                      <TableRow key={candidate.id} className="border-border/40 hover:bg-accent/30">
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={selectedCandidates.includes(candidate.id)}
                            onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked as boolean)}
                            className="rounded-md"
                          />
                        </TableCell>
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
                            variant="secondary"
                            className="rounded-xl bg-accent/50 text-foreground border-border/40"
                          >
                            {candidate.batch}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {candidate.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="rounded-xl text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {candidate.tags.length > 2 && (
                              <Badge variant="outline" className="rounded-xl text-xs">
                                +{candidate.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(candidate.registrationDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleClose} className="rounded-2xl">
                Cancel
              </Button>
              <Button onClick={handleNext} className="rounded-2xl primary-gradient glow-primary">
                Next: Configure Schedule
              </Button>
            </div>
          </div>
        )}

        {step === "configure" && (
          <div className="space-y-6">
            {/* Selected Candidates Summary */}
            <Card className="card-gradient rounded-2xl border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Selected Candidates ({selectedCandidates.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidates.slice(0, 5).map((id) => {
                    const candidate = candidates.find((c) => c.id === id)
                    return candidate ? (
                      <Badge key={id} variant="secondary" className="rounded-xl">
                        {candidate.name}
                      </Badge>
                    ) : null
                  })}
                  {selectedCandidates.length > 5 && (
                    <Badge variant="secondary" className="rounded-xl">
                      +{selectedCandidates.length - 5} more
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Configuration */}
            <Card className="card-gradient rounded-2xl border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attemptLimit">Attempt Limit</Label>
                  <Select value={attemptLimit} onValueChange={setAttemptLimit}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="1">1 Attempt</SelectItem>
                      <SelectItem value="2">2 Attempts</SelectItem>
                      <SelectItem value="3">3 Attempts</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Assessment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2 font-medium">{assessment.duration} minutes</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="ml-2 font-medium">{assessment.totalQuestions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Marks:</span>
                      <span className="ml-2 font-medium">{assessment.totalMarks}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 font-medium capitalize">{assessment.type}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep("select")} className="rounded-2xl">
                Back
              </Button>
              <Button
                onClick={handleConfirmAllotment}
                className="rounded-2xl primary-gradient glow-primary"
                disabled={loading}
              >
                {loading ? "Allotting..." : "Confirm Allotment"}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Allotment Successful!</h3>
              <p className="text-muted-foreground">
                {selectedCandidates.length} candidates have been successfully allotted to "{assessment.title}".
              </p>
            </div>

            <Card className="card-gradient rounded-2xl border-border/40">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start Time:</span>
                    <div className="font-medium">{new Date(startTime).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">End Time:</span>
                    <div className="font-medium">{new Date(endTime).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Attempt Limit:</span>
                    <div className="font-medium">
                      {attemptLimit === "unlimited"
                        ? "Unlimited"
                        : `${attemptLimit} attempt${attemptLimit !== "1" ? "s" : ""}`}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Candidates:</span>
                    <div className="font-medium">{selectedCandidates.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={handleClose} className="rounded-2xl">
                Close
              </Button>
              <Button
                onClick={handleSendCredentials}
                className="rounded-2xl primary-gradient glow-primary"
                disabled={loading}
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Sending..." : "Send Credentials"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Plus, Send, Eye, Edit, Trash2, Copy, Search, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmailComposer } from "./email-composer"
import { EmailTemplates } from "./email-templates"
import { EmailMetrics } from "./email-metrics"
import { toast } from "sonner"
import * as api from "@/lib/api/email"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select as ShadSelect } from "@/components/ui/select"
import { Table as ShadTable, TableBody as ShadTableBody, TableCell as ShadTableCell, TableHead as ShadTableHead, TableHeader as ShadTableHeader, TableRow as ShadTableRow } from "@/components/ui/table"

const statusColors = {
  sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  delivered: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  opened: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  clicked: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  bounced: "bg-red-500/20 text-red-400 border-red-500/30",
}

const typeColors = {
  "assessment-invite": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "interview-schedule": "bg-green-500/20 text-green-400 border-green-500/30",
  "result-notification": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "event-reminder": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  welcome: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "follow-up": "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

// Helper to get JWT token from localStorage
function getAuthHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      return { 'Authorization': `Bearer ${token}` }
    }
  }
  return {} as Record<string, string>
}

export function EmailPage() {
  const [showComposer, setShowComposer] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sentEmails, setSentEmails] = useState<any[]>([])
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showCredentialsModal, setShowCredentialsModal] = useState(false)
  const [assessments, setAssessments] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<string>("")
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [candidateCredentials, setCandidateCredentials] = useState<any[]>([])

  useEffect(() => {
    setLoading(true)
    api.getLogs()
      .then((data) => {
        setSentEmails(data.filter((log: any) => log.status !== "draft"))
        setDrafts(data.filter((log: any) => log.status === "draft"))
      })
      .catch(() => toast.error("Failed to load emails"))
      .finally(() => setLoading(false))
  }, [])

  // Fetch assessments when credentials modal opens
  useEffect(() => {
    if (showCredentialsModal) {
      fetch("/api/assessments?limit=100", {
        credentials: "include",
        headers: getAuthHeaders(),
      })
        .then(res => res.json())
        .then(data => setAssessments(data.data || []))
        .catch(() => toast.error("Failed to load assessments"))
    }
  }, [showCredentialsModal])

  // Fetch candidates for selected assessment
  useEffect(() => {
    if (selectedAssessment) {
      fetch(`/api/assessments/${selectedAssessment}`, {
        credentials: "include",
        headers: getAuthHeaders(),
      })
        .then(res => res.json())
        .then(data => setCandidates(data?.candidates || []))
        .catch(() => toast.error("Failed to load candidates"))
    } else {
      setCandidates([])
    }
  }, [selectedAssessment])

  // Fetch candidate credentials for selected assessment
  useEffect(() => {
    if (selectedAssessment) {
      fetch(`/api/assessments/${selectedAssessment}/candidates/credentials`, {
        credentials: "include",
        headers: getAuthHeaders(),
      })
        .then(res => res.json())
        .then(data => setCandidateCredentials(data || []))
        .catch(() => toast.error("Failed to load candidate credentials"))
    } else {
      setCandidateCredentials([])
    }
  }, [selectedAssessment, showCredentialsModal])

  const handleSendEmail = async (data: any) => {
    setLoading(true)
    try {
      await api.sendEmail(data)
      toast.success("Email sent")
      setShowComposer(false)
      // Optionally refetch logs
    } catch {
      toast.error("Failed to send email")
    } finally {
      setLoading(false)
    }
  }
  const handleSaveDraft = async (data: any) => {
    setLoading(true)
    try {
      await api.saveDraft(data)
      toast.success("Draft saved")
      setShowComposer(false)
      // Optionally refetch logs
    } catch {
      toast.error("Failed to save draft")
    } finally {
      setLoading(false)
    }
  }
  const handleSendCredentials = async (data: any) => {
    setLoading(true)
    try {
      await api.sendCredentials(data)
      toast.success("Credentials sent")
      setShowCredentialsModal(false)
    } catch {
      toast.error("Failed to send credentials")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    await handleSendCredentials({
      assessmentId: selectedAssessment,
      candidateIds: selectedCandidates,
    })
    setSelectedAssessment("")
    setSelectedCandidates([])
  }

  const handleResendCredential = async (candidateId: string) => {
    setLoading(true)
    try {
      await api.sendCredentials({ assessmentId: selectedAssessment, candidateIds: [candidateId] })
      toast.success("Credentials resent")
      // Optionally refetch credentials
      fetch(`/api/assessments/${selectedAssessment}/candidates/credentials`, {
        credentials: "include",
        headers: getAuthHeaders(),
      })
        .then(res => res.json())
        .then(data => setCandidateCredentials(data || []))
    } catch {
      toast.error("Failed to resend credentials")
    } finally {
      setLoading(false)
    }
  }

  const filteredEmails = sentEmails.filter((email) => {
    const matchesSearch =
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || email.status === statusFilter
    const matchesType = typeFilter === "all" || email.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getOpenRate = () => {
    const opened = sentEmails.filter((e) => e.openedAt).length
    return Math.round((opened / sentEmails.length) * 100)
  }

  const getClickRate = () => {
    const clicked = sentEmails.filter((e) => e.clickedAt).length
    return Math.round((clicked / sentEmails.length) * 100)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Email & Invites
          </h1>
          <p className="text-muted-foreground">Send communications and track engagement</p>
        </div>
        <Button onClick={() => setShowComposer(true)} className="rounded-2xl primary-gradient glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Compose Email
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{sentEmails.length}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{getOpenRate()}%</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{getClickRate()}%</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{drafts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-[650px] rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="templates" className="rounded-xl">
            Templates
          </TabsTrigger>
          <TabsTrigger value="sent" className="rounded-xl">
            Sent
          </TabsTrigger>
          <TabsTrigger value="drafts" className="rounded-xl">
            Drafts
          </TabsTrigger>
          <TabsTrigger value="credentials" className="rounded-xl">
            Credentials
          </TabsTrigger>
          <TabsTrigger value="metrics" className="rounded-xl">
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <EmailTemplates />
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          {/* Filters */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-2xl bg-input/50 border-border/40"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 rounded-2xl bg-input/50 border-border/40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="clicked">Clicked</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40 rounded-2xl bg-input/50 border-border/40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="assessment-invite">Assessment Invite</SelectItem>
                      <SelectItem value="interview-schedule">Interview Schedule</SelectItem>
                      <SelectItem value="result-notification">Result Notification</SelectItem>
                      <SelectItem value="event-reminder">Event Reminder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sent Emails Table */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-muted-foreground font-medium">Recipient</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Subject</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Sent</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Open Rate</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmails.map((email) => (
                    <TableRow key={email.id} className="border-border/40 hover:bg-accent/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-2xl">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-xs">
                              {email.recipient
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{email.recipient}</div>
                            <div className="text-sm text-muted-foreground">{email.recipientEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground max-w-64 truncate">{email.subject}</div>
                        <div className="text-sm text-muted-foreground">{email.template}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-xl border ${typeColors[email.type as keyof typeof typeColors]} capitalize`}
                        >
                          {email.type.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-xl border ${statusColors[email.status as keyof typeof statusColors]} capitalize`}
                        >
                          {email.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{email.sentAt}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {email.openedAt && (
                            <Badge variant="secondary" className="rounded-xl text-xs">
                              <Eye className="mr-1 h-3 w-3" />
                              Opened
                            </Badge>
                          )}
                          {email.clickedAt && (
                            <Badge variant="secondary" className="rounded-xl text-xs">
                              Clicked
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-accent/80">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl"
                          >
                            <DropdownMenuItem className="rounded-xl">
                              <Eye className="mr-2 h-4 w-4" />
                              View Email
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl">
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl">
                              <Send className="mr-2 h-4 w-4" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="rounded-xl text-red-400 focus:text-red-300">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Draft Emails</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="text-muted-foreground font-medium">Subject</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Template</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Last Modified</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id} className="border-border/40 hover:bg-accent/30">
                      <TableCell>
                        <div className="font-medium text-foreground">{draft.subject}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-xl border ${typeColors[draft.type as keyof typeof typeColors]} capitalize`}
                        >
                          {draft.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{draft.template}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{draft.lastModified}</div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-accent/80">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-accent/80">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-accent/80 text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Send Credentials</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowCredentialsModal(true)} className="rounded-2xl primary-gradient glow-primary">
                Send Credentials to Candidates
              </Button>
              <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Send Credentials</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">Assessment</label>
                    <ShadSelect value={selectedAssessment} onValueChange={setSelectedAssessment}>
                      <SelectTrigger className="w-full rounded-2xl">
                        <SelectValue placeholder="Select assessment" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        {assessments.map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </ShadSelect>
                    {selectedAssessment && (
                      <>
                        <label className="block text-sm font-medium mt-4">Candidates</label>
                        <div className="max-h-48 overflow-y-auto border rounded-2xl p-2">
                          {candidates.map((c: any) => (
                            <div key={c.id} className="flex items-center gap-2 py-1">
                              <input
                                type="checkbox"
                                checked={selectedCandidates.includes(c.id)}
                                onChange={e => {
                                  if (e.target.checked) setSelectedCandidates([...selectedCandidates, c.id])
                                  else setSelectedCandidates(selectedCandidates.filter(id => id !== c.id))
                                }}
                                className="rounded"
                              />
                              <span>{c.name} ({c.email})</span>
                            </div>
                          ))}
                        </div>
                        {/* Credentials Table */}
                        <div className="mt-6">
                          <ShadTable>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {candidateCredentials.map((cred: any) => (
                                <TableRow key={cred.candidateId}>
                                  <TableCell>{cred.name}</TableCell>
                                  <TableCell>{cred.email}</TableCell>
                                  <TableCell>
                                    {cred.credentialSent ? (
                                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Sent</Badge>
                                    ) : (
                                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Not Sent</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleResendCredential(cred.candidateId)}
                                      disabled={loading}
                                    >
                                      Resend Credentials
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </ShadTable>
                        </div>
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSend} disabled={!selectedAssessment || selectedCandidates.length === 0} className="rounded-2xl primary-gradient glow-primary">
                      Send Credentials
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <EmailMetrics />
        </TabsContent>
      </Tabs>

      {/* Email Composer */}
      <EmailComposer open={showComposer} onOpenChange={setShowComposer} onSend={handleSendEmail} onSaveDraft={handleSaveDraft} />
    </div>
  )
}

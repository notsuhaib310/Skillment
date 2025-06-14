"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  Mail,
  Eye,
  Trash2,
  UserPlus,
  Calendar,
  Tag,
  Users,
  Settings,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AddParticipantModal } from "./add-participant-modal"
import { ParticipantProfile } from "./participant-profile"

const participants = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "/placeholder.svg?height=40&width=40",
    tags: ["Frontend", "React", "Senior", "Batch-2024"],
    status: "completed",
    score: 92,
    joinedDate: "2024-01-15",
    lastActivity: "2024-01-20",
    assessments: 3,
    location: "San Francisco, CA",
    completedAssessments: 3,
    ongoingAssessments: 0,
    notStartedAssessments: 1,
    performance: "excellent",
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "+1 (555) 234-5678",
    avatar: "/placeholder.svg?height=40&width=40",
    tags: ["UX Design", "Figma", "Mid-level", "Batch-2024"],
    status: "ongoing",
    score: 88,
    joinedDate: "2024-01-10",
    lastActivity: "2024-01-18",
    assessments: 2,
    location: "New York, NY",
    completedAssessments: 1,
    ongoingAssessments: 1,
    notStartedAssessments: 0,
    performance: "good",
  },
  {
    id: 3,
    name: "David Chen",
    email: "david.chen@email.com",
    phone: "+1 (555) 345-6789",
    avatar: "/placeholder.svg?height=40&width=40",
    tags: ["Backend", "Node.js", "Senior", "Batch-2023"],
    status: "not-started",
    score: 0,
    joinedDate: "2024-01-20",
    lastActivity: "Never",
    assessments: 0,
    location: "Seattle, WA",
    completedAssessments: 0,
    ongoingAssessments: 0,
    notStartedAssessments: 2,
    performance: "pending",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@email.com",
    phone: "+1 (555) 456-7890",
    avatar: "/placeholder.svg?height=40&width=40",
    tags: ["Product Management", "Strategy", "Batch-2024"],
    status: "completed",
    score: 94,
    joinedDate: "2024-01-05",
    lastActivity: "2024-01-19",
    assessments: 4,
    location: "Austin, TX",
    completedAssessments: 4,
    ongoingAssessments: 0,
    notStartedAssessments: 0,
    performance: "excellent",
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+1 (555) 567-8901",
    avatar: "/placeholder.svg?height=40&width=40",
    tags: ["Data Science", "Python", "Junior", "Batch-2024"],
    status: "ongoing",
    score: 76,
    joinedDate: "2024-01-22",
    lastActivity: "2024-01-23",
    assessments: 1,
    location: "Boston, MA",
    completedAssessments: 0,
    ongoingAssessments: 1,
    notStartedAssessments: 1,
    performance: "good",
  },
]

const assessments = [
  { id: 1, name: "React Fundamentals", category: "Frontend" },
  { id: 2, name: "Node.js Backend", category: "Backend" },
  { id: 3, name: "Data Structures", category: "Programming" },
  { id: 4, name: "System Design", category: "Architecture" },
]

const statusColors = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ongoing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "not-started": "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

const performanceColors = {
  excellent: "text-emerald-400",
  good: "text-blue-400",
  average: "text-amber-400",
  pending: "text-muted-foreground",
}

export function ParticipantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assessmentFilter, setAssessmentFilter] = useState("all")
  const [batchFilter, setBatchFilter] = useState("all")
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)

  const filteredParticipants = participants.filter((participant) => {
    const matchesSearch =
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || participant.status === statusFilter
    const matchesAssessment = assessmentFilter === "all" || true
    const matchesBatch = batchFilter === "all" || participant.tags.some((tag) => tag.includes(batchFilter))
    return matchesSearch && matchesStatus && matchesAssessment && matchesBatch
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParticipants(filteredParticipants.map((p) => p.id))
    } else {
      setSelectedParticipants([])
    }
  }

  const handleSelectParticipant = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedParticipants([...selectedParticipants, id])
    } else {
      setSelectedParticipants(selectedParticipants.filter((pid) => pid !== id))
    }
  }

  const uniqueBatches = [...new Set(participants.flatMap((p) => p.tags.filter((tag) => tag.includes("Batch"))))]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary-gradient">Participants</h1>
          <p className="text-lg text-muted-foreground">
            Manage and track all your participants with powerful tools and insights
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="rounded-3xl border-border/40 hover:bg-accent/80 btn-professional">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-4xl border-border/40 bg-card/80 backdrop-blur-xl max-w-md animate-scale-in">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Import Participants</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Upload Excel or CSV file to bulk import participants
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="import-file" className="text-sm font-medium">
                    Choose File
                  </Label>
                  <Input
                    id="import-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="rounded-2xl input-professional"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-accent/20 border border-border/40">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium">Required columns:</p>
                    <p>• Name, Email</p>
                    <p className="font-medium mt-2">Optional columns:</p>
                    <p>• Phone, Tags, Batch</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="rounded-2xl">
                    Cancel
                  </Button>
                  <Button className="rounded-2xl primary-gradient glow-primary btn-professional">Import</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="rounded-3xl border-border/40 hover:bg-accent/80 btn-professional">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {selectedParticipants.length > 0 && (
            <DropdownMenu open={showBulkActions} onOpenChange={setShowBulkActions}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-3xl border-border/40 hover:bg-accent/80 btn-professional">
                  <Settings className="mr-2 h-4 w-4" />
                  Bulk Actions ({selectedParticipants.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl w-56 animate-scale-in"
              >
                <DropdownMenuItem className="rounded-2xl">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign to Assessment
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-2xl">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-2xl">
                  <Tag className="mr-2 h-4 w-4" />
                  Add Tags
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-2xl">
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-2xl text-red-400 focus:text-red-300">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            onClick={() => setShowAddModal(true)}
            className="rounded-3xl primary-gradient glow-primary btn-professional"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Participant
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-gradient rounded-4xl border-border/40 shadow-xl animate-slide-in-up">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-400" />
              </div>
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">{participants.length}</div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-medium">+12%</span>
              <span className="text-sm text-muted-foreground">from last month</span>
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="card-gradient rounded-4xl border-border/40 shadow-xl animate-slide-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-emerald-500/10">
                <Star className="h-4 w-4 text-emerald-400" />
              </div>
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400 mb-2">
              {participants.filter((p) => p.status === "completed").length}
            </div>
            <div className="flex items-center gap-2">
              <div className="status-indicator text-emerald-400">Assessment completed</div>
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="card-gradient rounded-4xl border-border/40 shadow-xl animate-slide-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-blue-500/10">
                <Zap className="h-4 w-4 text-blue-400" />
              </div>
              Ongoing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {participants.filter((p) => p.status === "ongoing").length}
            </div>
            <div className="flex items-center gap-2">
              <div className="status-indicator text-blue-400">Currently taking tests</div>
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card
          className="card-gradient rounded-4xl border-border/40 shadow-xl animate-slide-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-amber-500/10">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              Not Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400 mb-2">
              {participants.filter((p) => p.status === "not-started").length}
            </div>
            <div className="flex items-center gap-2">
              <div className="status-indicator text-amber-400">Pending invitations</div>
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card className="card-gradient rounded-4xl border-border/40 shadow-xl">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Advanced Filters</h3>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-3xl input-professional text-base"
                />
              </div>

              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48 h-12 rounded-3xl input-professional">
                    <SelectValue placeholder="Filter by Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assessmentFilter} onValueChange={setAssessmentFilter}>
                  <SelectTrigger className="w-56 h-12 rounded-3xl input-professional">
                    <SelectValue placeholder="Filter by Assessment" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl">
                    <SelectItem value="all">All Assessments</SelectItem>
                    {assessments.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id.toString()}>
                        {assessment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="w-48 h-12 rounded-3xl input-professional">
                    <SelectValue placeholder="Filter by Batch" />
                  </SelectTrigger>
                  <SelectContent className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl">
                    <SelectItem value="all">All Batches</SelectItem>
                    {uniqueBatches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Participants Table */}
      <Card className="card-gradient rounded-4xl border-border/40 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <Table className="professional-table">
            <TableHeader>
              <TableRow className="border-border/40">
                <TableHead className="w-12 pl-8">
                  <Checkbox
                    checked={
                      selectedParticipants.length === filteredParticipants.length && filteredParticipants.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="rounded-lg"
                  />
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">Participant</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Tags</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Progress</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Performance</TableHead>
                <TableHead className="text-muted-foreground font-semibold">Last Activity</TableHead>
                <TableHead className="text-right text-muted-foreground font-semibold pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant, index) => (
                <TableRow
                  key={participant.id}
                  className="border-border/40 hover:bg-accent/20 transition-all duration-200"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <TableCell className="pl-8">
                    <Checkbox
                      checked={selectedParticipants.includes(participant.id)}
                      onCheckedChange={(checked) => handleSelectParticipant(participant.id, checked as boolean)}
                      className="rounded-lg"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 rounded-3xl ring-2 ring-border/40">
                        <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="rounded-3xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground font-semibold text-lg">
                          {participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground text-base">{participant.name}</div>
                        <div className="text-sm text-muted-foreground">{participant.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {participant.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} className="rounded-2xl badge-professional">
                          {tag}
                        </Badge>
                      ))}
                      {participant.tags.length > 2 && (
                        <Badge className="rounded-2xl badge-professional">+{participant.tags.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-2xl border ${statusColors[participant.status as keyof typeof statusColors]} font-medium`}
                    >
                      {participant.status.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-foreground">
                        {participant.completedAssessments}/
                        {participant.completedAssessments +
                          participant.ongoingAssessments +
                          participant.notStartedAssessments}{" "}
                        completed
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-orange-500 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${(participant.completedAssessments / (participant.completedAssessments + participant.ongoingAssessments + participant.notStartedAssessments)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`font-semibold ${performanceColors[participant.performance as keyof typeof performanceColors]}`}
                      >
                        {participant.score > 0 ? `${participant.score}%` : "-"}
                      </div>
                      {participant.performance === "excellent" && <Star className="h-4 w-4 text-emerald-400" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{participant.lastActivity}</div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-2xl hover:bg-accent/80 btn-professional"
                        onClick={() => setSelectedParticipant(participant.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-2xl hover:bg-accent/80 btn-professional"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl animate-scale-in"
                        >
                          <DropdownMenuItem className="rounded-2xl">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-2xl">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-2xl">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-2xl">
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-2xl text-red-400 focus:text-red-300">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Participant Modal */}
      <AddParticipantModal open={showAddModal} onOpenChange={setShowAddModal} />

      {/* Participant Profile */}
      {selectedParticipant && (
        <ParticipantProfile participantId={selectedParticipant} onClose={() => setSelectedParticipant(null)} />
      )}
    </div>
  )
}

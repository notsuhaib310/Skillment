"use client"

import { useState } from "react"
import { Search, Plus, MoreHorizontal, Eye, Edit, Archive, Trash2, Play, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AssessmentDetailView } from "./assessment-detail-view"
import { CreateAssessmentPage } from "./create-assessment-page"

const assessments = [
  {
    id: 1,
    title: "Frontend Developer Assessment",
    type: "coding",
    status: "live",
    createdDate: "2024-01-15",
    createdBy: "Sarah Chen",
    candidates: 24,
    duration: 120,
    totalMarks: 100,
    avgScore: 78,
    tags: ["React", "JavaScript", "CSS"],
  },
  {
    id: 2,
    title: "Product Manager Case Study",
    type: "mcq",
    status: "draft",
    createdDate: "2024-01-20",
    createdBy: "Mike Johnson",
    candidates: 0,
    duration: 90,
    totalMarks: 80,
    avgScore: 0,
    tags: ["Strategy", "Analytics", "Leadership"],
  },
  {
    id: 3,
    title: "Data Science Proctored Exam",
    type: "proctored",
    status: "live",
    createdDate: "2024-01-18",
    createdBy: "Sarah Chen",
    candidates: 15,
    duration: 180,
    totalMarks: 150,
    avgScore: 82,
    tags: ["Python", "ML", "Statistics"],
  },
  {
    id: 4,
    title: "UX Design Portfolio Review",
    type: "hybrid",
    status: "archived",
    createdDate: "2024-01-10",
    createdBy: "Alex Wilson",
    candidates: 32,
    duration: 60,
    totalMarks: 100,
    avgScore: 85,
    tags: ["Design", "Figma", "User Research"],
  },
  {
    id: 5,
    title: "Backend Developer Challenge",
    type: "coding",
    status: "live",
    createdDate: "2024-01-22",
    createdBy: "David Chen",
    candidates: 18,
    duration: 150,
    totalMarks: 120,
    avgScore: 74,
    tags: ["Node.js", "Database", "API"],
  },
]

const statusColors = {
  live: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  archived: "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

const typeColors = {
  mcq: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  coding: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  proctored: "bg-red-500/20 text-red-400 border-red-500/30",
  hybrid: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
}

export function AssessmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedAssessments, setSelectedAssessments] = useState<number[]>([])
  const [selectedAssessment, setSelectedAssessment] = useState<number | null>(null)
  const [showCreatePage, setShowCreatePage] = useState(false)

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTab = activeTab === "all" || assessment.status === activeTab
    const matchesType = typeFilter === "all" || assessment.type === typeFilter
    return matchesSearch && matchesTab && matchesType
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssessments(filteredAssessments.map((a) => a.id))
    } else {
      setSelectedAssessments([])
    }
  }

  const handleSelectAssessment = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedAssessments([...selectedAssessments, id])
    } else {
      setSelectedAssessments(selectedAssessments.filter((aid) => aid !== id))
    }
  }

  if (selectedAssessment) {
    return <AssessmentDetailView assessmentId={selectedAssessment} onBack={() => setSelectedAssessment(null)} />
  }

  if (showCreatePage) {
    return <CreateAssessmentPage onBack={() => setShowCreatePage(false)} />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Assessments
          </h1>
          <p className="text-muted-foreground">Create, manage, and track all your assessments</p>
        </div>
        <Button onClick={() => setShowCreatePage(true)} className="rounded-2xl primary-gradient glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">
              {assessments.filter((a) => a.status === "live").length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {assessments.filter((a) => a.status === "draft").length}
            </div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {assessments.reduce((sum, a) => sum + a.candidates, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:w-[400px] rounded-2xl bg-muted/50 p-1">
                <TabsTrigger value="all" className="rounded-xl">
                  All
                </TabsTrigger>
                <TabsTrigger value="live" className="rounded-xl">
                  Live
                </TabsTrigger>
                <TabsTrigger value="draft" className="rounded-xl">
                  Drafts
                </TabsTrigger>
                <TabsTrigger value="archived" className="rounded-xl">
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-2xl bg-input/50 border-border/40"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 rounded-2xl bg-input/50 border-border/40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="proctored">Proctored</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedAssessments.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive ({selectedAssessments.length})
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl text-red-400 hover:text-red-300">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40">
                <TableHead className="w-12 pl-6">
                  <Checkbox
                    checked={selectedAssessments.length === filteredAssessments.length}
                    onCheckedChange={handleSelectAll}
                    className="rounded-md"
                  />
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">Assessment</TableHead>
                <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Candidates</TableHead>
                <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                <TableHead className="text-muted-foreground font-medium">Avg Score</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.map((assessment) => (
                <TableRow key={assessment.id} className="border-border/40 hover:bg-accent/30">
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedAssessments.includes(assessment.id)}
                      onCheckedChange={(checked) => handleSelectAssessment(assessment.id, checked as boolean)}
                      className="rounded-md"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-foreground">{assessment.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {assessment.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="rounded-xl bg-accent/50 text-foreground border-border/40 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {assessment.tags.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="rounded-xl bg-accent/50 text-foreground border-border/40 text-xs"
                          >
                            +{assessment.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-xl border ${typeColors[assessment.type as keyof typeof typeColors]} capitalize`}
                    >
                      {assessment.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-xl border ${statusColors[assessment.status as keyof typeof statusColors]} capitalize`}
                    >
                      {assessment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{assessment.candidates}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{assessment.duration}m</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-foreground">
                      {assessment.avgScore > 0 ? `${assessment.avgScore}%` : "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedAssessment(assessment.id)}
                        className="h-8 w-8 rounded-xl hover:bg-accent/80"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

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
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Assessment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl">
                            <Play className="mr-2 h-4 w-4" />
                            Start Test
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-xl">
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl text-red-400 focus:text-red-300">
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
    </div>
  )
}

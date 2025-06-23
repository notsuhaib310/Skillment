"use client"

import { useState, useEffect } from "react"
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
import { CreateAssessmentPage } from "./create-assessment-page"
import { assessmentsApi, type Assessment } from "@/lib/api/api"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([])
  const [showCreatePage, setShowCreatePage] = useState(false)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Load assessments on component mount
  useEffect(() => {
    loadAssessments()
  }, [])

  const loadAssessments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await assessmentsApi.getAll()
      setAssessments(response.data || (response as any))
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Error Loading Assessments",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssessment = async (id: string) => {
    try {
      await assessmentsApi.delete(id)
      setAssessments(assessments.filter((a) => a.id !== id))
      toast({
        title: "Assessment Deleted",
        description: "Assessment has been deleted successfully.",
      })
    } catch (err: any) {
      toast({
        title: "Error Deleting Assessment",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleArchiveAssessment = async (id: string) => {
    try {
      const updatedAssessment = await assessmentsApi.archive(id)
      setAssessments(assessments.map((a) => (a.id === id ? updatedAssessment : a)))
      toast({
        title: "Assessment Archived",
        description: "Assessment has been archived successfully.",
      })
    } catch (err: any) {
      toast({
        title: "Error Archiving Assessment",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const filteredAssessments = assessments.filter((assessment) => {
    const tags: string[] = Array.isArray(assessment.tags) ? assessment.tags : []
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesTab = activeTab === "all" || assessment.status === activeTab
    const matchesType = typeFilter === "all" || assessment.type === typeFilter
    return matchesSearch && matchesTab && matchesType
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssessments(filteredAssessments.map((a: Assessment) => a.id))
    } else {
      setSelectedAssessments([])
    }
  }

  const handleSelectAssessment = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedAssessments([...selectedAssessments, id])
    } else {
      setSelectedAssessments(selectedAssessments.filter((aid: string) => aid !== id))
    }
  }

  const handleBulkArchive = async () => {
    try {
      await Promise.all(selectedAssessments.map((id) => assessmentsApi.archive(id)))
      await loadAssessments()
      setSelectedAssessments([])
      toast({
        title: "Assessments Archived",
        description: `${selectedAssessments.length} assessments have been archived.`,
      })
    } catch (err: any) {
      toast({
        title: "Error Archiving Assessments",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedAssessments.map((id) => assessmentsApi.delete(id)))
      await loadAssessments()
      setSelectedAssessments([])
      toast({
        title: "Assessments Deleted",
        description: `${selectedAssessments.length} assessments have been deleted.`,
      })
    } catch (err: any) {
      toast({
        title: "Error Deleting Assessments",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  if (showCreatePage) {
    return (
      <CreateAssessmentPage
        onBack={() => {
          setShowCreatePage(false)
          loadAssessments() // Reload assessments after creating
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading assessments...</p>
        </div>
      </div>
    )
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {assessments.reduce((sum, a) => sum + (a.totalQuestions || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-red-400">Error: {error}</p>
            <Button onClick={loadAssessments} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

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
                  <Button onClick={handleBulkArchive} variant="outline" size="sm" className="rounded-2xl">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive ({selectedAssessments.length})
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    variant="outline"
                    size="sm"
                    className="rounded-2xl text-red-400 hover:text-red-300"
                  >
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
                    checked={
                      selectedAssessments.length === filteredAssessments.length && filteredAssessments.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="rounded-md"
                  />
                </TableHead>
                <TableHead className="text-muted-foreground font-medium">Assessment</TableHead>
                <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium">Questions</TableHead>
                <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                <TableHead className="text-muted-foreground font-medium">Created</TableHead>
                <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssessments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || typeFilter !== "all" || activeTab !== "all"
                        ? "No assessments match your filters"
                        : "No assessments found. Create your first assessment to get started."}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssessments.map((assessment) => (
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
                          {assessment.tags?.slice(0, 2).map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="rounded-xl bg-accent/50 text-foreground border-border/40 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {assessment.tags && assessment.tags.length > 2 && (
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
                        className={`rounded-xl border ${typeColors[assessment.type as keyof typeof typeColors] || typeColors.mcq} capitalize`}
                      >
                        {assessment.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-xl border ${statusColors[assessment.status as keyof typeof statusColors] || statusColors.draft} capitalize`}
                      >
                        {assessment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{assessment.totalQuestions || 0}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{assessment.duration}m</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/assessments/manage/${assessment.id}`)}
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
                            <DropdownMenuItem
                              className="rounded-xl"
                              onClick={() => router.push(`/assessments/manage/${assessment.id}`)}
                            >
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
                            <DropdownMenuItem
                              className="rounded-xl"
                              onClick={() => handleArchiveAssessment(assessment.id)}
                            >
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl text-red-400 focus:text-red-300"
                              onClick={() => handleDeleteAssessment(assessment.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

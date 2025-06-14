"use client"

import { useState } from "react"
import {
  X,
  Mail,
  UserPlus,
  Calendar,
  Download,
  Trash2,
  Edit,
  Phone,
  MapPin,
  Clock,
  Award,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ParticipantProfileProps {
  participantId: number
  onClose: () => void
}

// Mock data - in real app, this would be fetched based on participantId
const participantData = {
  id: 1,
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  phone: "+1 (555) 123-4567",
  avatar: "/placeholder.svg?height=80&width=80",
  tags: ["Frontend", "React", "Senior", "Batch-2024"],
  status: "completed",
  score: 92,
  joinedDate: "2024-01-15",
  lastActivity: "2024-01-20",
  location: "San Francisco, CA",
  totalAssessments: 4,
  completedAssessments: 3,
  ongoingAssessments: 0,
  notStartedAssessments: 1,
}

const assessmentHistory = [
  {
    id: 1,
    name: "React Fundamentals",
    type: "MCQ",
    status: "completed",
    score: 95,
    completedDate: "2024-01-20",
    duration: "45 min",
    feedback: "Excellent understanding of React concepts",
  },
  {
    id: 2,
    name: "JavaScript Advanced",
    type: "Coding",
    status: "completed",
    score: 88,
    completedDate: "2024-01-18",
    duration: "60 min",
    feedback: "Good problem-solving skills, minor syntax issues",
  },
  {
    id: 3,
    name: "System Design",
    type: "Essay",
    status: "completed",
    score: 92,
    completedDate: "2024-01-16",
    duration: "90 min",
    feedback: "Strong architectural thinking",
  },
  {
    id: 4,
    name: "Node.js Backend",
    type: "Coding",
    status: "not-started",
    score: 0,
    completedDate: null,
    duration: "120 min",
    feedback: null,
  },
]

const activityLogs = [
  {
    id: 1,
    action: "Assessment Completed",
    details: "Completed React Fundamentals assessment",
    timestamp: "2024-01-20 14:30",
    type: "assessment",
  },
  {
    id: 2,
    action: "Login",
    details: "Logged in from San Francisco, CA",
    timestamp: "2024-01-20 14:00",
    type: "login",
  },
  {
    id: 3,
    action: "Email Sent",
    details: "Assessment invitation sent for Node.js Backend",
    timestamp: "2024-01-19 10:15",
    type: "email",
  },
  {
    id: 4,
    action: "Assessment Started",
    details: "Started JavaScript Advanced assessment",
    timestamp: "2024-01-18 16:45",
    type: "assessment",
  },
]

const statusColors = {
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  ongoing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "not-started": "bg-amber-500/20 text-amber-400 border-amber-500/30",
}

const typeColors = {
  assessment: "bg-blue-500/20 text-blue-400",
  login: "bg-emerald-500/20 text-emerald-400",
  email: "bg-purple-500/20 text-purple-400",
}

export function ParticipantProfile({ participantId, onClose }: ParticipantProfileProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 rounded-2xl">
                <AvatarImage src={participantData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground font-semibold text-lg">
                  {participantData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">{participantData.name}</DialogTitle>
                <DialogDescription className="text-base">{participantData.email}</DialogDescription>
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    className={`rounded-xl border ${statusColors[participantData.status as keyof typeof statusColors]}`}
                  >
                    {participantData.status.replace("-", " ")}
                  </Badge>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Average Score: {participantData.score}%
                  </div>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50">
            <TabsTrigger value="overview" className="rounded-xl">
              Overview
            </TabsTrigger>
            <TabsTrigger value="assessments" className="rounded-xl">
              Assessment History
            </TabsTrigger>
            <TabsTrigger value="logs" className="rounded-xl">
              Activity Logs
            </TabsTrigger>
            <TabsTrigger value="actions" className="rounded-xl">
              Actions
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 overflow-y-auto max-h-[60vh]">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="card-gradient rounded-3xl border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Phone</Label>
                        <div className="text-sm">{participantData.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Location</Label>
                        <div className="text-sm">{participantData.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Joined Date</Label>
                        <div className="text-sm">{participantData.joinedDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm text-muted-foreground">Last Activity</Label>
                        <div className="text-sm">{participantData.lastActivity}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assessment Progress */}
                <Card className="card-gradient rounded-3xl border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">Assessment Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span>
                          {participantData.completedAssessments}/{participantData.totalAssessments}
                        </span>
                      </div>
                      <Progress
                        value={(participantData.completedAssessments / participantData.totalAssessments) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {participantData.completedAssessments}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{participantData.ongoingAssessments}</div>
                        <div className="text-xs text-muted-foreground">Ongoing</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-amber-400">{participantData.notStartedAssessments}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tags */}
              <Card className="card-gradient rounded-3xl border-border/40">
                <CardHeader>
                  <CardTitle className="text-lg">Tags & Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {participantData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="rounded-xl bg-accent/50 text-foreground border-border/40"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assessments" className="space-y-4">
              <Card className="card-gradient rounded-3xl border-border/40">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/40">
                        <TableHead className="text-muted-foreground font-medium pl-6">Assessment</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Score</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                        <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessmentHistory.map((assessment) => (
                        <TableRow key={assessment.id} className="border-border/40 hover:bg-accent/30">
                          <TableCell className="pl-6">
                            <div>
                              <div className="font-medium">{assessment.name}</div>
                              {assessment.feedback && (
                                <div className="text-sm text-muted-foreground">{assessment.feedback}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-xl">
                              {assessment.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`rounded-xl border ${statusColors[assessment.status as keyof typeof statusColors]}`}
                            >
                              {assessment.status.replace("-", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{assessment.score > 0 ? `${assessment.score}%` : "-"}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{assessment.duration}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{assessment.completedDate || "Not started"}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card className="card-gradient rounded-3xl border-border/40">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-accent/20 border border-border/40"
                      >
                        <Badge className={`rounded-xl ${typeColors[log.type as keyof typeof typeColors]}`}>
                          {log.type}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium">{log.action}</div>
                          <div className="text-sm text-muted-foreground">{log.details}</div>
                          <div className="text-xs text-muted-foreground mt-1">{log.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="card-gradient rounded-3xl border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full rounded-2xl primary-gradient">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl border-border/40">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign Assessment
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl border-border/40">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Interview
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl border-border/40">
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </Button>
                  </CardContent>
                </Card>

                <Card className="card-gradient rounded-3xl border-border/40">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full rounded-2xl border-border/40">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full rounded-2xl border-border/40">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-border/40 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

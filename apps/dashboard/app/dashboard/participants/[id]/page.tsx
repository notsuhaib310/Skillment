"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Calendar, Edit } from "lucide-react"

// Mock participant data - in real app, this would come from API
const participants = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "/placeholder.svg?height=100&width=100",
    tags: ["Frontend", "React", "Senior", "Batch-2024"],
    status: "completed",
    score: 92,
    joinedDate: "2024-01-15",
    lastActivity: "2024-01-20",
    location: "San Francisco, CA",
    completedAssessments: 3,
    ongoingAssessments: 0,
    notStartedAssessments: 1,
    performance: "excellent",
  },
  // Add more participants as needed
]

export default function ParticipantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const participantId = params.id as string

  const participant = participants.find((p) => p.id === participantId)

  if (!participant) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="rounded-2xl">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Participant not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()} className="rounded-2xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {participant.name}
            </h1>
            <p className="text-muted-foreground">Participant Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl">
            <Mail className="mr-2 h-4 w-4" />
            Send Email
          </Button>
          <Button variant="outline" className="rounded-2xl">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
          <Button className="rounded-2xl primary-gradient glow-primary">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24 rounded-3xl">
              <AvatarImage src={participant.avatar || "/placeholder.svg"} />
              <AvatarFallback className="rounded-3xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-2xl">
                {participant.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{participant.name}</h2>
                <p className="text-muted-foreground">{participant.email}</p>
                <p className="text-muted-foreground">{participant.phone}</p>
                <p className="text-muted-foreground">{participant.location}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {participant.tags.map((tag) => (
                  <Badge key={tag} className="rounded-2xl bg-accent/50 text-foreground border-border/40">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-400">{participant.score}%</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{participant.completedAssessments}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ongoing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{participant.ongoingAssessments}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{participant.notStartedAssessments}</div>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground capitalize">{participant.performance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Assessment History */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Assessment history will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

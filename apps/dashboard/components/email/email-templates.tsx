"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Copy, Eye, Mail, Calendar, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const templates = [
  {
    id: 1,
    name: "Assessment Invitation",
    type: "assessment-invite",
    subject: "You're invited to take our {assessment_name} assessment",
    description: "Invite candidates to take assessments",
    usageCount: 24,
    lastUsed: "2024-01-25",
    tags: ["assessment", "invitation"],
  },
  {
    id: 2,
    name: "Interview Schedule",
    type: "interview-schedule",
    subject: "Interview Scheduled - {position} Position",
    description: "Schedule interviews with candidates",
    usageCount: 18,
    lastUsed: "2024-01-24",
    tags: ["interview", "schedule"],
  },
  {
    id: 3,
    name: "Result Notification",
    type: "result-notification",
    subject: "Assessment Results - {assessment_name}",
    description: "Send assessment results to candidates",
    usageCount: 15,
    lastUsed: "2024-01-23",
    tags: ["results", "notification"],
  },
  {
    id: 4,
    name: "Event Reminder",
    type: "event-reminder",
    subject: "Reminder: {event_name} - {event_date}",
    description: "Remind participants about upcoming events",
    usageCount: 12,
    lastUsed: "2024-01-22",
    tags: ["event", "reminder"],
  },
  {
    id: 5,
    name: "Welcome Email",
    type: "welcome",
    subject: "Welcome to {company_name}!",
    description: "Welcome new candidates to the platform",
    usageCount: 8,
    lastUsed: "2024-01-20",
    tags: ["welcome", "onboarding"],
  },
  {
    id: 6,
    name: "Follow-up Email",
    type: "follow-up",
    subject: "Following up on your {position} application",
    description: "Follow up with candidates after interviews",
    usageCount: 6,
    lastUsed: "2024-01-19",
    tags: ["follow-up", "interview"],
  },
]

const typeColors = {
  "assessment-invite": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "interview-schedule": "bg-green-500/20 text-green-400 border-green-500/30",
  "result-notification": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "event-reminder": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  welcome: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "follow-up": "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

const typeIcons = {
  "assessment-invite": FileText,
  "interview-schedule": Calendar,
  "result-notification": Mail,
  "event-reminder": Calendar,
  welcome: Users,
  "follow-up": Mail,
}

export function EmailTemplates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === "all" || template.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Pre-built templates for common communications</p>
        </div>
        <Button className="rounded-2xl primary-gradient glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md rounded-2xl"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 rounded-2xl">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="assessment-invite">Assessment Invite</SelectItem>
            <SelectItem value="interview-schedule">Interview Schedule</SelectItem>
            <SelectItem value="result-notification">Result Notification</SelectItem>
            <SelectItem value="event-reminder">Event Reminder</SelectItem>
            <SelectItem value="welcome">Welcome</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const IconComponent = typeIcons[template.type as keyof typeof typeIcons]
          return (
            <Card
              key={template.id}
              className="card-gradient rounded-3xl border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${typeColors[template.type as keyof typeof typeColors]}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Subject:</p>
                  <p className="text-sm text-muted-foreground italic">{template.subject}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-xl text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Used {template.usageCount} times</span>
                  <span>Last: {template.lastUsed}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-2xl">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

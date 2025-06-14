"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ThumbsUp, MessageSquare, Sparkles } from "lucide-react"

const existingRequests = [
  {
    id: 1,
    title: "Dark mode for assessment interface",
    description: "Add dark mode option for candidates taking assessments",
    votes: 24,
    status: "Under Review",
    tags: ["UI/UX", "Accessibility"],
  },
  {
    id: 2,
    title: "Bulk participant import from CSV",
    description: "Allow importing multiple participants at once via CSV file",
    votes: 18,
    status: "Planned",
    tags: ["Import", "Participants"],
  },
  {
    id: 3,
    title: "Integration with Slack notifications",
    description: "Send assessment completion notifications to Slack channels",
    votes: 12,
    status: "Completed",
    tags: ["Integration", "Notifications"],
  },
]

export function FeatureRequest() {
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    tags: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Planned":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "Completed":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Submit Feature Request */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10">
              <Lightbulb className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle>Submit Feature Request</CardTitle>
              <CardDescription>Share your ideas to help us improve Skillment</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feature-title">Feature Title</Label>
            <Input
              id="feature-title"
              placeholder="Brief title for your feature request"
              value={requestForm.title}
              onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-description">Description</Label>
            <Textarea
              id="feature-description"
              placeholder="Describe your feature request in detail. What problem does it solve? How would it work?"
              value={requestForm.description}
              onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
              className="rounded-2xl min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-tags">Tags (Optional)</Label>
            <Input
              id="feature-tags"
              placeholder="e.g., UI/UX, Integration, Mobile"
              value={requestForm.tags}
              onChange={(e) => setRequestForm({ ...requestForm, tags: e.target.value })}
              className="rounded-2xl"
            />
          </div>

          <div className="flex justify-end">
            <Button className="rounded-2xl primary-gradient">
              <Sparkles className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Feature Requests */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10">
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Community Requests</CardTitle>
              <CardDescription>Vote on existing feature requests from the community</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {existingRequests.map((request) => (
            <div
              key={request.id}
              className="p-6 rounded-2xl bg-accent/30 border border-border/40 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <Badge className={`rounded-full text-xs ${getStatusColor(request.status)}`}>{request.status}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">{request.description}</p>
                  <div className="flex items-center gap-2">
                    {request.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="rounded-full text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {request.votes}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback Guidelines */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle>Feedback Guidelines</CardTitle>
          <CardDescription>Help us understand your needs better</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-500">✅ Good Requests</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Clear problem description</li>
                <li>• Specific use case examples</li>
                <li>• Detailed feature explanation</li>
                <li>• Business value explanation</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-red-500">❌ Avoid</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Vague descriptions</li>
                <li>• Duplicate requests</li>
                <li>• Bug reports (use tickets instead)</li>
                <li>• Unrealistic expectations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Ticket, Plus, Upload, Clock, AlertCircle } from "lucide-react"

const existingTickets = [
  {
    id: "TKT-001",
    subject: "Email notifications not working",
    status: "Open",
    priority: "High",
    created: "2024-01-10",
    lastUpdate: "2024-01-12",
  },
  {
    id: "TKT-002",
    subject: "Assessment results export issue",
    status: "In Progress",
    priority: "Medium",
    created: "2024-01-08",
    lastUpdate: "2024-01-11",
  },
  {
    id: "TKT-003",
    subject: "Proctoring setup question",
    status: "Resolved",
    priority: "Low",
    created: "2024-01-05",
    lastUpdate: "2024-01-07",
  },
]

export function TicketSystem() {
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    priority: "",
    category: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "In Progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Ticket
          </TabsTrigger>
          <TabsTrigger value="existing" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            My Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
                  <Plus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Create Support Ticket</CardTitle>
                  <CardDescription>Describe your issue and we'll help you resolve it</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={ticketForm.category}
                    onValueChange={(value) => setTicketForm({ ...ticketForm, category: value })}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Issue</SelectItem>
                      <SelectItem value="billing">Billing & Account</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={ticketForm.priority}
                    onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide detailed information about your issue..."
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  className="rounded-2xl min-h-[120px]"
                />
              </div>

              <div className="space-y-4">
                <Label>Attachments (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="rounded-2xl">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB each</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="rounded-2xl primary-gradient">Submit Ticket</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="existing">
          <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10">
                  <Ticket className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <CardTitle>Your Support Tickets</CardTitle>
                  <CardDescription>Track the status of your support requests</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-2xl bg-accent/30 border border-border/40 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        <Badge className={`rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </Badge>
                        <Badge className={`rounded-full text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{ticket.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created: {ticket.created}
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Last update: {ticket.lastUpdate}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-2xl">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {existingTickets.length === 0 && (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground">Create your first support ticket to get help from our team.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

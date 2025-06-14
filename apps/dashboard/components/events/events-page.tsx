"use client"

import { useState } from "react"
import {
  CalendarIcon,
  Plus,
  List,
  Grid,
  Clock,
  MapPin,
  Video,
  Phone,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EventCalendar } from "./event-calendar"
import { CreateEventDrawer } from "./create-event-drawer"
import { EventDetailModal } from "./event-detail-modal"

const events = [
  {
    id: 1,
    title: "Frontend Developer Interview - Alex Johnson",
    type: "interview",
    date: "2024-01-25",
    time: "14:00",
    duration: 60,
    mode: "online",
    location: "Google Meet",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    host: "Sarah Chen",
    participants: [
      { id: 1, name: "Alex Johnson", email: "alex@example.com", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "upcoming",
    description: "Technical interview for Frontend Developer position",
    notes: "Focus on React, JavaScript, and system design",
  },
  {
    id: 2,
    title: "React Coding Challenge Webinar",
    type: "webinar",
    date: "2024-01-26",
    time: "16:00",
    duration: 90,
    mode: "online",
    location: "Zoom",
    meetingLink: "https://zoom.us/j/123456789",
    host: "Mike Johnson",
    participants: [
      { id: 2, name: "Maria Garcia", email: "maria@example.com", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 3, name: "David Chen", email: "david@example.com", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 4, name: "Sarah Wilson", email: "sarah@example.com", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "upcoming",
    description: "Live coding session covering React best practices",
    notes: "Recording will be available after the session",
  },
  {
    id: 3,
    title: "Data Science Hackathon - Final Round",
    type: "hackathon",
    date: "2024-01-27",
    time: "09:00",
    duration: 480,
    mode: "hybrid",
    location: "Conference Room A + Online",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/xyz",
    host: "David Chen",
    participants: [
      { id: 5, name: "Michael Brown", email: "michael@example.com", avatar: "/placeholder.svg?height=32&width=32" },
      { id: 6, name: "Emily Davis", email: "emily@example.com", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "upcoming",
    description: "Final round of the Data Science Hackathon",
    notes: "Participants need to present their solutions",
  },
  {
    id: 4,
    title: "Backend Developer Interview - Maria Garcia",
    type: "interview",
    date: "2024-01-23",
    time: "10:00",
    duration: 45,
    mode: "online",
    location: "Google Meet",
    meetingLink: "https://meet.google.com/xyz-abc-def",
    host: "Sarah Chen",
    participants: [
      { id: 2, name: "Maria Garcia", email: "maria@example.com", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    status: "completed",
    description: "Technical interview for Backend Developer position",
    notes: "Candidate showed strong knowledge in Node.js and databases",
  },
]

const eventTypeColors = {
  interview: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  webinar: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  hackathon: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "coding-round": "bg-green-500/20 text-green-400 border-green-500/30",
}

const statusColors = {
  upcoming: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  missed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
}

export function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showCreateDrawer, setShowCreateDrawer] = useState(false)
  const [showEventDetail, setShowEventDetail] = useState(false)

  const upcomingEvents = events.filter((e) => e.status === "upcoming")
  const todayEvents = events.filter((e) => e.date === "2024-01-25")

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return <Video className="h-4 w-4" />
      case "offline":
        return <MapPin className="h-4 w-4" />
      case "hybrid":
        return <Phone className="h-4 w-4" />
      default:
        return <Video className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Events & Interviews
            </h1>
            <p className="text-muted-foreground">Manage interviews, webinars, and coding events</p>
          </div>
          <Button onClick={() => setShowCreateDrawer(true)} className="rounded-2xl primary-gradient glow-primary">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Event
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{todayEvents.length}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">{upcomingEvents.length}</div>
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{events.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mini Calendar */}
          <div className="lg:col-span-1">
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">January 2024</div>
                    <div className="text-sm text-muted-foreground">Today: Jan 25</div>
                  </div>

                  {/* Quick Event List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Today's Events</h4>
                    {todayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-2xl bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => {
                          setSelectedEvent(event)
                          setShowEventDetail(true)
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`rounded-xl border text-xs ${eventTypeColors[event.type as keyof typeof eventTypeColors]}`}
                          >
                            {event.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatTime(event.time)}</span>
                        </div>
                        <div className="text-sm font-medium text-foreground mt-1 truncate">{event.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events View */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="calendar" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-[300px] rounded-2xl bg-muted/50 p-1">
                <TabsTrigger value="calendar" className="rounded-xl">
                  <Grid className="mr-2 h-4 w-4" />
                  Calendar View
                </TabsTrigger>
                <TabsTrigger value="list" className="rounded-xl">
                  <List className="mr-2 h-4 w-4" />
                  List View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="calendar" className="space-y-6">
                <EventCalendar
                  events={events}
                  onEventClick={(event) => {
                    setSelectedEvent(event)
                    setShowEventDetail(true)
                  }}
                />
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/40">
                          <TableHead className="text-muted-foreground font-medium">Event</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Date & Time</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Mode</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Participants</TableHead>
                          <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                          <TableHead className="text-right text-muted-foreground font-medium pr-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {events.map((event) => (
                          <TableRow key={event.id} className="border-border/40 hover:bg-accent/30">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">{event.title}</div>
                                <div className="text-sm text-muted-foreground">Host: {event.host}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`rounded-xl border ${eventTypeColors[event.type as keyof typeof eventTypeColors]} capitalize`}
                              >
                                {event.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-foreground">
                                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                  {event.date}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  {formatTime(event.time)} ({event.duration}m)
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getModeIcon(event.mode)}
                                <span className="text-sm text-foreground capitalize">{event.mode}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                  {event.participants.slice(0, 3).map((participant) => (
                                    <Tooltip key={participant.id}>
                                      <TooltipTrigger>
                                        <Avatar className="h-8 w-8 border-2 border-background rounded-2xl">
                                          <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                                          <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-xs">
                                            {participant.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{participant.name}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ))}
                                  {event.participants.length > 3 && (
                                    <div className="h-8 w-8 rounded-2xl bg-muted border-2 border-background flex items-center justify-center">
                                      <span className="text-xs text-muted-foreground">
                                        +{event.participants.length - 3}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">{event.participants.length}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`rounded-xl border ${statusColors[event.status as keyof typeof statusColors]} capitalize`}
                              >
                                {event.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex items-center justify-end gap-2">
                                {event.status === "upcoming" && event.meetingLink && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-xl hover:bg-accent/80"
                                        onClick={() => window.open(event.meetingLink, "_blank")}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Join Meeting</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-xl hover:bg-accent/80"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="rounded-2xl border-border/40 bg-card/80 backdrop-blur-xl"
                                  >
                                    <DropdownMenuItem
                                      className="rounded-xl"
                                      onClick={() => {
                                        setSelectedEvent(event)
                                        setShowEventDetail(true)
                                      }}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Event
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl">
                                      <Copy className="mr-2 h-4 w-4" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="rounded-xl text-red-400 focus:text-red-300">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Cancel Event
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
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Create Event Drawer */}
        <CreateEventDrawer open={showCreateDrawer} onOpenChange={setShowCreateDrawer} />

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal event={selectedEvent} open={showEventDetail} onOpenChange={setShowEventDetail} />
        )}
      </div>
    </TooltipProvider>
  )
}

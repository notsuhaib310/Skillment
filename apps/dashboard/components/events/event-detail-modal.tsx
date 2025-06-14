"use client"

import { Calendar, Clock, Users, MapPin, Video, Phone, ExternalLink, Edit, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EventDetailModalProps {
  event: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{event.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                className={`rounded-xl border ${eventTypeColors[event.type as keyof typeof eventTypeColors]} capitalize`}
              >
                {event.type}
              </Badge>
              <Badge
                className={`rounded-xl border ${statusColors[event.status as keyof typeof statusColors]} capitalize`}
              >
                {event.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-2xl">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="rounded-2xl">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-semibold text-foreground mb-2">Description</h4>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          <Separator />

          {/* Schedule Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Schedule</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{event.date}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {formatTime(event.time)} ({event.duration} minutes)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {getModeIcon(event.mode)}
                  <span className="text-foreground capitalize">{event.mode}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Host & Location</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">Host: {event.host}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{event.location}</span>
                </div>
                {event.meetingLink && (
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary hover:text-primary/80"
                      onClick={() => window.open(event.meetingLink, "_blank")}
                    >
                      Join Meeting
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Participants */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Participants ({event.participants.length})</h4>
            <div className="space-y-3">
              {event.participants.map((participant: any) => (
                <div key={participant.id} className="flex items-center gap-3 p-3 rounded-2xl bg-accent/30">
                  <Avatar className="h-10 w-10 rounded-2xl">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-sm">
                      {participant.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{participant.name}</div>
                    <div className="text-sm text-muted-foreground">{participant.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {event.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Notes</h4>
                <p className="text-muted-foreground">{event.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/40">
            {event.status === "upcoming" && event.meetingLink && (
              <Button
                className="flex-1 rounded-2xl primary-gradient glow-primary"
                onClick={() => window.open(event.meetingLink, "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Join Meeting
              </Button>
            )}
            <Button variant="outline" className="rounded-2xl">
              <Calendar className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
            <Button variant="outline" className="rounded-2xl text-red-400 hover:text-red-300">
              <Trash2 className="mr-2 h-4 w-4" />
              Cancel Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

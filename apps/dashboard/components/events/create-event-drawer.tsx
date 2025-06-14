"use client"

import { useState } from "react"
import { X, Calendar, MapPin, Video, Phone, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const participants = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 2, name: "Maria Garcia", email: "maria@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 3, name: "David Chen", email: "david@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 5, name: "Michael Brown", email: "michael@example.com", avatar: "/placeholder.svg?height=32&width=32" },
]

interface CreateEventDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateEventDrawer({ open, onOpenChange }: CreateEventDrawerProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    date: "",
    time: "",
    duration: 60,
    mode: "online",
    location: "",
    meetingLink: "",
    host: "Sarah Chen",
    notes: "",
    addToGoogleCalendar: true,
    sendReminders: true,
  })
  const [selectedParticipants, setSelectedParticipants] = useState<any[]>([])
  const [showParticipantSelector, setShowParticipantSelector] = useState(false)

  const handleSubmit = () => {
    console.log("Creating event:", { ...formData, participants: selectedParticipants })
    onOpenChange(false)
    // Reset form
    setFormData({
      title: "",
      description: "",
      type: "",
      date: "",
      time: "",
      duration: 60,
      mode: "online",
      location: "",
      meetingLink: "",
      host: "Sarah Chen",
      notes: "",
      addToGoogleCalendar: true,
      sendReminders: true,
    })
    setSelectedParticipants([])
  }

  const addParticipant = (participant: any) => {
    if (!selectedParticipants.find((p) => p.id === participant.id)) {
      setSelectedParticipants([...selectedParticipants, participant])
    }
    setShowParticipantSelector(false)
  }

  const removeParticipant = (id: number) => {
    setSelectedParticipants(selectedParticipants.filter((p) => p.id !== id))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[700px] rounded-l-3xl border-l-border/40 bg-card/80 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Schedule New Event</SheetTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription>Create and schedule interviews, webinars, hackathons, and coding rounds</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Event Details</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Frontend Developer Interview - Alex Johnson"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Event Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="hackathon">Hackathon</SelectItem>
                  <SelectItem value="coding-round">Coding Round</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the event"
                className="rounded-2xl"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Schedule</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                className="rounded-2xl"
              />
            </div>
          </div>

          <Separator />

          {/* Mode & Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Meeting Details</h3>

            <div className="space-y-2">
              <Label>Meeting Mode</Label>
              <Select value={formData.mode} onValueChange={(value) => setFormData({ ...formData, mode: value })}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Online
                    </div>
                  </SelectItem>
                  <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Offline
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Hybrid
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.mode === "online" || formData.mode === "hybrid" ? (
              <div className="space-y-2">
                <Label htmlFor="meetingLink">Meeting Link</Label>
                <Input
                  id="meetingLink"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="rounded-2xl"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Conference Room A, Building 1"
                  className="rounded-2xl"
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Participants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Participants</h3>
              <Popover open={showParticipantSelector} onOpenChange={setShowParticipantSelector}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Participant
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 rounded-2xl" align="end">
                  <Command>
                    <CommandInput placeholder="Search participants..." />
                    <CommandList>
                      <CommandEmpty>No participants found.</CommandEmpty>
                      <CommandGroup>
                        {participants.map((participant) => (
                          <CommandItem
                            key={participant.id}
                            onSelect={() => addParticipant(participant)}
                            className="flex items-center gap-3 p-3"
                          >
                            <Avatar className="h-8 w-8 rounded-2xl">
                              <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-xs">
                                {participant.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{participant.name}</div>
                              <div className="text-sm text-muted-foreground">{participant.email}</div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              {selectedParticipants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 rounded-2xl bg-accent/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 rounded-2xl">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-xs">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParticipant(participant.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Additional Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes or instructions"
                className="rounded-2xl"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Add to Google Calendar</Label>
                  <p className="text-sm text-muted-foreground">Automatically create calendar event</p>
                </div>
                <Switch
                  checked={formData.addToGoogleCalendar}
                  onCheckedChange={(checked) => setFormData({ ...formData, addToGoogleCalendar: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Send Reminders</Label>
                  <p className="text-sm text-muted-foreground">Email reminders to participants</p>
                </div>
                <Switch
                  checked={formData.sendReminders}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendReminders: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-6 border-t border-border/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-2xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 rounded-2xl primary-gradient glow-primary">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Event
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

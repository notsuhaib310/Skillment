"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface Event {
  id: number
  title: string
  type: string
  date: string
  time: string
  status: string
}

interface EventCalendarProps {
  events: Event[]
  onEventClick: (event: Event) => void
}

export function EventCalendar({ events, onEventClick }: EventCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 25)) // January 25, 2024

  const eventTypeColors = {
    interview: "bg-blue-500",
    webinar: "bg-purple-500",
    hackathon: "bg-orange-500",
    "coding-round": "bg-green-500",
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const getEventsForDate = (date: string) => {
    return events.filter((event) => event.date === date)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const today = new Date()
  const isToday = (day: number) => {
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    )
  }

  return (
    <TooltipProvider>
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar View
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")} className="h-8 w-8 rounded-xl">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold min-w-[140px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")} className="h-8 w-8 rounded-xl">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: firstDay }, (_, index) => (
                <div key={`empty-${index}`} className="h-24 p-2" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, index) => {
                const day = index + 1
                const dateString = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day)
                const dayEvents = getEventsForDate(dateString)

                return (
                  <div
                    key={day}
                    className={`h-24 p-2 rounded-2xl border transition-colors cursor-pointer hover:bg-accent/50 ${
                      isToday(day) ? "bg-primary/10 border-primary/30" : "border-border/40 hover:border-border/60"
                    }`}
                  >
                    <div className="flex flex-col h-full">
                      <div className={`text-sm font-medium mb-1 ${isToday(day) ? "text-primary" : "text-foreground"}`}>
                        {day}
                      </div>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((event) => (
                          <Tooltip key={event.id}>
                            <TooltipTrigger asChild>
                              <div
                                onClick={() => onEventClick(event)}
                                className={`w-full h-4 rounded text-xs text-white flex items-center justify-center cursor-pointer hover:opacity-80 ${
                                  eventTypeColors[event.type as keyof typeof eventTypeColors]
                                }`}
                              >
                                <span className="truncate px-1">{event.title}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-medium">{event.title}</p>
                                <p className="text-xs">{event.time}</p>
                                <Badge className="text-xs capitalize">{event.type}</Badge>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-xs text-muted-foreground">Interview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-purple-500"></div>
                <span className="text-xs text-muted-foreground">Webinar</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span className="text-xs text-muted-foreground">Hackathon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-xs text-muted-foreground">Coding Round</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

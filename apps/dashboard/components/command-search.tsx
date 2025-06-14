"use client"

import * as React from "react"
import { Search, Calendar, Settings, User, FileText, Users, Bot, TrendingUp } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function CommandSearch() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-2xl bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-80 lg:w-96"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search participants, assessments...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <Badge variant="secondary" className="ml-auto hidden sm:flex rounded-lg px-1.5 py-0.5 text-xs">
          ⌘K
        </Badge>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <Users className="mr-2 h-4 w-4" />
              <span>View All Participants</span>
            </CommandItem>
            <CommandItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Create New Assessment</span>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Schedule Interview</span>
            </CommandItem>
            <CommandItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>View Reports</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent Participants">
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Alex Johnson</span>
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Maria Garcia</span>
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>David Chen</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </CommandItem>
            <CommandItem>
              <Bot className="mr-2 h-4 w-4" />
              <span>AI Tools</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

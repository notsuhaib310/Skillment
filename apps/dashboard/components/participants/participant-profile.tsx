"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { participantsApi, type Participant, type ParticipantResponse } from "@/lib/api/participants"
import { toast } from "@/components/ui/use-toast"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ParticipantProfileProps {
  participantId: string
  onClose: () => void
}

// Status and type color mappings for UI elements



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
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        setLoading(true)
        const response: ParticipantResponse = await participantsApi.getParticipant(participantId)
        if (response.success && response.data) {
          setParticipant(response.data)
        } else {
          setError("Failed to fetch participant data")
        }
      } catch (err: any) {
        if (err.message === 'AUTH_ERROR') {
          setError("You do not have permission to view this participant or your session has expired. Please refresh or contact your admin.")
        } else {
          setError("Failed to load participant data. Please try again.")
        }
        toast({
          title: "Error",
          description: err.message === 'AUTH_ERROR' ? "You do not have permission to view this participant or your session has expired." : "Failed to load participant data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (participantId) {
      fetchParticipant()
    }
  }, [participantId])

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>{participant?.name || "Participant Profile"}</DialogTitle>
            <DialogDescription>
              Details and activity for {participant?.name || "the participant"}.
            </DialogDescription>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl ml-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading participant data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-red-500">
            <AlertTriangle className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium mb-2">Error Loading Data</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setLoading(true)
                setError(null)
                participantsApi.getParticipant(participantId)
                  .then((response: ParticipantResponse) => {
                    setParticipant(response.data)
                    setLoading(false)
                  })
                  .catch(err => {
                    console.error("Error fetching participant:", err)
                    setError("Failed to load participant data. Please try again.")
                    setLoading(false)
                  })
              }}
            >
              Try Again
            </Button>
          </div>
        ) : participant ? (
          <div>
            {(!participant.assessmentHistory?.length && !participant.activityLogs?.length) ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p className="text-lg font-medium mb-2">No additional data or activity available for this participant.</p>
              </div>
            ) : (
              // ...render the actual participant details here...
              <></>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-lg font-medium mb-2">Participant data not available for now.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

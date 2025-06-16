"use client"

import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { participantsApi } from "@/lib/api/participants"
import { X, Mail, Lock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface AddParticipantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onParticipantAdded: () => void
}

const assessments = [
  { id: 1, name: "React Fundamentals", category: "Frontend" },
  { id: 2, name: "Node.js Backend", category: "Backend" },
  { id: 3, name: "Data Structures", category: "Programming" },
  { id: 4, name: "System Design", category: "Architecture" },
]

const predefinedTags = [
  "Frontend",
  "Backend",
  "React",
  "Node.js",
  "Python",
  "Senior",
  "Junior",
  "Mid-level",
  "Batch-2024",
  "Batch-2023",
]

export function AddParticipantModal({ open, onOpenChange, onParticipantAdded }: AddParticipantModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    tags: [] as string[],
    assignedAssessments: [] as number[],
    scheduleDate: "",
    notes: "",
    sendEmailNow: true,
    autoGeneratePassword: true,
    enableProctoring: false,
  })

  const [newTag, setNewTag] = useState("")

  const handleAddTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] })
    }
    setNewTag("")
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((tag) => tag !== tagToRemove) })
  }

  const handleAssessmentToggle = (assessmentId: number) => {
    const isSelected = formData.assignedAssessments.includes(assessmentId)
    if (isSelected) {
      setFormData({
        ...formData,
        assignedAssessments: formData.assignedAssessments.filter((id) => id !== assessmentId),
      })
    } else {
      setFormData({
        ...formData,
        assignedAssessments: [...formData.assignedAssessments, assessmentId],
      })
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (action: "save-close" | "save-another") => {
    if (!formData.fullName || !formData.email || !formData.organization) {
      setError("Name, email, and organization are required")
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      // Call the API to create a new participant
      await participantsApi.createParticipant({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        tags: formData.tags,
        location: "", // Optional field
        organization: formData.organization,
      })

      onParticipantAdded()

      if (action === "save-close") {
        onOpenChange(false)
        toast({
          title: "Success",
          description: "Participant added successfully",
          variant: "default",
        })
      } else {
        // Reset form for adding another
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          organization: "",
          tags: [],
          assignedAssessments: [],
          scheduleDate: "",
          notes: "",
          sendEmailNow: true,
          autoGeneratePassword: true,
          enableProctoring: false,
        })
        toast({
          title: "Success",
          description: "Participant added successfully",
          variant: "default",
        })
      }
    } catch (err) {
      console.error("Error creating participant:", err)
      setError("Failed to create participant. Please try again.")
      toast({
        title: "Error",
        description: "Failed to create participant",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const groupedAssessments = assessments.reduce(
    (acc, assessment) => {
      if (!acc[assessment.category]) {
        acc[assessment.category] = []
      }
      acc[assessment.category].push(assessment)
      return acc
    },
    {} as Record<string, typeof assessments>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Participant</DialogTitle>
          <DialogDescription>
            Add a new participant to your platform with assessment assignments and preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="rounded-2xl"
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-2xl"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-2xl"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization *</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="rounded-2xl"
                  placeholder="Enter organization name"
                />
              </div>
            </div>
          </div>

          {/* Tags & Batch */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Tags & Batch</h3>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="rounded-xl bg-accent/50 text-foreground border-border/40"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-2 hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag(newTag)}
                  className="rounded-2xl"
                  placeholder="Add custom tag"
                />
                <Button type="button" variant="outline" onClick={() => handleAddTag(newTag)} className="rounded-2xl">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {predefinedTags
                  .filter((tag) => !formData.tags.includes(tag))
                  .map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddTag(tag)}
                      className="rounded-xl text-xs h-7"
                    >
                      + {tag}
                    </Button>
                  ))}
              </div>
            </div>
          </div>

          {/* Assessment Assignment */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Assign Assessments</h3>

            <div className="space-y-3">
              {Object.entries(groupedAssessments).map(([category, categoryAssessments]) => (
                <div key={category} className="space-y-2">
                  <Label className="text-sm font-medium">{category}</Label>
                  <div className="space-y-2">
                    {categoryAssessments.map((assessment) => (
                      <div key={assessment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assessment-${assessment.id}`}
                          checked={formData.assignedAssessments.includes(assessment.id)}
                          onCheckedChange={() => handleAssessmentToggle(assessment.id)}
                          className="rounded-md"
                        />
                        <Label htmlFor={`assessment-${assessment.id}`} className="text-sm">
                          {assessment.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Date */}
          <div className="space-y-2">
            <Label htmlFor="scheduleDate">Schedule Date (Optional)</Label>
            <Input
              id="scheduleDate"
              type="datetime-local"
              value={formData.scheduleDate}
              onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
              className="rounded-2xl"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-2xl"
              placeholder="Add any internal notes about this participant..."
              rows={3}
            />
          </div>

          {/* Smart Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Preferences</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="sendEmail">Send exam email now</Label>
                </div>
                <Switch
                  id="sendEmail"
                  checked={formData.sendEmailNow}
                  onCheckedChange={(checked) => setFormData({ ...formData, sendEmailNow: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="autoPassword">Auto-generate password</Label>
                </div>
                <Switch
                  id="autoPassword"
                  checked={formData.autoGeneratePassword}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoGeneratePassword: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="proctoring">Enable proctoring</Label>
                </div>
                <Switch
                  id="proctoring"
                  checked={formData.enableProctoring}
                  onCheckedChange={(checked) => setFormData({ ...formData, enableProctoring: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
            {error}
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-2xl" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSubmit("save-another")} 
            className="rounded-2xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save & Add Another"}
          </Button>
          <Button 
            onClick={() => handleSubmit("save-close")} 
            className="rounded-2xl primary-gradient glow-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save & Close"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { X, Send, Save, Eye, Users, Sparkles } from "lucide-react"
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

const recipients = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 2, name: "Maria Garcia", email: "maria@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 3, name: "David Chen", email: "david@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", avatar: "/placeholder.svg?height=32&width=32" },
  { id: 5, name: "Michael Brown", email: "michael@example.com", avatar: "/placeholder.svg?height=32&width=32" },
]

const emailTemplates = [
  {
    id: 1,
    name: "Assessment Invitation",
    subject: "You're invited to take our {assessment_name} assessment",
    content: `Hi {name},

We're excited to invite you to take our {assessment_name} assessment for the {position} role.

Assessment Details:
- Duration: {duration} minutes
- Questions: {question_count}
- Link: {assessment_link}

Please complete the assessment by {deadline}.

Best regards,
{sender_name}`,
  },
  {
    id: 2,
    name: "Interview Schedule",
    subject: "Interview Scheduled - {position} Position",
    content: `Hi {name},

Your interview for the {position} position has been scheduled.

Interview Details:
- Date: {interview_date}
- Time: {interview_time}
- Duration: {duration} minutes
- Meeting Link: {meeting_link}

Looking forward to speaking with you!

Best regards,
{sender_name}`,
  },
]

const variables = [
  "{name}",
  "{email}",
  "{position}",
  "{assessment_name}",
  "{assessment_link}",
  "{interview_date}",
  "{interview_time}",
  "{meeting_link}",
  "{duration}",
  "{question_count}",
  "{deadline}",
  "{sender_name}",
  "{company_name}",
]

interface EmailComposerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend?: (data: any) => Promise<void>
  onSaveDraft?: (data: any) => Promise<void>
}

export function EmailComposer({ open, onOpenChange, onSend, onSaveDraft }: EmailComposerProps) {
  const [formData, setFormData] = useState({
    to: [] as any[],
    subject: "",
    content: "",
    template: "",
    scheduleFor: "",
    sendReminders: true,
  })
  const [showRecipientSelector, setShowRecipientSelector] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const handleSubmit = () => {
    if (onSend) onSend(formData)
    onOpenChange(false)
    setFormData({
      to: [],
      subject: "",
      content: "",
      template: "",
      scheduleFor: "",
      sendReminders: true,
    })
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) onSaveDraft(formData)
    onOpenChange(false)
    setFormData({
      to: [],
      subject: "",
      content: "",
      template: "",
      scheduleFor: "",
      sendReminders: true,
    })
  }

  const addRecipient = (recipient: any) => {
    if (!formData.to.find((r: any) => r.id === recipient.id)) {
      setFormData({ ...formData, to: [...formData.to, recipient] })
    }
    setShowRecipientSelector(false)
  }

  const removeRecipient = (id: number) => {
    setFormData({ ...formData, to: formData.to.filter((r: any) => r.id !== id) })
  }

  const insertVariable = (variable: string) => {
    setFormData({ ...formData, content: formData.content + variable })
  }

  const loadTemplate = (templateId: string) => {
    const template = emailTemplates.find((t) => t.id === Number.parseInt(templateId))
    if (template) {
      setFormData({
        ...formData,
        subject: template.subject,
        content: template.content,
        template: templateId,
      })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:w-[900px] rounded-l-3xl border-l-border/40 bg-card/80 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Compose Email</SheetTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="rounded-2xl">
                <Eye className="mr-2 h-4 w-4" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SheetDescription>Create and send personalized emails with templates and variables</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {!previewMode ? (
            <>
              {/* Template Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Template</h3>
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Generate
                  </Button>
                </div>

                <Select value={formData.template} onValueChange={loadTemplate}>
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Choose a template (optional)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Recipients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Recipients</h3>
                  <Popover open={showRecipientSelector} onOpenChange={setShowRecipientSelector}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-2xl">
                        <Users className="mr-2 h-4 w-4" />
                        Add Recipients
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-2xl" align="end">
                      <Command>
                        <CommandInput placeholder="Search recipients..." />
                        <CommandList>
                          <CommandEmpty>No recipients found.</CommandEmpty>
                          <CommandGroup>
                            {recipients.map((recipient) => (
                              <CommandItem
                                key={recipient.id}
                                onSelect={() => addRecipient(recipient)}
                                className="flex items-center gap-3 p-3"
                              >
                                <Avatar className="h-8 w-8 rounded-2xl">
                                  <AvatarImage src={recipient.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-xs">
                                    {recipient.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{recipient.name}</div>
                                  <div className="text-sm text-muted-foreground">{recipient.email}</div>
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
                  {formData.to.map((recipient) => (
                    <div key={recipient.id} className="flex items-center justify-between p-3 rounded-2xl bg-accent/30">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 rounded-2xl">
                          <AvatarImage src={recipient.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="rounded-2xl bg-gradient-to-br from-primary to-orange-600 text-primary-foreground text-xs">
                            {recipient.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">{recipient.name}</div>
                          <div className="text-sm text-muted-foreground">{recipient.email}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(recipient.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Email Content */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Email Content</h3>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Email subject line"
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-2">
                    <Label htmlFor="content">Message *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your email message here..."
                      className="rounded-2xl min-h-64"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Variables</Label>
                      <p className="text-xs text-muted-foreground mb-3">Click to insert into message</p>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {variables.map((variable) => (
                          <Button
                            key={variable}
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(variable)}
                            className="rounded-xl justify-start text-xs"
                          >
                            {variable}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Options</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleFor">Schedule for Later</Label>
                    <Input
                      id="scheduleFor"
                      type="datetime-local"
                      value={formData.scheduleFor}
                      onChange={(e) => setFormData({ ...formData, scheduleFor: e.target.value })}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Send Reminders</Label>
                        <p className="text-sm text-muted-foreground">Follow up if not opened</p>
                      </div>
                      <Switch
                        checked={formData.sendReminders}
                        onCheckedChange={(checked) => setFormData({ ...formData, sendReminders: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="p-6 rounded-3xl border border-border/40 bg-background/50">
                <div className="space-y-4">
                  <div className="border-b border-border/40 pb-4">
                    <div className="text-sm text-muted-foreground">
                      To: {formData.to.map((r) => r.email).join(", ")}
                    </div>
                    <div className="text-lg font-semibold text-foreground mt-2">{formData.subject}</div>
                  </div>
                  <div className="whitespace-pre-wrap text-foreground">{formData.content}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-6 border-t border-border/40">
          <Button variant="outline" onClick={handleSaveDraft} className="rounded-2xl">
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button onClick={handleSubmit} className="flex-1 rounded-2xl primary-gradient glow-primary">
            <Send className="mr-2 h-4 w-4" />
            {formData.scheduleFor ? "Schedule Email" : "Send Now"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

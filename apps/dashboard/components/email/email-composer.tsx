"use client"

import { useState, useEffect } from "react"
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
import Editor from '@tinymce/tinymce-react';
import * as api from '@/lib/api/email';

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
  template?: any
}

export function EmailComposer({ open, onOpenChange, onSend, onSaveDraft, template }: EmailComposerProps) {
  const [formData, setFormData] = useState({
    to: [] as any[],
    subject: template?.subject || "",
    content: template?.body || template?.content || "",
    template: template?.id || "",
    scheduleFor: "",
    sendReminders: true,
  })
  const [showRecipientSelector, setShowRecipientSelector] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open && template) {
      setFormData((prev) => ({
        ...prev,
        subject: template.subject || "",
        content: template.body || template.content || "",
        template: template.id || "",
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template])

  const handleSend = async () => {
    setSending(true)
    try {
      await api.sendEmail({
        to: formData.to.map((r: any) => r.email),
        subject: formData.subject,
        body: formData.content,
        templateId: formData.template || undefined,
      })
      onOpenChange(false)
      setFormData({
        to: [],
        subject: "",
        content: "",
        template: "",
        scheduleFor: "",
        sendReminders: true,
      })
    } catch {
      // handle error
    } finally {
      setSending(false)
    }
  }

  const handleSaveDraft = async () => {
    setSending(true)
    try {
      await api.saveDraft({
        to: formData.to.map((r: any) => r.email),
        subject: formData.subject,
        body: formData.content,
        templateId: formData.template || undefined,
      })
      onOpenChange(false)
      setFormData({
        to: [],
        subject: "",
        content: "",
        template: "",
        scheduleFor: "",
        sendReminders: true,
      })
    } catch {
      // handle error
    } finally {
      setSending(false)
    }
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
      <SheetContent className="w-[90vw] max-w-4xl min-h-screen rounded-none border-l-border/40 bg-card/80 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Compose Email</SheetTitle>
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
              {/* Subject */}
              <Input
                className="mb-4"
                placeholder="Subject"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
              {/* TinyMCE Editor */}
              <div>
                <label className="block mb-2 font-medium">Body</label>
                <Editor
                  apiKey="no-api-key"
                  value={formData.content}
                  init={{
                    height: 350,
                    menubar: true,
                    plugins: [
                      'advlist autolink lists link image charmap print preview anchor',
                      'searchreplace visualblocks code fullscreen',
                      'insertdatetime media table paste code help wordcount'
                    ],
                    toolbar:
                      'undo redo | formatselect | bold italic backcolor | \
                      alignleft aligncenter alignright alignjustify | \
                      bullist numlist outdent indent | removeformat | help',
                  }}
                  onEditorChange={(content: string) => setFormData({ ...formData, content })}
                />
              </div>
              {/* Recipients */}
              <div className="space-y-4 mt-6">
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
                                      .map((n: string) => n[0])
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
                          <div className="font-medium">{recipient.name}</div>
                          <div className="text-sm text-muted-foreground">{recipient.email}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeRecipient(recipient.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Send/Save Buttons */}
              <div className="flex justify-end gap-2 mt-8">
                <Button variant="outline" onClick={handleSaveDraft} disabled={sending}>Save Draft</Button>
                <Button onClick={handleSend} disabled={sending}>Send</Button>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-card rounded-xl p-6 min-h-[300px] border border-border/40 shadow-inner">
              <div className="text-lg font-semibold mb-2">Preview</div>
              <div dangerouslySetInnerHTML={{ __html: formData.content }} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

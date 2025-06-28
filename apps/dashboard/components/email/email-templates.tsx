"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Copy, Eye, Mail, Calendar, Users, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import * as api from "@/lib/api/email"
import { EmailComposer } from "@/components/email/email-composer"
import Editor from '@tinymce/tinymce-react';

const typeColors = {
  "assessment-invite": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "interview-schedule": "bg-green-500/20 text-green-400 border-green-500/30",
  "result-notification": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "event-reminder": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  welcome: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "follow-up": "bg-pink-500/20 text-pink-400 border-pink-500/30",
}

const typeIcons = {
  "assessment-invite": FileText,
  "interview-schedule": Calendar,
  "result-notification": Mail,
  "event-reminder": Calendar,
  welcome: Users,
  "follow-up": Mail,
}

function TemplateModal({ open, onClose, onSave, template }: { open: boolean, onClose: () => void, onSave: (data: any) => void, template?: any }) {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [body, setBody] = useState(template?.body || "");
  useEffect(() => {
    setName(template?.name || "");
    setSubject(template?.subject || "");
    setBody(template?.body || "");
  }, [template, open]);
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 ${open ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        <h2 className="text-2xl font-bold mb-4">{template ? 'Edit' : 'Create'} Email Template</h2>
        <div className="space-y-4">
          <Input placeholder="Template Name" value={name} onChange={e => setName(e.target.value)} />
          <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <div>
            <label className="block mb-2 font-medium">Body</label>
            <Editor
              apiKey="no-api-key"
              value={body}
              init={{
                height: 300,
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
              onEditorChange={setBody}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ name, subject, body })}>{template ? 'Update' : 'Create'}</Button>
        </div>
      </div>
    </div>
  );
}

export function EmailTemplates() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editTemplate, setEditTemplate] = useState<any>(null)
  const [showComposer, setShowComposer] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  useEffect(() => {
    setLoading(true)
    api.getTemplates()
      .then((data) => {
        setTemplates(data)
      })
      .catch(() => toast.error("Failed to load templates"))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (template: any) => {
    setLoading(true)
    try {
      const res = await api.createTemplate(template)
      setTemplates([res, ...templates])
      toast.success("Template created")
      setShowModal(false)
    } catch {
      toast.error("Failed to create template")
    } finally {
      setLoading(false)
    }
  }
  const handleUpdate = async (id: string, template: any) => {
    setLoading(true)
    try {
      const res = await api.updateTemplate(id, template)
      setTemplates(templates.map(t => t.id === id ? res : t))
      toast.success("Template updated")
      setShowModal(false)
      setEditTemplate(null)
    } catch {
      toast.error("Failed to update template")
    } finally {
      setLoading(false)
    }
  }
  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await api.deleteTemplate(id)
      setTemplates(templates.filter(t => t.id !== id))
      toast.success("Template deleted")
    } catch {
      toast.error("Failed to delete template")
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || template.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Pre-built templates for common communications</p>
        </div>
        <Button className="rounded-2xl primary-gradient glow-primary" onClick={() => { setShowModal(true); setEditTemplate(null); }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md rounded-2xl"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 rounded-2xl">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="assessment-invite">Assessment Invite</SelectItem>
            <SelectItem value="interview-schedule">Interview Schedule</SelectItem>
            <SelectItem value="result-notification">Result Notification</SelectItem>
            <SelectItem value="event-reminder">Event Reminder</SelectItem>
            <SelectItem value="welcome">Welcome</SelectItem>
            <SelectItem value="follow-up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No templates found. Create a new template to get started.
          </div>
        ) : filteredTemplates.map((template) => {
          const IconComponent = typeIcons[template.type as keyof typeof typeIcons] || FileText
          return (
            <Card
              key={template.id}
              className="card-gradient rounded-3xl border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${typeColors[template.type as keyof typeof typeColors]}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Subject:</p>
                  <p className="text-sm text-muted-foreground italic">{template.subject}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(template.tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="rounded-xl text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last: {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="rounded-2xl text-blue-500 hover:text-blue-400" onClick={() => { setSelectedTemplate(template); setShowComposer(true); }}>Send</Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-2xl">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl" onClick={() => { setEditTemplate(template); setShowModal(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-2xl text-red-400 hover:text-red-300" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {showComposer && selectedTemplate && (
        <EmailComposer
          open={showComposer}
          onOpenChange={(open) => { setShowComposer(open); if (!open) setSelectedTemplate(null); }}
          template={selectedTemplate}
        />
      )}
      {showModal && (
        <TemplateModal
          open={showModal}
          onClose={() => { setShowModal(false); setEditTemplate(null); }}
          onSave={async (data) => {
            if (editTemplate) {
              await handleUpdate(editTemplate.id, data)
            } else {
              await handleCreate(data)
            }
          }}
          template={editTemplate}
        />
      )}
    </div>
  )
}

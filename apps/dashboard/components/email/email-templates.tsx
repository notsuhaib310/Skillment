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
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

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

function wrapWithBaseTheme(userHtml: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email from Skillment</title>
      <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f1f5f9; color: #0f172a; }
        .container { max-width: 600px; margin: auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #0f0f23 0%, #1e293b 100%); color: #fff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 32px 24px; }
        .footer { text-align: center; font-size: 14px; color: #94a3b8; padding: 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
        @media (max-width: 600px) { .content, .header { padding: 16px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <h1>Skillment</h1>
        </header>
        <section class="content">
          ${userHtml}
        </section>
        <footer class="footer">
          <p>Regards,<br/>Skillment</p>
          <p style="font-size:12px;">© ${new Date().getFullYear()} Skillment. All rights reserved.</p>
        </footer>
      </div>
    </body>
    </html>
  `;
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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${open ? '' : 'hidden'}`}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">{template ? 'Edit' : 'Create'} Email Template</h2>
        <div className="space-y-4">
          <Input placeholder="Template Name" value={name} onChange={e => setName(e.target.value)} className="bg-neutral-800 border border-neutral-700 text-white" />
          <Input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="bg-neutral-800 border border-neutral-700 text-white" />
          <div>
            <label className="block mb-2 font-medium">Body (HTML supported)</label>
            <div className="bg-[#282a36] rounded-lg overflow-hidden min-h-[150px] mb-4">
              <Editor
                value={body}
                onValueChange={setBody}
                highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
                padding={16}
                style={{
                  fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
                  fontSize: 16,
                  minHeight: 150,
                  color: '#f8f8f2',
                  background: '#282a36',
                  borderRadius: '0.75rem',
                  outline: 'none',
                  border: 'none',
                  width: '100%',
                  resize: 'vertical',
                }}
                placeholder="Enter email body (HTML supported)..."
              />
            </div>
            <div className="mt-2 text-xs text-neutral-400 select-none mb-2">
              <span className="font-semibold">Preview (final email look):</span>
            </div>
            <div className="rounded-lg border border-neutral-800 bg-white overflow-x-auto" style={{ minHeight: 80, maxHeight: 240 }}>
              <iframe
                title="Template Preview"
                style={{ width: '100%', height: 180, border: 'none', background: 'white', borderRadius: '0.75rem' }}
                srcDoc={wrapWithBaseTheme(body)}
                sandbox="allow-same-origin"
              />
            </div>
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
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    setLoading(true)
    api.getTemplates()
      .then((data) => {
        setTemplates(data)
      })
      .catch(() => toast.error("Failed to load templates"))
      .finally(() => setLoading(false))
  }, [refreshFlag])

  const handleCreate = async (template: any) => {
    setLoading(true)
    try {
      await api.createTemplate(template)
      setShowModal(false)
      setRefreshFlag(f => f + 1)
      toast.success("Template created")
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
      (template.name && template.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (template.subject && template.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || template.type === typeFilter;
    return matchesSearch && matchesType;
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

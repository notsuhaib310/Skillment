"use client"

import { useState, useEffect, useRef } from "react"
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
import dynamic from 'next/dynamic';
import * as api from '@/lib/api/email';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { participantsApi, Participant } from '@/lib/api/participants';

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

const smartFields = [
  { label: 'Name', value: '{{name}}' },
  { label: 'Email', value: '{{email}}' },
  { label: 'Position', value: '{{position}}' },
  { label: 'Assessment Name', value: '{{assessment_name}}' },
  { label: 'Assessment Link', value: '{{assessment_link}}' },
  { label: 'Interview Date', value: '{{interview_date}}' },
  { label: 'Interview Time', value: '{{interview_time}}' },
  { label: 'Meeting Link', value: '{{meeting_link}}' },
  { label: 'Duration', value: '{{duration}}' },
  { label: 'Question Count', value: '{{question_count}}' },
  { label: 'Deadline', value: '{{deadline}}' },
  { label: 'Sender Name', value: '{{sender_name}}' },
  { label: 'Company Name', value: '{{company_name}}' },
];

interface EmailComposerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSend?: (data: any) => Promise<void>
  onSaveDraft?: (data: any) => Promise<void>
  template?: any
}

// Add a function to wrap user HTML in the base theme
function wrapWithBaseTheme(userHtml: string, data: any = {}) {
  // Minimal version of the backend's HTML theme, with userHtml injected in the content section
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

export function EmailComposer({ open, onOpenChange, onSend, onSaveDraft, template }: EmailComposerProps) {
  const [formData, setFormData] = useState({
    to: [] as Participant[],
    subject: template?.subject || "",
    content: template?.body || template?.content || "",
    template: template?.id || "",
    scheduleFor: "",
    sendReminders: true,
  })
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [showRecipientSelector, setShowRecipientSelector] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [sending, setSending] = useState(false)
  const editorRef = useRef<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch participants on open
  useEffect(() => {
    if (open) {
      setLoadingParticipants(true);
      participantsApi.getParticipants({ page: 1, limit: 100 })
        .then(res => setParticipants(res.data.participants))
        .finally(() => setLoadingParticipants(false));
    }
  }, [open]);

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

  // Insert smart field at cursor in code editor
  const insertSmartField = (fieldValue: string) => {
    if (editorRef.current) {
      const textarea = editorRef.current._input || editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = formData.content.slice(0, start);
      const after = formData.content.slice(end);
      const newValue = before + fieldValue + after;
      setFormData({ ...formData, content: newValue });
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + fieldValue.length;
      }, 0);
    } else {
      setFormData({ ...formData, content: formData.content + fieldValue });
    }
  };

  // Handle recipient selection
  const handleRecipientChange = (participant: Participant) => {
    if (!formData.to.find((r) => r.id === participant.id)) {
      setFormData({ ...formData, to: [...formData.to, participant] });
    }
  };
  const handleRemoveRecipient = (id: string) => {
    setFormData({ ...formData, to: formData.to.filter((r) => r.id !== id) });
  };

  // Handle subject change
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, subject: e.target.value });
  };

  // Always append footer when sending/saving
  const getBodyWithFooter = () => {
    const trimmed = formData.content.trimEnd();
    return trimmed + '\n\nRegards,\nSkillment';
  };

  const handleSend = async () => {
    setSending(true)
    try {
      await onSend?.({
        to: formData.to.map((r) => r.email),
        subject: formData.subject,
        body: wrapWithBaseTheme(formData.content),
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
      await onSaveDraft?.({
        to: formData.to.map((r) => r.email),
        subject: formData.subject,
        body: wrapWithBaseTheme(formData.content),
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

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-4xl w-full p-8 relative text-white">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="text-2xl font-bold mb-6">Compose Email</div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Fields */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Recipients */}
            <div>
              <label className="block mb-2 font-medium">Recipients</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.to.map((r) => (
                  <span key={r.id} className="inline-flex items-center bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium mr-2">
                    {r.name} &lt;{r.email}&gt;
                    <button onClick={() => handleRemoveRecipient(r.id)} className="ml-2 text-red-400 hover:text-red-200">&times;</button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-white"
                  placeholder="Search participants..."
                  value={searchTerm}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  disabled={loadingParticipants}
                />
                {showDropdown && (
                  <div className="absolute z-10 bg-neutral-900 border border-neutral-700 rounded-lg mt-1 w-full max-h-40 overflow-y-auto">
                    {participants
                      .filter(p => !formData.to.find(r => r.id === p.id) &&
                        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      )
                      .map(p => (
                        <div
                          key={p.id}
                          className="px-3 py-2 hover:bg-neutral-800 cursor-pointer text-sm"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            handleRecipientChange(p);
                            setShowDropdown(false);
                            setSearchTerm("");
                            if (searchInputRef.current) searchInputRef.current.blur();
                          }}
                        >
                          {p.name} &lt;{p.email}&gt;
                        </div>
                      ))}
                    {loadingParticipants && <div className="px-3 py-2 text-neutral-400">Loading...</div>}
                    {participants.filter(p => !formData.to.find(r => r.id === p.id) &&
                        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                      ).length === 0 && !loadingParticipants && (
                      <div className="px-3 py-2 text-neutral-500">No participants found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            {/* Subject */}
            <div>
              <label className="block mb-2 font-medium">Title</label>
              <input
                type="text"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 p-2 text-white"
                placeholder="Enter email title..."
                value={formData.subject}
                onChange={handleSubjectChange}
                required
              />
            </div>
            {/* Body */}
            <div>
              <label className="block mb-2 font-medium">Body (HTML supported)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {smartFields.map(field => (
                  <button
                    key={field.value}
                    type="button"
                    className="px-2 py-1 bg-neutral-800 text-xs text-white rounded hover:bg-primary/80 border border-neutral-700"
                    onClick={() => insertSmartField(field.value)}
                  >
                    {field.label}
                  </button>
                ))}
              </div>
              <div className="bg-[#282a36] rounded-lg overflow-hidden min-h-[200px] mb-4">
                <Editor
                  ref={editorRef}
                  value={formData.content}
                  onValueChange={code => setFormData({ ...formData, content: code })}
                  highlight={code => Prism.highlight(code, Prism.languages.markup, 'markup')}
                  padding={16}
                  style={{
                    fontFamily: 'Fira Mono, Menlo, Monaco, Consolas, monospace',
                    fontSize: 16,
                    minHeight: 200,
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
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : 'Send'}</Button>
              <Button onClick={handleSaveDraft} disabled={sending} variant="secondary">Save Draft</Button>
            </div>
          </div>
          {/* Right: Preview */}
          <div className="w-full md:w-[420px] flex-shrink-0">
            <div className="mb-2 text-xs text-neutral-400 select-none">
              <span className="font-semibold">Preview (final email look):</span>
            </div>
            <div className="rounded-lg border border-neutral-800 bg-white overflow-x-auto" style={{ minHeight: 120, maxHeight: 480 }}>
              <iframe
                title="Email Preview"
                style={{ width: '100%', height: 420, border: 'none', background: 'white', borderRadius: '0.75rem' }}
                srcDoc={wrapWithBaseTheme(formData.content)}
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

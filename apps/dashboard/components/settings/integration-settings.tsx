"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Mail, MessageSquare, Calendar, Webhook, CheckCircle, XCircle } from "lucide-react"

export function IntegrationSettings() {
  const [integrations, setIntegrations] = useState({
    smtp: { connected: true, email: "noreply@skillment.com" },
    whatsapp: { connected: false, number: "" },
    calendar: { connected: true, type: "Google Calendar" },
    webhooks: { enabled: false, url: "" },
  })

  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>SMTP settings for sending emails</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.smtp.connected ? "default" : "secondary"} className="rounded-full">
              {integrations.smtp.connected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>SMTP Server</Label>
              <Input defaultValue="smtp.gmail.com" className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input defaultValue="587" className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input defaultValue={integrations.smtp.email} className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" className="rounded-2xl" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Button variant="outline" className="rounded-2xl">
              Test Connection
            </Button>
            <Button className="rounded-2xl primary-gradient">Save SMTP Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10">
                <MessageSquare className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>WhatsApp Cloud API</CardTitle>
                <CardDescription>Send notifications via WhatsApp</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.whatsapp.connected ? "default" : "secondary"} className="rounded-full">
              {integrations.whatsapp.connected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Phone Number ID</Label>
              <Input placeholder="Enter Phone Number ID" className="rounded-2xl" />
            </div>
            <div className="space-y-2">
              <Label>Access Token</Label>
              <Input type="password" placeholder="Enter Access Token" className="rounded-2xl" />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Note:</strong> You need to set up WhatsApp Business API and get approval from Meta to use this
              feature.
            </p>
          </div>
          <div className="flex justify-end">
            <Button className="rounded-2xl" variant="outline">
              Connect WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Integration */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10">
                <Calendar className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>Calendar Integration</CardTitle>
                <CardDescription>Sync interviews with your calendar</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.calendar.connected ? "default" : "secondary"} className="rounded-full">
              {integrations.calendar.connected ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {integrations.calendar.type}
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-2xl flex-1">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Connect Google Calendar
            </Button>
            <Button variant="outline" className="rounded-2xl flex-1">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M23.5 12c0-6.35-5.15-11.5-11.5-11.5S.5 5.65.5 12c0 5.74 4.21 10.49 9.71 11.35v-8.03H7.78V12h2.43v-2.12c0-2.4 1.43-3.72 3.61-3.72 1.05 0 2.14.19 2.14.19v2.35h-1.21c-1.19 0-1.56.74-1.56 1.5V12h2.65l-.42 3.32h-2.23v8.03C19.29 22.49 23.5 17.74 23.5 12z"
                />
              </svg>
              Connect Outlook
            </Button>
          </div>
          {integrations.calendar.connected && (
            <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✅ Calendar sync is active. Interview events will be automatically created.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10">
                <Webhook className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Send real-time data to external systems</CardDescription>
              </div>
            </div>
            <Switch
              checked={integrations.webhooks.enabled}
              onCheckedChange={(checked) =>
                setIntegrations({
                  ...integrations,
                  webhooks: { ...integrations.webhooks, enabled: checked },
                })
              }
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              placeholder="https://your-app.com/webhook"
              className="rounded-2xl"
              disabled={!integrations.webhooks.enabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Events to Send</Label>
            <div className="grid grid-cols-2 gap-2">
              {["Assessment Completed", "Participant Added", "Email Sent", "Interview Scheduled"].map((event) => (
                <div key={event} className="flex items-center space-x-2 p-2 rounded-xl bg-accent/30">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">{event}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="rounded-2xl primary-gradient" disabled={!integrations.webhooks.enabled}>
              Save Webhook Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

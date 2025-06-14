"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Mail, Calendar, BarChart3 } from "lucide-react"

export function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailOnResult: true,
    inviteSent: true,
    reminder: false,
    weeklyReports: true,
    reportDay: "monday",
    reportTime: "09:00",
  })

  const updateNotification = (key: string, value: boolean | string) => {
    setNotifications({ ...notifications, [key]: value })
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
              <Bell className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure when to send email notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-green-500" />
                <div>
                  <Label htmlFor="email-result">Assessment Results</Label>
                  <p className="text-sm text-muted-foreground">Send email when assessment is completed</p>
                </div>
              </div>
              <Switch
                id="email-result"
                checked={notifications.emailOnResult}
                onCheckedChange={(checked) => updateNotification("emailOnResult", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <Label htmlFor="invite-sent">Invitation Sent</Label>
                  <p className="text-sm text-muted-foreground">Confirm when invitations are delivered</p>
                </div>
              </div>
              <Switch
                id="invite-sent"
                checked={notifications.inviteSent}
                onCheckedChange={(checked) => updateNotification("inviteSent", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <Label htmlFor="reminder">Assessment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send reminders before assessment deadline</p>
                </div>
              </div>
              <Switch
                id="reminder"
                checked={notifications.reminder}
                onCheckedChange={(checked) => updateNotification("reminder", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Weekly Summary Reports</CardTitle>
              <CardDescription>Automated weekly performance reports</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40">
            <div>
              <Label htmlFor="weekly-reports">Enable Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Receive weekly summary of activities and metrics</p>
            </div>
            <Switch
              id="weekly-reports"
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => updateNotification("weeklyReports", checked)}
            />
          </div>

          {notifications.weeklyReports && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Report Day</Label>
                <Select
                  value={notifications.reportDay}
                  onValueChange={(value) => updateNotification("reportDay", value)}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Report Time</Label>
                <Select
                  value={notifications.reportTime}
                  onValueChange={(value) => updateNotification("reportTime", value)}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                    <SelectItem value="18:00">6:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button className="rounded-2xl primary-gradient">Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, User, Bot, Clock } from "lucide-react"

const chatMessages = [
  {
    id: 1,
    type: "bot",
    message: "Hi! I'm here to help you with Skillment. What can I assist you with today?",
    timestamp: "2 minutes ago",
  },
  {
    id: 2,
    type: "user",
    message: "I'm having trouble setting up email notifications for my assessments.",
    timestamp: "1 minute ago",
  },
  {
    id: 3,
    type: "bot",
    message:
      "I can help you with that! Email notifications can be configured in Settings > Notifications. Would you like me to guide you through the process?",
    timestamp: "30 seconds ago",
  },
]

export function SupportChat() {
  const [message, setMessage] = useState("")
  const [isOnline, setIsOnline] = useState(false)

  return (
    <div className="space-y-6">
      {/* Chat Status */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Live Chat Support</CardTitle>
                <CardDescription>Get instant help from our support team</CardDescription>
              </div>
            </div>
            <Badge variant={isOnline ? "default" : "secondary"} className="rounded-full">
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardContent className="p-0">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start gap-3 max-w-[80%] ${msg.type === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-2xl ${
                      msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-accent"
                    }`}
                  >
                    {msg.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`rounded-2xl p-4 ${
                      msg.type === "user" ? "bg-primary text-primary-foreground" : "bg-accent"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <div
                      className={`flex items-center gap-1 mt-2 text-xs ${
                        msg.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="border-t border-border/40 p-4">
            {isOnline ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-2xl"
                  onKeyPress={(e) => e.key === "Enter" && message.trim() && setMessage("")}
                />
                <Button size="icon" className="rounded-2xl primary-gradient" disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Our support team is currently offline.</p>
                <Button className="rounded-2xl primary-gradient">Leave a Message</Button>
                <p className="text-xs text-muted-foreground">We'll respond via email within 24 hours</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Help Topics */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle>Quick Help Topics</CardTitle>
          <CardDescription>Common questions and quick solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "How to create an assessment?",
              "Setting up email notifications",
              "Managing participant invitations",
              "Configuring proctoring settings",
              "Using AI question generator",
              "Exporting assessment results",
            ].map((topic, index) => (
              <Button key={index} variant="outline" className="rounded-2xl justify-start h-auto p-4 text-left">
                <div>
                  <p className="font-medium">{topic}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click for instant help</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KnowledgeBase } from "./knowledge-base"
import { SupportChat } from "./support-chat"
import { TicketSystem } from "./ticket-system"
import { FeatureRequest } from "./feature-request"
import { Book, MessageCircle, Ticket, Lightbulb } from "lucide-react"

export function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get help and support for your Skillment account</p>
      </div>

      <Tabs defaultValue="knowledge" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Live Chat
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge">
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="chat">
          <SupportChat />
        </TabsContent>

        <TabsContent value="tickets">
          <TicketSystem />
        </TabsContent>

        <TabsContent value="feedback">
          <FeatureRequest />
        </TabsContent>
      </Tabs>
    </div>
  )
}

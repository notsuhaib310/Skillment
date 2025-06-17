"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationSettings } from "./organization-settings"
import { UserSettings } from "./user-settings"
import { NotificationSettings } from "./notification-settings"
import { IntegrationSettings } from "./integration-settings"
import { BillingSettings } from "./billing-settings"
import { Building2, Bell, Plug, CreditCard, User } from "lucide-react"

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your organization settings and preferences</p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
  <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
    <TabsTrigger value="user" className="flex items-center justify-center gap-2">
      <User className="h-4 w-4" />
      Profile
    </TabsTrigger>
    <TabsTrigger value="organization" className="flex items-center justify-center gap-2">
      <Building2 className="h-4 w-4" />
      Organization
    </TabsTrigger>
    <TabsTrigger value="notifications" className="flex items-center justify-center gap-2">
      <Bell className="h-4 w-4" />
      Notifications
    </TabsTrigger>
    <TabsTrigger value="integrations" className="flex items-center justify-center gap-2">
      <Plug className="h-4 w-4" />
      Integrations
    </TabsTrigger>
    <TabsTrigger value="billing" className="flex items-center justify-center gap-2">
      <CreditCard className="h-4 w-4" />
      Billing
    </TabsTrigger>
  </TabsList>

  <TabsContent value="user" className="space-y-6">
    <UserSettings />
  </TabsContent>
  <TabsContent value="organization">
    <OrganizationSettings />
  </TabsContent>
  <TabsContent value="notifications">
    <NotificationSettings />
  </TabsContent>
  <TabsContent value="integrations">
    <IntegrationSettings />
  </TabsContent>
  <TabsContent value="billing">
    <BillingSettings />
  </TabsContent>
</Tabs>

    </div>
  )
}

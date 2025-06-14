"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Download, Star, Zap } from "lucide-react"

export function BillingSettings() {
  const currentPlan = {
    name: "Professional",
    price: "$49",
    period: "month",
    features: ["Unlimited Assessments", "500 Participants", "Email Support", "Basic Analytics"],
  }

  const usage = {
    assessments: { used: 45, limit: "Unlimited" },
    participants: { used: 287, limit: 500 },
    emails: { used: 1250, limit: 2000 },
    storage: { used: 2.3, limit: 10 },
  }

  const invoices = [
    { id: "INV-2024-001", date: "2024-01-01", amount: "$49.00", status: "Paid" },
    { id: "INV-2023-012", date: "2023-12-01", amount: "$49.00", status: "Paid" },
    { id: "INV-2023-011", date: "2023-11-01", amount: "$49.00", status: "Paid" },
  ]

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-500/10">
                <Star className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details and usage</CardDescription>
              </div>
            </div>
            <Badge className="rounded-full bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
            <div>
              <h3 className="text-2xl font-bold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">
                {currentPlan.price}/{currentPlan.period} • Next billing: Jan 15, 2024
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">{currentPlan.price}</div>
              <div className="text-sm text-muted-foreground">per {currentPlan.period}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-xl bg-accent/30">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl">
              Change Plan
            </Button>
            <Button variant="outline" className="rounded-2xl text-red-500 border-red-500/20 hover:bg-red-500/10">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10">
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>Track your current usage against plan limits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Assessments Created</span>
                <span>
                  {usage.assessments.used} / {usage.assessments.limit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-accent">
                <div className="h-2 rounded-full bg-green-500 w-full" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Participants</span>
                <span>
                  {usage.participants.used} / {usage.participants.limit}
                </span>
              </div>
              <Progress value={(usage.participants.used / usage.participants.limit) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Emails Sent</span>
                <span>
                  {usage.emails.used} / {usage.emails.limit}
                </span>
              </div>
              <Progress value={(usage.emails.used / usage.emails.limit) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Storage Used</span>
                <span>
                  {usage.storage.used}GB / {usage.storage.limit}GB
                </span>
              </div>
              <Progress value={(usage.storage.used / usage.storage.limit) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10">
              <CreditCard className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your billing information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40">
            <div className="flex items-center gap-3">
              <div className="h-10 w-16 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-2xl">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10">
                <Download className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>Download your past invoices</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{invoice.amount}</span>
                  <Badge variant="outline" className="rounded-full">
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="rounded-2xl">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

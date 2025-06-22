"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Download, Star, Zap, Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

interface BillingData {
  plan: {
    name: string
    price: number
    period: string
    features: string[]
    status: string
    nextBillingDate: string
  }
  usage: {
    assessments: { used: number; limit: number | string }
    participants: { used: number; limit: number }
    emails: { used: number; limit: number }
    storage: { used: number; limit: number }
  }
  paymentMethod: {
    type: string
    last4: string
    expiryMonth: string
    expiryYear: string
  }
  invoices: Array<{
    id: string
    date: string
    amount: number
    status: string
    downloadUrl?: string
  }>
}

export function BillingSettings() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [billingData, setBillingData] = useState<BillingData | null>(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = Cookies.get("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${API_URL}/billing`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // If billing endpoint doesn't exist yet, use mock data
          setBillingData(getMockBillingData())
          return
        }
        throw new Error('Failed to fetch billing data')
      }

      const data = await response.json()
      setBillingData(data)
    } catch (error) {
      console.error("Error fetching billing data:", error)
      setError(error instanceof Error ? error.message : "Failed to load billing data")
      // Fallback to mock data
      setBillingData(getMockBillingData())
    } finally {
      setLoading(false)
    }
  }

  const getMockBillingData = (): BillingData => ({
    plan: {
      name: "Free",
      price: 0,
      period: "month",
      features: ["5 Assessments", "50 Participants", "Email Support", "Basic Analytics"],
      status: "active",
      nextBillingDate: "N/A"
    },
    usage: {
      assessments: { used: 2, limit: 5 },
      participants: { used: 15, limit: 50 },
      emails: { used: 45, limit: 100 },
      storage: { used: 0.5, limit: 1 }
    },
    paymentMethod: {
      type: "none",
      last4: "",
      expiryMonth: "",
      expiryYear: ""
    },
    invoices: []
  })

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        toast.error("Authentication required")
        return
      }

      const response = await fetch(`${API_URL}/billing/invoices/${invoiceId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Invoice downloaded successfully")
    } catch (error) {
      console.error("Error downloading invoice:", error)
      toast.error("Failed to download invoice")
    }
  }

  const handleUpgradePlan = () => {
    toast.info("Plan upgrade feature coming soon!")
  }

  const handleCancelSubscription = () => {
    toast.info("Subscription cancellation feature coming soon!")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading billing information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !billingData) {
    return (
      <div className="space-y-6">
        <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchBillingData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!billingData) {
    return null
  }

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
            <Badge className="rounded-full bg-green-500/10 text-green-500 border-green-500/20">
              {billingData.plan.status === 'active' ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20">
            <div>
              <h3 className="text-2xl font-bold">{billingData.plan.name}</h3>
              <p className="text-muted-foreground">
                {billingData.plan.price === 0 ? 'Free' : `$${billingData.plan.price}`}/{billingData.plan.period}
                {billingData.plan.nextBillingDate !== 'N/A' && ` • Next billing: ${billingData.plan.nextBillingDate}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-500">
                {billingData.plan.price === 0 ? 'Free' : `$${billingData.plan.price}`}
              </div>
              <div className="text-sm text-muted-foreground">per {billingData.plan.period}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {billingData.plan.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-xl bg-accent/30">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl" onClick={handleUpgradePlan}>
              Upgrade Plan
            </Button>
            {billingData.plan.price > 0 && (
              <Button 
                variant="outline" 
                className="rounded-2xl text-red-500 border-red-500/20 hover:bg-red-500/10"
                onClick={handleCancelSubscription}
              >
                Cancel Subscription
              </Button>
            )}
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
                  {billingData.usage.assessments.used} / {billingData.usage.assessments.limit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-accent">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ 
                    width: typeof billingData.usage.assessments.limit === 'number' 
                      ? `${(billingData.usage.assessments.used / billingData.usage.assessments.limit) * 100}%`
                      : '100%'
                  }} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Participants</span>
                <span>
                  {billingData.usage.participants.used} / {billingData.usage.participants.limit}
                </span>
              </div>
              <Progress value={(billingData.usage.participants.used / billingData.usage.participants.limit) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Emails Sent</span>
                <span>
                  {billingData.usage.emails.used} / {billingData.usage.emails.limit}
                </span>
              </div>
              <Progress value={(billingData.usage.emails.used / billingData.usage.emails.limit) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Storage Used</span>
                <span>
                  {billingData.usage.storage.used}GB / {billingData.usage.storage.limit}GB
                </span>
              </div>
              <Progress value={(billingData.usage.storage.used / billingData.usage.storage.limit) * 100} className="h-2" />
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
          {billingData.paymentMethod.type !== 'none' ? (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-16 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{billingData.paymentMethod.type.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• {billingData.paymentMethod.last4}</p>
                  <p className="text-sm text-muted-foreground">
                    Expires {billingData.paymentMethod.expiryMonth}/{billingData.paymentMethod.expiryYear}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-2xl">
                Update
              </Button>
            </div>
          ) : (
            <div className="text-center p-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No payment method added</p>
              <Button variant="outline" className="rounded-2xl">
                Add Payment Method
              </Button>
            </div>
          )}
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
          {billingData.invoices.length > 0 ? (
            <div className="space-y-3">
              {billingData.invoices.map((invoice) => (
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
                    <span className="font-medium">${invoice.amount.toFixed(2)}</span>
                    <Badge variant="outline" className="rounded-full">
                      {invoice.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-2xl"
                      onClick={() => handleDownloadInvoice(invoice.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

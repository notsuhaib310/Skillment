"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Reports & Results
        </h1>
        <p className="text-muted-foreground">View detailed analytics and generate reports</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle>Assessment Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Generate detailed assessment performance reports</p>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle>Participant Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Analyze participant performance and engagement</p>
          </CardContent>
        </Card>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle>Custom Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Create custom reports with advanced filters</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

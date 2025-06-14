"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Building2 } from "lucide-react"

export function OrganizationSettings() {
  const [orgData, setOrgData] = useState({
    name: "Skillment Technologies",
    subdomain: "skillment",
    theme: "modern",
    emailSignature: "Best regards,\nSkillment Team\nhttps://skillment.com",
  })

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/40 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl primary-gradient">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Manage your organization information and branding</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input
                id="org-name"
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  value={orgData.subdomain}
                  onChange={(e) => setOrgData({ ...orgData, subdomain: e.target.value })}
                  className="rounded-2xl"
                />
                <span className="text-sm text-muted-foreground">.skillment.com</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Organization Logo</Label>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent border-2 border-dashed border-border">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="rounded-2xl">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB. Recommended: 200x200px</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Default Assessment Theme</Label>
            <Select value={orgData.theme} onValueChange={(value) => setOrgData({ ...orgData, theme: value })}>
              <SelectTrigger className="rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern (Default)</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-signature">Email Signature</Label>
            <Textarea
              id="email-signature"
              value={orgData.emailSignature}
              onChange={(e) => setOrgData({ ...orgData, emailSignature: e.target.value })}
              className="rounded-2xl min-h-[100px]"
              placeholder="Enter your default email signature..."
            />
          </div>

          <div className="flex justify-end">
            <Button className="rounded-2xl primary-gradient">Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

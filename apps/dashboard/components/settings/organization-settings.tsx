"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Building2 } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

interface Organization {
  id: string
  name: string
  type: string
  size: string
  logo?: string
}

export function OrganizationSettings() {
  const [loading, setLoading] = useState(false)
  const [orgData, setOrgData] = useState<Organization>({
    id: "",
    name: "",
    type: "", // Add default type
    size: "", // Add default size
    logo: ""
  })

  useEffect(() => {
    const token = Cookies.get("token")
    if (!token) return

    // Get user info from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const userData = JSON.parse(userStr)
        // Set initial org name from user data
        setOrgData(prev => ({ ...prev, name: userData.orgName }))
        // Fetch organization details immediately after setting org name
        fetchOrganizationDetails()
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")

  useEffect(() => {
    const token = Cookies.get("token")
    if (!token) return

    if (orgData.name) {
      fetchOrganizationDetails()
    }
  }, [orgData.name])

  const fetchOrganizationDetails = async () => {
    try {
      const token = Cookies.get("token")
      if (!token) return

      // Get organization name from state
      const orgName = orgData.name
      if (!orgName) return
      
      const response = await fetch(`${API_URL}/organizations/${orgName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch organization details")
      }

      const data = await response.json()
      setOrgData(data)
      if (data.logo) {
        setLogoPreview(data.logo)
      }
    } catch (error) {
      console.error("Error fetching organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to fetch organization details")
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo file size should be less than 2MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = Cookies.get("token")
      if (!token) throw new Error("Not authenticated")

      // Get the current organization name from the URL or state
      const currentOrgName = orgData.name;
      if (!currentOrgName) throw new Error("Current organization name not found")

      // Validate required fields
      if (!orgData.name.trim()) {
        throw new Error("Organization name is required")
      }
      if (!orgData.type.trim()) {
        throw new Error("Organization type is required")
      }
      if (!orgData.size.trim()) {
        throw new Error("Organization size is required")
      }

      // Update organization details - use the current org name in the URL
      const response = await fetch(`${API_URL}/organizations/${currentOrgName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: orgData.name.trim(),
          type: orgData.type.trim(),
          size: orgData.size.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update organization details")
      }

      const updatedOrg = await response.json()
      
      // Update the organization data with the response
      setOrgData(prev => ({
        ...prev,
        ...updatedOrg,
        // Make sure we use the name from the response in case it was normalized
        name: updatedOrg.name || prev.name,
      }))

      // Upload logo if changed - use the updated organization name from the response
      if (logoFile) {
        const formData = new FormData()
        formData.append("logo", logoFile)

        const logoResponse = await fetch(`${API_URL}/organizations/${updatedOrg.name || currentOrgName}/logo`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!logoResponse.ok) {
          const errorData = await logoResponse.json()
          throw new Error(errorData.error || "Failed to upload logo")
        }
        
        // Update the logo preview with the new URL
        const logoData = await logoResponse.json()
        if (logoData.logo) {
          setLogoPreview(logoData.logo)
        }
      }

      toast.success("Organization details updated successfully")
      
      // Refresh the organization data after successful update
      // Use the updated name if it was changed
      const newOrgName = updatedOrg.name || currentOrgName
      setOrgData(prev => ({ ...prev, name: newOrgName }))
      fetchOrganizationDetails()
    } catch (error) {
      console.error("Error updating organization:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update organization details")
    } finally {
      setLoading(false)
    }
  }

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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={orgData.name}
                    disabled
                    className="rounded-2xl"
                  />
                  <span className="text-sm text-muted-foreground">.skillment.in</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Organization Logo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent border-2 border-dashed border-border overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Organization logo" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <Button type="button" variant="outline" className="rounded-2xl" onClick={() => document.getElementById("logo-upload")?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB. Recommended: 200x200px</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Organization Type</Label>
              <Select value={orgData.type} onValueChange={(value) => setOrgData({ ...orgData, type: value })}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="educational">Educational Institution</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="nonprofit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Organization Size</Label>
              <Select value={orgData.size} onValueChange={(value) => setOrgData({ ...orgData, size: value })}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-500">201-500 employees</SelectItem>
                  <SelectItem value="501+">501+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="rounded-2xl primary-gradient" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

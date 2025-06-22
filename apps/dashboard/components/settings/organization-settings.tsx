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
    type: "",
    size: "",
    logo: ""
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")

  // Debug: Log state changes
  useEffect(() => {
    console.log('Organization data state changed:', orgData)
  }, [orgData])

  // Extract organization from subdomain
  const getOrganizationFromSubdomain = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = hostname.split('.')[0]
      console.log('Subdomain extraction:', { hostname, subdomain })
      // For development, allow localhost subdomains
      if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
        return subdomain
      }
    }
    return null
  }

  useEffect(() => {
    const token = Cookies.get("token")
    if (!token) return

    // Get organization name from subdomain
    const organization = getOrganizationFromSubdomain()
    if (organization) {
      console.log('Organization from subdomain:', organization)
      setOrgData(prev => ({ ...prev, name: organization }))
      // Fetch organization details immediately
      fetchOrganizationDetails(organization)
    } else {
      console.error('No organization found in subdomain')
      toast.error("Unable to determine organization from subdomain")
    }
  }, [])

  const fetchOrganizationDetails = async (orgName?: string) => {
    try {
      const token = Cookies.get("token")
      if (!token) return

      // Use provided orgName or get from state
      const organizationName = orgName || orgData.name
      if (!organizationName) {
        console.error('No organization name available for fetching details')
        return
      }
      
      console.log('Fetching organization details for:', organizationName)
      
      const response = await fetch(`${API_URL}/organizations/${organizationName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || "Failed to fetch organization details")
      }

      const data = await response.json()
      console.log('Organization data received:', data)
      console.log('Organization type:', data.type)
      console.log('Organization size:', data.size)
      console.log('Full organization object:', JSON.stringify(data, null, 2))
      
      // Ensure all values are strings to prevent controlled/uncontrolled input issues
      const updatedOrgData = {
        id: data.id || "",
        name: data.name || organizationName,
        type: data.type || "",
        size: data.size || "",
        logo: data.logo || ""
      }
      
      console.log('Setting org data to:', updatedOrgData)
      setOrgData(updatedOrgData)
      
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
      
      // Update the organization data with the response, ensuring all values are strings
      setOrgData({
        id: updatedOrg.id || "",
        name: updatedOrg.name || currentOrgName,
        type: updatedOrg.type || "",
        size: updatedOrg.size || "",
        logo: updatedOrg.logo || ""
      })

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
        
        const logoData = await logoResponse.json()
        const currentOrg = JSON.parse(localStorage.getItem('organization') || '{}')
        const updatedOrgData = {
          ...currentOrg,
          logo: logoData.logo,
          name: currentOrg.name || orgData.name
        }
        
        // Update localStorage with the complete organization data
        localStorage.setItem('organization', JSON.stringify(updatedOrgData))
        
        // Dispatch storage event to update the header
        const storageEvent = new StorageEvent('storage', {
          key: 'organization',
          newValue: JSON.stringify(updatedOrgData)
        })
        window.dispatchEvent(storageEvent)
        
        // Update local state with the logo
        setOrgData(prev => ({
          ...prev,
          logo: logoData.logo || ""
        }))
        
        setLogoPreview(logoData.logo)
        toast.success("Logo uploaded successfully")
      }

      toast.success("Organization details updated successfully")
      
      // Refresh the organization data
      fetchOrganizationDetails(updatedOrg.name || currentOrgName)
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
                  value={orgData.name || ""}
                  onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    value={orgData.name || ""}
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
              <Select value={orgData.type || ""} onValueChange={(value) => setOrgData({ ...orgData, type: value })}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="educational">Educational Institution</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                  <SelectItem value="nonprofit">Non-Profit</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Debug: Type value = "{orgData.type}"</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Organization Size</Label>
              <Select value={orgData.size || ""} onValueChange={(value) => setOrgData({ ...orgData, size: value })}>
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
              <p className="text-xs text-muted-foreground">Debug: Size value = "{orgData.size}"</p>
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

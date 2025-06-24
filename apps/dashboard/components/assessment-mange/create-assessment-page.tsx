"use client"

import { ArrowLeft, Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.skillment.in/api"

interface CreateAssessmentPageProps {
  onBack: () => void
}

export function CreateAssessmentPage({ onBack }: CreateAssessmentPageProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mcq",
    duration: 60,
    attemptLimit: 1,
    showResults: true,
    enableProctoring: false,
    randomizeQuestions: false,
    randomizeOptions: false,
    allowBackNavigation: true,
    timeWarnings: true,
    autoSubmit: true,
    tags: [] as string[],
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for the assessment",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          questions: [], // Empty questions array for now
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create assessment")
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: "Assessment created successfully",
      })
      onBack()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create assessment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Create New Assessment
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Basic Details */}
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Frontend Developer Test"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the assessment"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="rounded-2xl h-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Assessment Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="coding">Coding</SelectItem>
                  <SelectItem value="proctored">Proctored</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", parseInt(e.target.value))}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attemptLimit">Attempt Limit</Label>
              <Input
                id="attemptLimit"
                type="number"
                min="1"
                value={formData.attemptLimit}
                onChange={(e) => handleInputChange("attemptLimit", parseInt(e.target.value))}
                className="rounded-2xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Results</Label>
                <p className="text-sm text-muted-foreground">Allow candidates to see their results</p>
              </div>
              <Switch
                checked={formData.showResults}
                onCheckedChange={(checked) => handleInputChange("showResults", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Proctoring</Label>
                <p className="text-sm text-muted-foreground">Monitor candidates during assessment</p>
              </div>
              <Switch
                checked={formData.enableProctoring}
                onCheckedChange={(checked) => handleInputChange("enableProctoring", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Randomize Questions</Label>
                <p className="text-sm text-muted-foreground">Shuffle question order</p>
              </div>
              <Switch
                checked={formData.randomizeQuestions}
                onCheckedChange={(checked) => handleInputChange("randomizeQuestions", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Randomize Options</Label>
                <p className="text-sm text-muted-foreground">Shuffle answer options</p>
              </div>
              <Switch
                checked={formData.randomizeOptions}
                onCheckedChange={(checked) => handleInputChange("randomizeOptions", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Back Navigation</Label>
                <p className="text-sm text-muted-foreground">Let candidates go back to previous questions</p>
              </div>
              <Switch
                checked={formData.allowBackNavigation}
                onCheckedChange={(checked) => handleInputChange("allowBackNavigation", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Time Warnings</Label>
                <p className="text-sm text-muted-foreground">Show time remaining warnings</p>
              </div>
              <Switch
                checked={formData.timeWarnings}
                onCheckedChange={(checked) => handleInputChange("timeWarnings", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Submit</Label>
                <p className="text-sm text-muted-foreground">Automatically submit when time expires</p>
              </div>
              <Switch
                checked={formData.autoSubmit}
                onCheckedChange={(checked) => handleInputChange("autoSubmit", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onBack} className="rounded-2xl">
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          disabled={!formData.title.trim() || loading} 
          className="rounded-2xl primary-gradient glow-primary"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

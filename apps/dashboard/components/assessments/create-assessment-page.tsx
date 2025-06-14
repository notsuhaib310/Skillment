"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight, Save, Eye, Play, Plus, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { AssessmentTypeSelector } from "./assessment-type-selector"
import { ProctoringConfiguration } from "./proctoring-configuration"
import { CodingQuestionBuilder } from "./coding-question-builder"
import { MCQQuestionBuilder } from "./mcq-question-builder"
import { AIToolsPanel } from "./ai-tools-panel"

interface CreateAssessmentPageProps {
  onBack: () => void
}

export function CreateAssessmentPage({ onBack }: CreateAssessmentPageProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration: 60,
    tags: [] as string[],
    totalMarks: 100,
    passingMarks: 60,
    attemptLimit: 1,
    showResults: true,
    showCorrectAnswers: false,
    enableProctoring: false,
    randomizeQuestions: false,
    randomizeOptions: false,
    allowBackNavigation: true,
    timeWarnings: true,
    autoSubmit: true,
  })
  const [questions, setQuestions] = useState<any[]>([])
  const [proctoringConfig, setProctoringConfig] = useState({
    webcamMonitoring: false,
    screenRecording: false,
    tabSwitchDetection: false,
    copyPasteDetection: false,
    rightClickDisable: false,
    fullscreenMode: false,
    idVerification: false,
    environmentCheck: false,
    suspiciousActivityThreshold: 3,
    warningBeforeFlagging: true,
  })

  const steps = [
    { id: 1, title: "Assessment Type", description: "Choose the type of assessment" },
    { id: 2, title: "Basic Configuration", description: "Set up basic assessment details" },
    { id: 3, title: "Advanced Settings", description: "Configure advanced options" },
    { id: 4, title: "Proctoring Setup", description: "Configure monitoring options" },
    { id: 5, title: "Questions", description: "Add and manage questions" },
    { id: 6, title: "AI Tools", description: "Enhance with AI features" },
    { id: 7, title: "Preview & Publish", description: "Review and publish" },
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = () => {
    // Save as draft logic
    console.log("Saving as draft...")
  }

  const handlePublish = () => {
    // Publish logic
    console.log("Publishing assessment...")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <AssessmentTypeSelector selectedType={selectedType} onTypeSelect={setSelectedType} />

      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Basic Configuration</h2>
              <p className="text-muted-foreground">Set up the fundamental details of your assessment</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle>Assessment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assessment Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Frontend Developer Assessment"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the assessment"
                      className="rounded-2xl"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions for Candidates</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="Detailed instructions for candidates..."
                      className="rounded-2xl"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="React, JavaScript, Frontend (comma separated)"
                      className="rounded-2xl"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle>Assessment Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="attemptLimit">Attempt Limit</Label>
                      <Input
                        id="attemptLimit"
                        type="number"
                        value={formData.attemptLimit}
                        onChange={(e) => setFormData({ ...formData, attemptLimit: Number.parseInt(e.target.value) })}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="totalMarks">Total Marks</Label>
                      <Input
                        id="totalMarks"
                        type="number"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({ ...formData, totalMarks: Number.parseInt(e.target.value) })}
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingMarks">Passing Marks</Label>
                      <Input
                        id="passingMarks"
                        type="number"
                        value={formData.passingMarks}
                        onChange={(e) => setFormData({ ...formData, passingMarks: Number.parseInt(e.target.value) })}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Result Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Results to Candidates</Label>
                          <p className="text-sm text-muted-foreground">Display scores after completion</p>
                        </div>
                        <Switch
                          checked={formData.showResults}
                          onCheckedChange={(checked) => setFormData({ ...formData, showResults: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Show Correct Answers</Label>
                          <p className="text-sm text-muted-foreground">Display correct answers after submission</p>
                        </div>
                        <Switch
                          checked={formData.showCorrectAnswers}
                          onCheckedChange={(checked) => setFormData({ ...formData, showCorrectAnswers: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Advanced Settings</h2>
              <p className="text-muted-foreground">Configure advanced behavior and security options</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle>Question Behavior</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Randomize Questions</Label>
                      <p className="text-sm text-muted-foreground">Shuffle question order for each candidate</p>
                    </div>
                    <Switch
                      checked={formData.randomizeQuestions}
                      onCheckedChange={(checked) => setFormData({ ...formData, randomizeQuestions: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Randomize Options</Label>
                      <p className="text-sm text-muted-foreground">Shuffle MCQ options for each question</p>
                    </div>
                    <Switch
                      checked={formData.randomizeOptions}
                      onCheckedChange={(checked) => setFormData({ ...formData, randomizeOptions: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Back Navigation</Label>
                      <p className="text-sm text-muted-foreground">Let candidates go back to previous questions</p>
                    </div>
                    <Switch
                      checked={formData.allowBackNavigation}
                      onCheckedChange={(checked) => setFormData({ ...formData, allowBackNavigation: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                <CardHeader>
                  <CardTitle>Time Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Time Warnings</Label>
                      <p className="text-sm text-muted-foreground">Show warnings when time is running out</p>
                    </div>
                    <Switch
                      checked={formData.timeWarnings}
                      onCheckedChange={(checked) => setFormData({ ...formData, timeWarnings: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Submit</Label>
                      <p className="text-sm text-muted-foreground">Automatically submit when time expires</p>
                    </div>
                    <Switch
                      checked={formData.autoSubmit}
                      onCheckedChange={(checked) => setFormData({ ...formData, autoSubmit: checked })}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Warning Times (minutes before end)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[30, 15, 5].map((time) => (
                        <div key={time} className="flex items-center space-x-2">
                          <Checkbox id={`warning-${time}`} />
                          <Label htmlFor={`warning-${time}`} className="text-sm">
                            {time}m
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 4:
        return (
          <ProctoringConfiguration
            config={proctoringConfig}
            onConfigChange={setProctoringConfig}
            enabled={formData.enableProctoring}
            onEnabledChange={(enabled) => setFormData({ ...formData, enableProctoring: enabled })}
          />
        )

      case 5:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Questions</h2>
                <p className="text-muted-foreground">Add and manage your assessment questions</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-2xl">
                  <Copy className="mr-2 h-4 w-4" />
                  Import from Bank
                </Button>
                <Button className="rounded-2xl primary-gradient glow-primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </div>

            <Tabs defaultValue={selectedType === "coding" ? "coding" : "mcq"} className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50 p-1">
                <TabsTrigger value="mcq" className="rounded-xl">
                  MCQ Questions
                </TabsTrigger>
                <TabsTrigger value="coding" className="rounded-xl">
                  Coding Questions
                </TabsTrigger>
                <TabsTrigger value="upload" className="rounded-xl">
                  Bulk Upload
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mcq" className="space-y-6">
                <MCQQuestionBuilder />
              </TabsContent>

              <TabsContent value="coding" className="space-y-6">
                <CodingQuestionBuilder />
              </TabsContent>

              <TabsContent value="upload" className="space-y-6">
                <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-accent/50 mx-auto flex items-center justify-center">
                      <Plus className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Bulk Upload Questions</h3>
                      <p className="text-muted-foreground mt-2">Upload questions from CSV, Excel, or JSON files</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button variant="outline" className="rounded-2xl">
                        Download Template
                      </Button>
                      <Button className="rounded-2xl primary-gradient">Choose File</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )

      case 6:
        return <AIToolsPanel selectedType={selectedType} />

      case 7:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Preview & Publish</h2>
              <p className="text-muted-foreground">Review your assessment before publishing</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl primary-gradient flex items-center justify-center">
                        <Eye className="h-5 w-5 text-primary-foreground" />
                      </div>
                      {formData.title || "Untitled Assessment"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground">{formData.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-2xl bg-accent/30">
                        <div className="text-2xl font-bold text-foreground">{formData.duration}</div>
                        <div className="text-sm text-muted-foreground">Minutes</div>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-accent/30">
                        <div className="text-2xl font-bold text-foreground">{formData.totalMarks}</div>
                        <div className="text-sm text-muted-foreground">Total Marks</div>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-accent/30">
                        <div className="text-2xl font-bold text-foreground">{formData.attemptLimit}</div>
                        <div className="text-sm text-muted-foreground">Attempts</div>
                      </div>
                      <div className="text-center p-4 rounded-2xl bg-accent/30">
                        <div className="text-2xl font-bold text-foreground">{questions.length}</div>
                        <div className="text-sm text-muted-foreground">Questions</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground">Enabled Features</h4>
                      <div className="flex flex-wrap gap-2">
                        {formData.showResults && (
                          <Badge className="rounded-xl bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            Show Results
                          </Badge>
                        )}
                        {formData.enableProctoring && (
                          <Badge className="rounded-xl bg-red-500/20 text-red-400 border-red-500/30">Proctored</Badge>
                        )}
                        {formData.randomizeQuestions && (
                          <Badge className="rounded-xl bg-blue-500/20 text-blue-400 border-blue-500/30">
                            Randomized
                          </Badge>
                        )}
                        {formData.timeWarnings && (
                          <Badge className="rounded-xl bg-amber-500/20 text-amber-400 border-amber-500/30">
                            Time Warnings
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
                  <CardHeader>
                    <CardTitle>Publish Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Availability</Label>
                      <Select defaultValue="immediate">
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="immediate">Publish Immediately</SelectItem>
                          <SelectItem value="scheduled">Schedule for Later</SelectItem>
                          <SelectItem value="draft">Save as Draft</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Access Control</Label>
                      <Select defaultValue="invite">
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          <SelectItem value="invite">Invite Only</SelectItem>
                          <SelectItem value="public">Public Link</SelectItem>
                          <SelectItem value="password">Password Protected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Button onClick={handlePublish} className="w-full rounded-2xl primary-gradient glow-primary">
                        <Play className="mr-2 h-4 w-4" />
                        Publish Assessment
                      </Button>
                      <Button onClick={handleSaveDraft} variant="outline" className="w-full rounded-2xl">
                        <Save className="mr-2 h-4 w-4" />
                        Save as Draft
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Assessment</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleSaveDraft} className="rounded-2xl">
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step.id === currentStep
                      ? "primary-gradient text-primary-foreground glow-primary"
                      : step.id < currentStep
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-all ${
                      step.id < currentStep ? "bg-emerald-500" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">{renderStepContent()}</div>
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 border-t border-border/40 bg-background/80 backdrop-blur-xl p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="rounded-2xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
            {currentStep} of {steps.length} steps completed
          </div>

          {currentStep === steps.length ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft} className="rounded-2xl">
                Save as Draft
              </Button>
              <Button onClick={handlePublish} className="rounded-2xl primary-gradient glow-primary">
                <Play className="mr-2 h-4 w-4" />
                Publish Assessment
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleNext}
              disabled={currentStep === 1 && !selectedType}
              className="rounded-2xl primary-gradient glow-primary"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

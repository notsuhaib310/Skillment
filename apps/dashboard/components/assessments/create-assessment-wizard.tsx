"use client"

import { useState } from "react"
import { X, ArrowLeft, ArrowRight, FileText, Code, Eye, Zap, Sparkles, Brain, Target, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast, toast } from "@/hooks/use-toast"
import { assessmentsApi } from "@/lib/api"

const assessmentTypes = [
  {
    id: "mcq",
    title: "MCQ-Based",
    description: "Multiple choice questions with instant scoring",
    icon: FileText,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "coding",
    title: "Coding Test",
    description: "Programming challenges with auto-evaluation",
    icon: Code,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "proctored",
    title: "Proctored Exam",
    description: "Monitored assessment with anti-cheating",
    icon: Eye,
    color: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  {
    id: "hybrid",
    title: "Hybrid Test",
    description: "Combination of multiple assessment types",
    icon: Zap,
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
]

interface CreateAssessmentWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAssessmentWizard({ open, onOpenChange }: CreateAssessmentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    tags: [] as string[],
    totalMarks: 100,
    attemptLimit: 1,
    showResults: true,
    enableProctoring: false,
    randomizeQuestions: false,
  })
  const [questions, setQuestions] = useState<any[]>([])
  const [aiFeatures, setAiFeatures] = useState({
    generateQuestions: false,
    generateTestCases: false,
    aiSummary: false,
    smartTagging: false,
    autoScoring: false,
  })
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setSelectedType("")
    setFormData({
      title: "",
      description: "",
      duration: 60,
      tags: [],
      totalMarks: 100,
      attemptLimit: 1,
      showResults: true,
      enableProctoring: false,
      randomizeQuestions: false,
    })
    setQuestions([])
    onOpenChange(false)
  }

  const handlePublish = async () => {
    setLoading(true);
    if (!formData.title || !selectedType || !formData.duration || !formData.totalMarks) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      const payload = {
        ...formData,
        type: selectedType,
        totalQuestions: questions.length,
        questions: questions,
        aiFeatures,
      };
      await assessmentsApi.create(payload);
      toast({
        title: "Assessment Published",
        description: "Your assessment has been published successfully.",
      });
      // Reset wizard and close
      setCurrentStep(1);
      setSelectedType("");
      setFormData({
        title: "",
        description: "",
        duration: 60,
        tags: [],
        totalMarks: 100,
        attemptLimit: 1,
        showResults: true,
        enableProctoring: false,
        randomizeQuestions: false,
      });
      setQuestions([]);
      setAiFeatures({
        generateQuestions: false,
        generateTestCases: false,
        aiSummary: false,
        smartTagging: false,
        autoScoring: false,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Error Publishing Assessment",
        description: err.message || "An error occurred while publishing.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Choose Assessment Type</h3>
              <p className="text-sm text-muted-foreground">Select the type of assessment you want to create</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessmentTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedType === type.id
                      ? "ring-2 ring-primary shadow-lg glow-primary"
                      : "card-gradient border-border/40"
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center ${type.color}`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{type.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Test Configuration</h3>
              <p className="text-sm text-muted-foreground">Configure your assessment settings</p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter assessment title"
                    className="rounded-2xl"
                  />
                </div>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your assessment"
                  className="rounded-2xl"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Results to Candidates</Label>
                    <p className="text-sm text-muted-foreground">Allow candidates to see their scores</p>
                  </div>
                  <Switch
                    checked={formData.showResults}
                    onCheckedChange={(checked) => setFormData({ ...formData, showResults: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Proctoring</Label>
                    <p className="text-sm text-muted-foreground">Monitor candidates during the test</p>
                  </div>
                  <Switch
                    checked={formData.enableProctoring}
                    onCheckedChange={(checked) => setFormData({ ...formData, enableProctoring: checked })}
                  />
                </div>
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
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Add Questions</h3>
              <p className="text-sm text-muted-foreground">Create questions for your {selectedType} assessment</p>
            </div>
            <Tabs defaultValue="mcq" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-2xl">
                <TabsTrigger value="mcq" className="rounded-xl">
                  MCQ
                </TabsTrigger>
                <TabsTrigger value="coding" className="rounded-xl">
                  Coding
                </TabsTrigger>
                <TabsTrigger value="upload" className="rounded-xl">
                  Upload
                </TabsTrigger>
              </TabsList>
              <TabsContent value="mcq" className="space-y-4">
                <Card className="card-gradient rounded-3xl border-border/40">
                  <CardHeader>
                    <CardTitle className="text-sm">MCQ Question</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea placeholder="Enter your question" className="rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {["A", "B", "C", "D"].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroup>
                              <RadioGroupItem value={option} id={option} />
                            </RadioGroup>
                            <Input placeholder={`Option ${option}`} className="rounded-2xl" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Marks</Label>
                        <Input type="number" placeholder="5" className="rounded-2xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="coding" className="space-y-4">
                <Card className="card-gradient rounded-3xl border-border/40">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm">Coding Question</CardTitle>
                    <Button size="sm" className="rounded-2xl primary-gradient">
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Generate
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Problem Statement</Label>
                      <Textarea placeholder="Describe the coding problem" className="rounded-2xl" rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>Input Format</Label>
                      <Textarea placeholder="Describe input format" className="rounded-2xl" rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Sample Input/Output</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <Textarea placeholder="Sample input" className="rounded-2xl" />
                        <Textarea placeholder="Expected output" className="rounded-2xl" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Programming Language</Label>
                        <Select>
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Marks</Label>
                        <Input type="number" placeholder="20" className="rounded-2xl" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="upload" className="space-y-4">
                <Card className="card-gradient rounded-3xl border-border/40">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/50 mx-auto flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Upload Question Bank</h4>
                      <p className="text-sm text-muted-foreground mt-1">Upload a PDF or document with your questions</p>
                    </div>
                    <Button className="rounded-2xl">Choose File</Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">AI Tools Panel</h3>
              <p className="text-sm text-muted-foreground">Enhance your assessment with AI-powered features</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: "generateQuestions",
                  title: "Generate Questions",
                  description: "AI creates questions from topics",
                  icon: Brain,
                },
                {
                  key: "generateTestCases",
                  title: "Generate Test Cases",
                  description: "Auto-generate coding test cases",
                  icon: Target,
                },
                {
                  key: "aiSummary",
                  title: "AI Summary",
                  description: "Generate assessment summary",
                  icon: FileText,
                },
                {
                  key: "smartTagging",
                  title: "Smart Tagging",
                  description: "Automatically tag questions",
                  icon: Settings,
                },
                {
                  key: "autoScoring",
                  title: "Auto Scoring",
                  description: "AI-powered scoring suggestions",
                  icon: Sparkles,
                },
              ].map((feature) => (
                <Card
                  key={feature.key}
                  className={`cursor-pointer transition-all duration-200 ${
                    aiFeatures[feature.key as keyof typeof aiFeatures]
                      ? "ring-2 ring-primary shadow-lg glow-primary"
                      : "card-gradient border-border/40"
                  }`}
                  onClick={() =>
                    setAiFeatures({
                      ...aiFeatures,
                      [feature.key]: !aiFeatures[feature.key as keyof typeof aiFeatures],
                    })
                  }
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Switch
                        checked={aiFeatures[feature.key as keyof typeof aiFeatures]}
                        onCheckedChange={(checked) => setAiFeatures({ ...aiFeatures, [feature.key]: checked })}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-foreground">Preview & Publish</h3>
              <p className="text-sm text-muted-foreground">Review your assessment before publishing</p>
            </div>
            <Card className="card-gradient rounded-3xl border-border/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-primary/20 flex items-center justify-center">
                    {selectedType === "mcq" && <FileText className="h-4 w-4 text-primary" />}
                    {selectedType === "coding" && <Code className="h-4 w-4 text-primary" />}
                    {selectedType === "proctored" && <Eye className="h-4 w-4 text-primary" />}
                    {selectedType === "hybrid" && <Zap className="h-4 w-4 text-primary" />}
                  </div>
                  {formData.title || "Untitled Assessment"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{formData.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{formData.duration}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{formData.totalMarks}</div>
                    <div className="text-xs text-muted-foreground">Total Marks</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{formData.attemptLimit}</div>
                    <div className="text-xs text-muted-foreground">Attempts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">0</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">Settings</h4>
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
                      <Badge className="rounded-xl bg-blue-500/20 text-blue-400 border-blue-500/30">Randomized</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-border/40 bg-card/80 backdrop-blur-xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">Create New Assessment</DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-xl">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? "primary-gradient text-primary-foreground glow-primary"
                    : step < currentStep
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </div>
              {step < 5 && <div className={`w-8 h-0.5 mx-2 ${step < currentStep ? "bg-emerald-500" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border/40">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="rounded-2xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex gap-2">
            {currentStep === 5 ? (
              <>
                <Button variant="outline" onClick={handleClose} className="rounded-2xl">
                  Save as Draft
                </Button>
                <Button onClick={handlePublish} className="rounded-2xl primary-gradient glow-primary" disabled={loading}>
                  {loading ? "Publishing..." : (<><Sparkles className="mr-2 h-4 w-4" /> Publish Assessment</>)}
                </Button>
              </>
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
      </DialogContent>
    </Dialog>
  )
}

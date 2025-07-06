"use client"

import { Brain, Sparkles, Target, FileText, Zap, Code, Users, Wand2, Loader2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { aiQuestionGenerator } from "@/lib/ai-question-generator"
import { useState } from "react"

interface AIToolsPanelProps {
  selectedType: string
}

export function AIToolsPanel({ selectedType }: AIToolsPanelProps) {
  const [aiSettings, setAiSettings] = useState({
    autoGenerateExplanations: false,
    smartDifficultyBalancing: false,
    topicBasedClustering: false,
    realTimeAnalytics: false,
    predictiveScoring: false,
    behaviorAnalysis: false,
  })

  const [bulkGenerationDialog, setBulkGenerationDialog] = useState(false)
  const [bulkGenerationData, setBulkGenerationData] = useState({
    topics: "",
    questionCount: 10,
    difficulty: "mixed" as "easy" | "medium" | "hard" | "mixed",
    questionTypes: ["mcq"],
    language: "javascript",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationResults, setGenerationResults] = useState<any[]>([])
  const { toast } = useToast()

  const aiFeatures = [
    {
      id: "question-generation",
      title: "AI Question Generation",
      description: "Generate questions automatically from topics and learning objectives",
      icon: Brain,
      category: "content",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: false,
      enabled: true,
      action: () => setBulkGenerationDialog(true),
    },
    {
      id: "test-case-generation",
      title: "Test Case Generation",
      description: "Automatically create test cases for coding problems",
      icon: Code,
      category: "coding",
      supportedTypes: ["coding", "hybrid"],
      premium: false,
      enabled: selectedType === "coding" || selectedType === "hybrid",
      action: () => generateTestCases(),
    },
    {
      id: "difficulty-analysis",
      title: "Difficulty Analysis",
      description: "AI-powered difficulty assessment and balancing",
      icon: Target,
      category: "analysis",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: true,
      enabled: false,
      action: () => analyzeDifficulty(),
    },
    {
      id: "plagiarism-detection",
      title: "Plagiarism Detection",
      description: "Advanced AI-based code and text plagiarism detection",
      icon: FileText,
      category: "security",
      supportedTypes: ["coding", "proctored", "hybrid"],
      premium: true,
      enabled: false,
      action: () => detectPlagiarism(),
    },
    {
      id: "auto-grading",
      title: "Intelligent Auto-Grading",
      description: "AI-powered grading for subjective answers",
      icon: Sparkles,
      category: "grading",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: true,
      enabled: false,
      action: () => setupAutoGrading(),
    },
    {
      id: "candidate-insights",
      title: "Candidate Insights",
      description: "AI-generated insights about candidate performance",
      icon: Users,
      category: "analytics",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: true,
      enabled: false,
      action: () => generateInsights(),
    },
  ]

  const categories = [
    { id: "content", title: "Content Generation", icon: Brain },
    { id: "coding", title: "Coding Tools", icon: Code },
    { id: "analysis", title: "Analysis & Insights", icon: Target },
    { id: "security", title: "Security & Integrity", icon: FileText },
    { id: "grading", title: "Grading & Scoring", icon: Sparkles },
    { id: "analytics", title: "Analytics", icon: Users },
  ]

  const filteredFeatures = aiFeatures.filter((feature) => feature.supportedTypes.includes(selectedType))

  const groupedFeatures = categories
    .map((category) => ({
      ...category,
      features: filteredFeatures.filter((feature) => feature.category === category.id),
    }))
    .filter((category) => category.features.length > 0)

  const handleBulkGeneration = async () => {
    if (!bulkGenerationData.topics.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter topics for bulk generation.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const topics = bulkGenerationData.topics.split(",").map(t => t.trim()).filter(Boolean)
      const results = []

      for (const topic of topics) {
        const questionsPerTopic = Math.ceil(bulkGenerationData.questionCount / topics.length)
        
        for (const questionType of bulkGenerationData.questionTypes) {
          if (questionType === "mcq") {
            const questions = await aiQuestionGenerator.generateMCQQuestions({
              type: "mcq",
              topic,
              difficulty: bulkGenerationData.difficulty === "mixed" ? "medium" : bulkGenerationData.difficulty,
              count: questionsPerTopic,
            })
            results.push(...questions.map(q => ({ ...q, type: "mcq", topic })))
          } else if (questionType === "coding") {
            const questions = await aiQuestionGenerator.generateCodingQuestions({
              type: "coding",
              topic,
              difficulty: bulkGenerationData.difficulty === "mixed" ? "medium" : bulkGenerationData.difficulty,
              language: bulkGenerationData.language,
              count: questionsPerTopic,
            })
            results.push(...questions.map(q => ({ ...q, type: "coding", topic })))
          }
        }
      }

      setGenerationResults(results)
      toast({
        title: "Bulk Generation Complete",
        description: `Successfully generated ${results.length} questions across ${topics.length} topics.`,
      })
    } catch (error) {
      console.error("Bulk generation error:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateTestCases = async () => {
    toast({
      title: "Test Case Generation",
      description: "Use the 'AI Generate' button in the coding question builder to generate test cases.",
    })
  }

  const analyzeDifficulty = () => {
    toast({
      title: "Premium Feature",
      description: "Difficulty analysis is available in our premium plan.",
    })
  }

  const detectPlagiarism = () => {
    toast({
      title: "Premium Feature",
      description: "Plagiarism detection is available in our premium plan.",
    })
  }

  const setupAutoGrading = () => {
    toast({
      title: "Premium Feature",
      description: "Auto-grading is available in our premium plan.",
    })
  }

  const generateInsights = () => {
    toast({
      title: "Premium Feature",
      description: "Candidate insights are available in our premium plan.",
    })
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">AI Tools & Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enhance your {selectedType} assessment with powerful AI-driven features for better content creation, analysis,
          and candidate evaluation.
        </p>
      </div>

      {/* Quick Actions */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick AI Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={bulkGenerationDialog} onOpenChange={setBulkGenerationDialog}>
              <DialogTrigger asChild>
                <Button className="h-20 flex-col gap-2 rounded-2xl primary-gradient">
                  <Brain className="h-6 w-6" />
                  <span className="text-sm">Bulk Generate Questions</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Bulk Generate Questions with AI</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-topics">Topics (comma separated) *</Label>
                    <Textarea
                      id="bulk-topics"
                      value={bulkGenerationData.topics}
                      onChange={(e) => setBulkGenerationData({ ...bulkGenerationData, topics: e.target.value })}
                      placeholder="JavaScript, React, Node.js, Databases, Algorithms"
                      className="rounded-2xl"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Count</Label>
                      <Select
                        value={bulkGenerationData.questionCount.toString()}
                        onValueChange={(value) => setBulkGenerationData({ ...bulkGenerationData, questionCount: parseInt(value) })}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 Questions</SelectItem>
                          <SelectItem value="10">10 Questions</SelectItem>
                          <SelectItem value="15">15 Questions</SelectItem>
                          <SelectItem value="20">20 Questions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Select
                        value={bulkGenerationData.difficulty}
                        onValueChange={(value: any) => setBulkGenerationData({ ...bulkGenerationData, difficulty: value })}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Question Types</Label>
                    <div className="flex gap-2">
                      {["mcq", "coding"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={type}
                            checked={bulkGenerationData.questionTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkGenerationData({
                                  ...bulkGenerationData,
                                  questionTypes: [...bulkGenerationData.questionTypes, type],
                                })
                              } else {
                                setBulkGenerationData({
                                  ...bulkGenerationData,
                                  questionTypes: bulkGenerationData.questionTypes.filter(t => t !== type),
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={type} className="text-sm capitalize">
                            {type === "mcq" ? "MCQ" : "Coding"}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  {bulkGenerationData.questionTypes.includes("coding") && (
                    <div className="space-y-2">
                      <Label>Programming Language</Label>
                      <Select
                        value={bulkGenerationData.language}
                        onValueChange={(value) => setBulkGenerationData({ ...bulkGenerationData, language: value })}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button
                    onClick={handleBulkGeneration}
                    disabled={isGenerating}
                    className="w-full rounded-2xl primary-gradient"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Questions
                      </>
                    )}
                  </Button>

                  {generationResults.length > 0 && (
                    <div className="space-y-4 mt-4">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Generated Questions ({generationResults.length})</h4>
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Ready to Use
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Questions have been generated successfully. You can now use the individual question builders to add them to your assessment.
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={generateTestCases}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-border/40 hover:bg-accent/80"
            >
              <Code className="h-6 w-6" />
              <span className="text-sm">Generate Test Cases</span>
            </Button>

            <Button
              onClick={analyzeDifficulty}
              variant="outline"
              className="h-20 flex-col gap-2 rounded-2xl border-border/40 hover:bg-accent/80"
            >
              <Target className="h-6 w-6" />
              <span className="text-sm">Analyze Difficulty</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {groupedFeatures.map((category) => (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-primary/20 flex items-center justify-center">
                <category.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {category.features.map((feature) => (
                <Card key={feature.id} className="card-gradient rounded-3xl border-border/40 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-accent/50 flex items-center justify-center">
                          <feature.icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{feature.title}</CardTitle>
                          {feature.premium && (
                            <Badge className="mt-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Switch checked={feature.enabled} disabled={feature.premium} />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <Button
                      onClick={feature.action}
                      disabled={feature.premium}
                      variant={feature.enabled ? "default" : "outline"}
                      size="sm"
                      className="w-full rounded-xl"
                    >
                      {feature.premium ? "Upgrade to Use" : "Use Feature"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredFeatures.length === 0 && (
        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/50 mx-auto flex items-center justify-center">
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No AI Tools Available</h3>
              <p className="text-muted-foreground mt-2">
                AI tools will be available once you select an assessment type.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Content Generation Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Auto-generate explanations</span>
                  <Switch
                    checked={aiSettings.autoGenerateExplanations}
                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, autoGenerateExplanations: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Smart difficulty balancing</span>
                  <Switch
                    checked={aiSettings.smartDifficultyBalancing}
                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, smartDifficultyBalancing: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Topic-based question clustering</span>
                  <Switch
                    checked={aiSettings.topicBasedClustering}
                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, topicBasedClustering: checked })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Analysis & Insights</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Real-time performance analytics</span>
                  <Switch
                    checked={aiSettings.realTimeAnalytics}
                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, realTimeAnalytics: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Predictive scoring</span>
                  <Switch
                    checked={aiSettings.predictiveScoring}
                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, predictiveScoring: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Candidate behavior analysis</span>
                  <Switch
                    checked={aiSettings.behaviorAnalysis}
                    onCheckedChange={(checked) => setAiSettings({ ...aiSettings, behaviorAnalysis: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-purple/10 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">AI Credits</h4>
                <p className="text-sm text-muted-foreground">250 credits remaining this month</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-2xl">
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Brain, Sparkles, Target, FileText, Zap, Code, Users, Wand2, Loader2, CheckCircle, Settings, TrendingUp, Shield, BarChart, Lightbulb, Star, Plus } from "lucide-react"
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

  const coreFeatures = [
    {
      id: "bulk-generation",
      title: "Bulk Question Generation",
      description: "Generate multiple questions across different topics using AI",
      icon: Brain,
      status: "active",
      action: () => setBulkGenerationDialog(true),
    },
    {
      id: "smart-enhancement",
      title: "Smart Question Enhancement",
      description: "Automatically improve question quality with AI suggestions",
      icon: Lightbulb,
      status: "active",
      action: () => enhanceQuestions(),
    },
    {
      id: "difficulty-balancing",
      title: "Difficulty Balancing",
      description: "AI-powered analysis and balancing of question difficulty",
      icon: Target,
      status: "active",
      action: () => balanceDifficulty(),
    },
    {
      id: "test-case-generator",
      title: "Smart Test Case Generation",
      description: "Generate comprehensive test cases for coding problems",
      icon: Code,
      status: "active",
      action: () => generateTestCases(),
    },
  ]

  const premiumFeatures = [
    {
      id: "plagiarism-detection",
      title: "AI Plagiarism Detection",
      description: "Advanced detection of copied code and answers",
      icon: Shield,
      status: "premium",
      category: "Security",
    },
    {
      id: "candidate-insights",
      title: "Candidate Behavior Analysis",
      description: "AI insights into candidate performance patterns",
      icon: Users,
      status: "premium",
      category: "Analytics",
    },
    {
      id: "auto-grading",
      title: "Intelligent Auto-Grading",
      description: "AI-powered grading for subjective answers",
      icon: Star,
      status: "premium",
      category: "Evaluation",
    },
    {
      id: "predictive-scoring",
      title: "Predictive Scoring",
      description: "Predict candidate performance before completion",
      icon: TrendingUp,
      status: "premium",
      category: "Analytics",
    },
  ]

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

  const enhanceQuestions = () => {
    toast({
      title: "Question Enhancement",
      description: "Use the AI Enhancement features in the individual question builders.",
    })
  }

  const balanceDifficulty = () => {
    toast({
      title: "Difficulty Balancing",
      description: "This feature will analyze and balance question difficulty across your assessment.",
    })
  }

  const generateTestCases = () => {
    toast({
      title: "Test Case Generation",
      description: "Use the 'AI Generate' button in the coding question builder to generate test cases.",
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl primary-gradient mx-auto flex items-center justify-center glow-primary">
          <Brain className="h-8 w-8 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-foreground">AI-Powered Assessment Tools</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Enhance your {selectedType} assessment with cutting-edge AI features for smarter content creation, 
            analysis, and candidate evaluation.
          </p>
        </div>
      </div>

      {/* Core AI Features */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Core AI Features</h3>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Active</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreFeatures.map((feature) => (
            <Card key={feature.id} className="card-gradient rounded-3xl border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <Badge variant="outline" className="mt-1 rounded-xl">Ready to Use</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <Button
                  onClick={feature.action}
                  className="w-full rounded-2xl primary-gradient glow-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Use This Feature
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bulk Generation Dialog */}
      <Dialog open={bulkGenerationDialog} onOpenChange={setBulkGenerationDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Bulk Question Generation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
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
                <Label>Total Questions</Label>
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
                    <SelectItem value="30">30 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulty Mix</Label>
                <Select
                  value={bulkGenerationData.difficulty}
                  onValueChange={(value: any) => setBulkGenerationData({ ...bulkGenerationData, difficulty: value })}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy Only</SelectItem>
                    <SelectItem value="medium">Medium Only</SelectItem>
                    <SelectItem value="hard">Hard Only</SelectItem>
                    <SelectItem value="mixed">Mixed Difficulty</SelectItem>
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
                      {type === "mcq" ? "MCQ Questions" : "Coding Problems"}
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
                  <h4 className="font-medium">Generation Complete!</h4>
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {generationResults.length} Questions
                  </Badge>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Questions have been generated successfully! Use the individual question builders 
                    to review and add them to your assessment.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Features */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Premium AI Features</h3>
          <Badge className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30">
            Pro
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {premiumFeatures.map((feature) => (
            <Card key={feature.id} className="card-gradient rounded-3xl border-border/40 shadow-xl relative overflow-hidden">
              {/* Premium overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 pointer-events-none" />
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                      <Badge className="mt-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30">
                        {feature.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="rounded-xl border-amber-500/30 text-amber-400">
                    Premium
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Upgrade to Access
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Configuration */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-2xl bg-blue-500/20 flex items-center justify-center">
            <Settings className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">AI Configuration</h3>
        </div>

        <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Automatic AI Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Content Generation</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Auto-generate explanations</span>
                      <p className="text-xs text-muted-foreground">Automatically add AI explanations to questions</p>
                    </div>
                    <Switch
                      checked={aiSettings.autoGenerateExplanations}
                      onCheckedChange={(checked) => setAiSettings({ ...aiSettings, autoGenerateExplanations: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Smart difficulty balancing</span>
                      <p className="text-xs text-muted-foreground">Maintain balanced difficulty distribution</p>
                    </div>
                    <Switch
                      checked={aiSettings.smartDifficultyBalancing}
                      onCheckedChange={(checked) => setAiSettings({ ...aiSettings, smartDifficultyBalancing: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Topic-based clustering</span>
                      <p className="text-xs text-muted-foreground">Group similar questions automatically</p>
                    </div>
                    <Switch
                      checked={aiSettings.topicBasedClustering}
                      onCheckedChange={(checked) => setAiSettings({ ...aiSettings, topicBasedClustering: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Analytics & Insights</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Real-time analytics</span>
                      <p className="text-xs text-muted-foreground">Live AI insights during assessment</p>
                    </div>
                    <Switch
                      checked={aiSettings.realTimeAnalytics}
                      onCheckedChange={(checked) => setAiSettings({ ...aiSettings, realTimeAnalytics: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Predictive scoring</span>
                      <p className="text-xs text-muted-foreground">Predict performance patterns</p>
                    </div>
                    <Switch
                      checked={aiSettings.predictiveScoring}
                      onCheckedChange={(checked) => setAiSettings({ ...aiSettings, predictiveScoring: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Behavior analysis</span>
                      <p className="text-xs text-muted-foreground">Track candidate behavior patterns</p>
                    </div>
                    <Switch
                      checked={aiSettings.behaviorAnalysis}
                      onCheckedChange={(checked) => setAiSettings({ ...aiSettings, behaviorAnalysis: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Stats Overview */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            AI Usage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-2xl bg-accent/30">
              <div className="text-2xl font-bold text-foreground">12</div>
              <div className="text-sm text-muted-foreground">Questions Generated</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-accent/30">
              <div className="text-2xl font-bold text-foreground">5</div>
              <div className="text-sm text-muted-foreground">Topics Covered</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-accent/30">
              <div className="text-2xl font-bold text-foreground">98%</div>
              <div className="text-sm text-muted-foreground">Quality Score</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-accent/30">
              <div className="text-2xl font-bold text-foreground">45s</div>
              <div className="text-sm text-muted-foreground">Avg. Generation Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

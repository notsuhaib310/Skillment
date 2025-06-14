"use client"

import { Label } from "@/components/ui/label"

import { Brain, Target, FileText, Settings, Sparkles, Zap, Lightbulb, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface AIToolsPanelProps {
  selectedType: string
}

export function AIToolsPanel({ selectedType }: AIToolsPanelProps) {
  const aiFeatures = [
    {
      key: "generateQuestions",
      title: "AI Question Generation",
      description: "Generate questions automatically from topics and difficulty levels",
      icon: Brain,
      category: "Content Creation",
      available: ["mcq", "coding", "hybrid"],
    },
    {
      key: "generateTestCases",
      title: "Test Case Generation",
      description: "Auto-generate comprehensive test cases for coding problems",
      icon: Target,
      category: "Coding",
      available: ["coding", "hybrid"],
    },
    {
      key: "aiSummary",
      title: "Assessment Summary",
      description: "Generate detailed assessment summaries and insights",
      icon: FileText,
      category: "Analytics",
      available: ["mcq", "coding", "proctored", "hybrid"],
    },
    {
      key: "smartTagging",
      title: "Smart Tagging",
      description: "Automatically tag questions based on content and difficulty",
      icon: Settings,
      category: "Organization",
      available: ["mcq", "coding", "hybrid"],
    },
    {
      key: "autoScoring",
      title: "AI-Powered Scoring",
      description: "Intelligent scoring with partial credit and detailed feedback",
      icon: Sparkles,
      category: "Evaluation",
      available: ["mcq", "coding", "hybrid"],
    },
    {
      key: "plagiarismDetection",
      title: "Plagiarism Detection",
      description: "Detect code similarity and potential plagiarism",
      icon: Zap,
      category: "Security",
      available: ["coding", "hybrid"],
    },
    {
      key: "adaptiveTesting",
      title: "Adaptive Testing",
      description: "Adjust question difficulty based on candidate performance",
      icon: Lightbulb,
      category: "Advanced",
      available: ["mcq", "hybrid"],
    },
    {
      key: "performanceInsights",
      title: "Performance Insights",
      description: "AI-driven insights into candidate performance patterns",
      icon: BarChart3,
      category: "Analytics",
      available: ["mcq", "coding", "proctored", "hybrid"],
    },
  ]

  const availableFeatures = aiFeatures.filter((feature) => feature.available.includes(selectedType))
  const categories = [...new Set(availableFeatures.map((f) => f.category))]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI Tools & Enhancement</h2>
        <p className="text-muted-foreground">
          Enhance your assessment with AI-powered features for better evaluation and insights
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-foreground">{category}</h3>
              <Badge variant="secondary" className="rounded-xl">
                {availableFeatures.filter((f) => f.category === category).length} features
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableFeatures
                .filter((feature) => feature.category === category)
                .map((feature) => (
                  <Card
                    key={feature.key}
                    className="card-gradient rounded-3xl border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                            <feature.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                          </div>
                        </div>
                        <Switch />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Button variant="outline" className="w-full rounded-2xl justify-start">
                          <Settings className="mr-2 h-4 w-4" />
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Configuration Panel */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Content Generation</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-generate questions</Label>
                    <p className="text-xs text-muted-foreground">Generate questions from topics</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Smart difficulty adjustment</Label>
                    <p className="text-xs text-muted-foreground">Adjust based on performance</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Evaluation & Scoring</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">AI-powered scoring</Label>
                    <p className="text-xs text-muted-foreground">Intelligent partial credit</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Automated feedback</Label>
                    <p className="text-xs text-muted-foreground">Generate detailed feedback</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="text-center">
            <Button className="rounded-2xl primary-gradient glow-primary">
              <Sparkles className="mr-2 h-4 w-4" />
              Apply AI Enhancements
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

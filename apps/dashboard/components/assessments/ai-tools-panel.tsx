"use client"

import { Brain, Sparkles, Target, FileText, Zap, Code, Users } from "lucide-react"
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
      id: "question-generation",
      title: "AI Question Generation",
      description: "Generate questions automatically from topics and learning objectives",
      icon: Brain,
      category: "content",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: false,
    },
    {
      id: "test-case-generation",
      title: "Test Case Generation",
      description: "Automatically create test cases for coding problems",
      icon: Code,
      category: "coding",
      supportedTypes: ["coding", "hybrid"],
      premium: false,
    },
    {
      id: "difficulty-analysis",
      title: "Difficulty Analysis",
      description: "AI-powered difficulty assessment and balancing",
      icon: Target,
      category: "analysis",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: true,
    },
    {
      id: "plagiarism-detection",
      title: "Plagiarism Detection",
      description: "Advanced AI-based code and text plagiarism detection",
      icon: FileText,
      category: "security",
      supportedTypes: ["coding", "proctored", "hybrid"],
      premium: true,
    },
    {
      id: "auto-grading",
      title: "Intelligent Auto-Grading",
      description: "AI-powered grading for subjective answers",
      icon: Sparkles,
      category: "grading",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: true,
    },
    {
      id: "candidate-insights",
      title: "Candidate Insights",
      description: "AI-generated insights about candidate performance",
      icon: Users,
      category: "analytics",
      supportedTypes: ["mcq", "coding", "proctored", "hybrid"],
      premium: true,
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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">AI Tools & Features</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Enhance your {selectedType} assessment with powerful AI-driven features for better content creation, analysis,
          and candidate evaluation.
        </p>
      </div>

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
                      <Switch />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
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
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Smart difficulty balancing</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Topic-based question clustering</span>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Analysis & Insights</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Real-time performance analytics</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Predictive scoring</span>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Candidate behavior analysis</span>
                  <Switch />
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

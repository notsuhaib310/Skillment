"use client"

import { FileText, Code, Eye, Zap, Users, Target, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const assessmentTypes = [
  {
    id: "mcq",
    title: "MCQ-Based Assessment",
    description: "Multiple choice questions with instant automated scoring and detailed analytics",
    icon: FileText,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    features: ["Instant scoring", "Question randomization", "Time limits", "Detailed analytics"],
    bestFor: "Knowledge testing, certifications, quick evaluations",
  },
  {
    id: "coding",
    title: "Coding Assessment",
    description: "Programming challenges with automated code execution and test case validation",
    icon: Code,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    features: ["Multi-language support", "Auto test cases", "Code execution", "Plagiarism detection"],
    bestFor: "Developer hiring, programming skills, technical interviews",
  },
  {
    id: "proctored",
    title: "Proctored Examination",
    description: "Monitored assessment with advanced anti-cheating and identity verification",
    icon: Eye,
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    features: ["Webcam monitoring", "Screen recording", "ID verification", "Cheat detection"],
    bestFor: "High-stakes exams, certifications, formal assessments",
  },
  {
    id: "hybrid",
    title: "Hybrid Assessment",
    description: "Combination of multiple assessment types for comprehensive evaluation",
    icon: Zap,
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    features: ["Mixed question types", "Flexible scoring", "Custom workflows", "Advanced reporting"],
    bestFor: "Comprehensive evaluations, multi-skill testing, complex assessments",
  },
]

interface AssessmentTypeSelectorProps {
  selectedType: string
  onTypeSelect: (type: string) => void
}

export function AssessmentTypeSelector({ selectedType, onTypeSelect }: AssessmentTypeSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Choose Assessment Type</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the type of assessment that best fits your evaluation needs. Each type offers unique features and
          capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {assessmentTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-2xl ${
              selectedType === type.id
                ? "ring-2 ring-primary shadow-2xl glow-primary scale-105"
                : "card-gradient border-border/40 hover:border-primary/30"
            }`}
            onClick={() => onTypeSelect(type.id)}
          >
            <CardContent className="p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${type.color}`}>
                  <type.icon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">{type.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{type.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Features
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Best For
                  </h4>
                  <p className="text-sm text-muted-foreground">{type.bestFor}</p>
                </div>
              </div>

              {selectedType === type.id && (
                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Selected - Continue to configure this assessment type
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedType && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary/10 border border-primary/30">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">
              {assessmentTypes.find((t) => t.id === selectedType)?.title} selected
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

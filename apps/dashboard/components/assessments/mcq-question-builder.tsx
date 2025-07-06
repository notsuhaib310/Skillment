"use client"

import { useState } from "react"
import { Plus, Trash2, Sparkles, Copy, Settings, Wand2, Loader2, Brain, Target, CheckCircle, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { aiQuestionGenerator } from "@/lib/ai-question-generator"
import { useToast } from "@/hooks/use-toast"

interface MCQOption {
  id: string
  text: string
  isCorrect: boolean
}

interface MCQQuestion {
  id: string
  question: string
  options: MCQOption[]
  explanation: string
  difficulty: "easy" | "medium" | "hard"
  marks: number
  tags: string[]
  multipleCorrect: boolean
  type?: string
}

interface MCQQuestionBuilderProps {
  onAddQuestion: (question: MCQQuestion) => void;
}

export function MCQQuestionBuilder({ onAddQuestion }: MCQQuestionBuilderProps) {
  const [currentQuestion, setCurrentQuestion] = useState<MCQQuestion>({
    id: "",
    question: "",
    options: [
      { id: "1", text: "", isCorrect: false },
      { id: "2", text: "", isCorrect: false },
      { id: "3", text: "", isCorrect: false },
      { id: "4", text: "", isCorrect: false },
    ],
    explanation: "",
    difficulty: "medium",
    marks: 1,
    tags: [],
    multipleCorrect: false,
  })

  const [aiPanel, setAiPanel] = useState({
    isOpen: false,
    mode: "generate" as "generate" | "enhance" | "analyze",
    topic: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    count: 1,
    requirements: "",
    isGenerating: false,
    suggestions: [] as any[],
  })

  const { toast } = useToast()

  const addOption = () => {
    const newOption: MCQOption = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
    }
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, newOption],
    })
  }

  const removeOption = (id: string) => {
    if (currentQuestion.options.length > 2) {
      setCurrentQuestion({
        ...currentQuestion,
        options: currentQuestion.options.filter((opt) => opt.id !== id),
      })
    }
  }

  const updateOption = (id: string, field: keyof MCQOption, value: any) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt)),
    })
  }

  const setCorrectAnswer = (id: string) => {
    if (currentQuestion.multipleCorrect) {
      updateOption(id, "isCorrect", !currentQuestion.options.find((opt) => opt.id === id)?.isCorrect)
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        options: currentQuestion.options.map((opt) => ({ ...opt, isCorrect: opt.id === id })),
      })
    }
  }

  const handleAddQuestion = () => {
    // Validation
    if (!currentQuestion.question.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a question text.",
        variant: "destructive",
      })
      return
    }

    if (currentQuestion.options.some(opt => !opt.text.trim())) {
      toast({
        title: "Validation Error", 
        description: "Please fill in all option texts.",
        variant: "destructive",
      })
      return
    }

    if (!currentQuestion.options.some(opt => opt.isCorrect)) {
      toast({
        title: "Validation Error",
        description: "Please mark at least one correct answer.",
        variant: "destructive",
      })
      return
    }

    const questionWithId = {
      ...currentQuestion,
      id: Date.now().toString(),
      type: 'mcq', // Ensure type is set correctly
    }

    onAddQuestion(questionWithId);
    
    // Reset form
    setCurrentQuestion({
      id: "",
      question: "",
      options: [
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
      ],
      explanation: "",
      difficulty: "medium",
      marks: 1,
      tags: [],
      multipleCorrect: false,
      type: "mcq",
    });

    toast({
      title: "Question Added",
      description: "MCQ question has been added successfully.",
    })
  };

  const handleAIGeneration = async () => {
    if (!aiPanel.topic.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a topic for AI generation.",
        variant: "destructive",
      })
      return
    }

    setAiPanel({ ...aiPanel, isGenerating: true })
    try {
      const questions = await aiQuestionGenerator.generateMCQQuestions({
        type: "mcq",
        topic: aiPanel.topic,
        difficulty: aiPanel.difficulty,
        count: aiPanel.count,
        additionalRequirements: aiPanel.requirements,
      })

      setAiPanel({ ...aiPanel, suggestions: questions, isGenerating: false })
      toast({
        title: "Questions Generated",
        description: `Successfully generated ${questions.length} question(s) using AI.`,
      })
    } catch (error) {
      console.error("AI generation error:", error)
      setAiPanel({ ...aiPanel, isGenerating: false })
    }
  }

  const useAISuggestion = (suggestion: any) => {
    const formattedOptions = suggestion.options.map((opt: any, index: number) => ({
      id: (index + 1).toString(),
      text: opt.text,
      isCorrect: opt.isCorrect,
    }))

    setCurrentQuestion({
      id: "",
      question: suggestion.question,
      options: formattedOptions,
      explanation: suggestion.explanation || "",
      difficulty: suggestion.difficulty,
      marks: 1,
      tags: suggestion.tags || [],
      multipleCorrect: false,
    })

    toast({
      title: "AI Suggestion Applied",
      description: "Question has been loaded from AI suggestion.",
    })
  }

  const enhanceWithAI = async (type: "explanation" | "difficulty") => {
    if (!currentQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question first.",
        variant: "destructive",
      })
      return
    }

    try {
      const enhancement = await aiQuestionGenerator.enhanceQuestionWithAI(currentQuestion.question, type)
      if (type === "explanation") {
        setCurrentQuestion({ ...currentQuestion, explanation: enhancement })
      }
      toast({
        title: "Enhanced with AI",
        description: `Generated ${type} using AI.`,
      })
    } catch (error) {
      console.error("Enhancement error:", error)
    }
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    setCurrentQuestion({ ...currentQuestion, tags })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">MCQ Question Builder</h3>
          <p className="text-sm text-muted-foreground">Create multiple choice questions with AI assistance</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAiPanel({ ...aiPanel, isOpen: !aiPanel.isOpen })}
            variant="outline"
            className="rounded-2xl"
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Button onClick={handleAddQuestion} className="rounded-2xl primary-gradient glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Question Builder */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Question Details</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => enhanceWithAI("explanation")}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Lightbulb className="mr-2 h-3 w-3" />
                    AI Explain
                  </Button>
                  <Button
                    onClick={() => enhanceWithAI("difficulty")}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Target className="mr-2 h-3 w-3" />
                    AI Analyze
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="question">Question Text *</Label>
                <Textarea
                  id="question"
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  placeholder="Enter your question here..."
                  className="rounded-2xl min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={currentQuestion.difficulty}
                    onValueChange={(value: any) => setCurrentQuestion({ ...currentQuestion, difficulty: value })}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: Number.parseInt(e.target.value) })}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={currentQuestion.multipleCorrect ? "multiple" : "single"}
                    onValueChange={(value) =>
                      setCurrentQuestion({ ...currentQuestion, multipleCorrect: value === "multiple" })
                    }
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="single">Single Correct</SelectItem>
                      <SelectItem value="multiple">Multiple Correct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="text-2xl font-bold text-foreground">{currentQuestion.options.length}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={currentQuestion.tags.join(", ")}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="JavaScript, React, Frontend (comma separated)"
                  className="rounded-2xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Answer Options</CardTitle>
              <Button onClick={addOption} variant="outline" size="sm" className="rounded-2xl">
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.multipleCorrect ? (
                <div className="space-y-4">
                  {currentQuestion.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30">
                      <Checkbox
                        checked={option.isCorrect}
                        onCheckedChange={() => setCorrectAnswer(option.id)}
                        className="rounded-md"
                      />
                      <div className="flex-1">
                        <Input
                          value={option.text}
                          onChange={(e) => updateOption(option.id, "text", e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="rounded-2xl"
                        />
                      </div>
                      {currentQuestion.options.length > 2 && (
                        <Button
                          onClick={() => removeOption(option.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={currentQuestion.options.find((opt) => opt.isCorrect)?.id}
                  onValueChange={setCorrectAnswer}
                >
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-4 p-4 rounded-2xl bg-accent/30">
                        <RadioGroupItem value={option.id} />
                        <div className="flex-1">
                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(option.id, "text", e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            className="rounded-2xl"
                          />
                        </div>
                        {currentQuestion.options.length > 2 && (
                          <Button
                            onClick={() => removeOption(option.id)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentQuestion.explanation}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                placeholder="Provide a detailed explanation for the correct answer..."
                className="rounded-2xl min-h-24"
              />
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Panel */}
        <div className="space-y-6">
          {aiPanel.isOpen && (
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={aiPanel.mode} onValueChange={(value: any) => setAiPanel({ ...aiPanel, mode: value })}>
                  <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/50">
                    <TabsTrigger value="generate" className="rounded-xl">Generate</TabsTrigger>
                    <TabsTrigger value="enhance" className="rounded-xl">Enhance</TabsTrigger>
                    <TabsTrigger value="analyze" className="rounded-xl">Analyze</TabsTrigger>
                  </TabsList>

                  <TabsContent value="generate" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Topic</Label>
                        <Input
                          value={aiPanel.topic}
                          onChange={(e) => setAiPanel({ ...aiPanel, topic: e.target.value })}
                          placeholder="e.g., JavaScript Arrays"
                          className="rounded-2xl"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Difficulty</Label>
                          <Select
                            value={aiPanel.difficulty}
                            onValueChange={(value: any) => setAiPanel({ ...aiPanel, difficulty: value })}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Count</Label>
                          <Select
                            value={aiPanel.count.toString()}
                            onValueChange={(value) => setAiPanel({ ...aiPanel, count: parseInt(value) })}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Requirements</Label>
                        <Textarea
                          value={aiPanel.requirements}
                          onChange={(e) => setAiPanel({ ...aiPanel, requirements: e.target.value })}
                          placeholder="Any specific requirements..."
                          className="rounded-2xl"
                          rows={3}
                        />
                      </div>
                      <Button
                        onClick={handleAIGeneration}
                        disabled={aiPanel.isGenerating}
                        className="w-full rounded-2xl primary-gradient"
                      >
                        {aiPanel.isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate Questions
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="enhance" className="space-y-4">
                    <div className="space-y-4">
                      <Button
                        onClick={() => enhanceWithAI("explanation")}
                        variant="outline"
                        className="w-full rounded-2xl"
                      >
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Generate Explanation
                      </Button>
                      <Button
                        onClick={() => enhanceWithAI("difficulty")}
                        variant="outline"
                        className="w-full rounded-2xl"
                      >
                        <Target className="mr-2 h-4 w-4" />
                        Analyze Difficulty
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="analyze" className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-accent/50 mx-auto flex items-center justify-center">
                        <Target className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Question Analysis</h4>
                        <p className="text-sm text-muted-foreground">
                          AI will analyze your question for difficulty, clarity, and quality
                        </p>
                      </div>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        Coming Soon
                      </Badge>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* AI Suggestions */}
          {aiPanel.suggestions.length > 0 && (
            <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiPanel.suggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-accent/30 space-y-3">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{suggestion.question}</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs rounded-xl">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={() => useAISuggestion(suggestion)}
                      size="sm"
                      className="w-full rounded-xl"
                    >
                      Use This Question
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Question
              </Button>
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                <Settings className="mr-2 h-4 w-4" />
                Advanced Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
  import { Plus, Trash2, Play, Code, Wand2, Loader2, Brain, Target, CheckCircle, Lightbulb, Eye, EyeOff } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { aiQuestionGenerator } from "@/lib/ai-question-generator"
import { useToast } from "@/hooks/use-toast"

interface TestCase {
  id: string
  input: string
  expectedOutput: string
  isPublic: boolean
  explanation?: string
}

interface CodingQuestion {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  tags: string[]
  marks: number
  timeLimit: number
  memoryLimit: number
  languages: string[]
  starterCode: { [language: string]: string }
  testCases: TestCase[]
  type?: string
}

interface CodingQuestionBuilderProps {
  onAddQuestion: (question: CodingQuestion) => void
}

export function CodingQuestionBuilder({ onAddQuestion }: CodingQuestionBuilderProps) {
  const [currentQuestion, setCurrentQuestion] = useState<CodingQuestion>({
    id: "",
    title: "",
    description: "",
    difficulty: "medium",
    tags: [],
    marks: 10,
    timeLimit: 30,
    memoryLimit: 256,
    languages: ["javascript"],
    starterCode: {
      javascript: "function solution() {\n  // Your code here\n  \n}",
      python: "def solution():\n    # Your code here\n    pass",
      java: "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
      cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
    },
    testCases: []
  })

  const [aiPanel, setAiPanel] = useState({
    isOpen: false,
    mode: "generate" as "generate" | "testcases" | "enhance",
    topic: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    language: "javascript",
    requirements: "",
    isGenerating: false,
    suggestions: [] as any[],
  })

  const { toast } = useToast()

  const supportedLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
  ]

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: "",
      expectedOutput: "",
      isPublic: true,
      explanation: "",
    }
    setCurrentQuestion({
      ...currentQuestion,
      testCases: [...currentQuestion.testCases, newTestCase],
    })
  }

  const removeTestCase = (id: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      testCases: currentQuestion.testCases.filter((tc) => tc.id !== id),
    })
  }

  const updateTestCase = (id: string, field: keyof TestCase, value: any) => {
    setCurrentQuestion({
      ...currentQuestion,
      testCases: currentQuestion.testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    })
  }

  const handleLanguageToggle = (language: string) => {
    const isSelected = currentQuestion.languages.includes(language)
    if (isSelected) {
      setCurrentQuestion({
        ...currentQuestion,
        languages: currentQuestion.languages.filter((l) => l !== language),
      })
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        languages: [...currentQuestion.languages, language],
      })
    }
  }

  const updateStarterCode = (language: string, code: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      starterCode: {
        ...currentQuestion.starterCode,
        [language]: code,
      },
    })
  }

  const handleAddQuestion = () => {
    // Validation
    if (!currentQuestion.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a question title.",
        variant: "destructive",
      })
      return
    }

    if (!currentQuestion.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a question description.",
        variant: "destructive",
      })
      return
    }

    if (currentQuestion.testCases.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one test case.",
        variant: "destructive",
      })
      return
    }

    const questionWithId = {
      ...currentQuestion,
      id: Date.now().toString(),
      type: 'coding', // Ensure type is set correctly
    }

    onAddQuestion(questionWithId)

    // Reset form
    setCurrentQuestion({
      id: "",
      title: "",
      description: "",
      difficulty: "medium",
      tags: [],
      marks: 10,
      timeLimit: 30,
      memoryLimit: 256,
      languages: ["javascript"],
      starterCode: {
        javascript: "function solution() {\n  // Your code here\n  \n}",
        python: "def solution():\n    # Your code here\n    pass",
        java: "public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}",
        cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}",
      },
      testCases: []
    })

    toast({
      title: "Question Added",
      description: "Coding question has been added successfully.",
    })
  }

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
      const questions = await aiQuestionGenerator.generateCodingQuestions({
        type: "coding",
        topic: aiPanel.topic,
        difficulty: aiPanel.difficulty,
        language: aiPanel.language,
        additionalRequirements: aiPanel.requirements,
      })

      setAiPanel({ ...aiPanel, suggestions: questions, isGenerating: false })
      toast({
        title: "Questions Generated",
        description: `Successfully generated ${questions.length} coding question(s) using AI.`,
      })
    } catch (error) {
      console.error("AI generation error:", error)
      setAiPanel({ ...aiPanel, isGenerating: false })
    }
  }

  const generateTestCases = async () => {
    if (!currentQuestion.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a problem description first.",
        variant: "destructive",
      })
      return
    }

    setAiPanel({ ...aiPanel, isGenerating: true })
    try {
      const testCases = await aiQuestionGenerator.generateTestCases(
        currentQuestion.description,
        aiPanel.language
      )
      
      const formattedTestCases = testCases.map((tc: any, index: number) => ({
        id: (Date.now() + index).toString(),
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isPublic: tc.isPublic,
        explanation: tc.explanation || "",
      }))

      setCurrentQuestion({
        ...currentQuestion,
        testCases: [...currentQuestion.testCases, ...formattedTestCases],
      })

      toast({
        title: "Test Cases Generated",
        description: `Successfully generated ${testCases.length} test cases using AI.`,
      })
    } catch (error) {
      console.error("Test case generation error:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate test cases. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAiPanel({ ...aiPanel, isGenerating: false })
    }
  }

  const useAISuggestion = (suggestion: any) => {
    setCurrentQuestion({
      id: "",
      title: suggestion.title,
      description: suggestion.description,
      difficulty: suggestion.difficulty,
      tags: suggestion.tags || [],
      marks: 10,
      timeLimit: 30,
      memoryLimit: 256,
      languages: [aiPanel.language],
      starterCode: suggestion.starterCode || currentQuestion.starterCode,
      testCases: suggestion.testCases?.map((tc: any, index: number) => ({
        id: (Date.now() + index).toString(),
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isPublic: tc.isPublic,
        explanation: tc.explanation || "",
      })) || [],
    })

    toast({
      title: "AI Suggestion Applied",
      description: "Coding question has been loaded from AI suggestion.",
    })
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
          <h3 className="text-xl font-semibold text-foreground">Coding Question Builder</h3>
          <p className="text-sm text-muted-foreground">Create coding problems with AI assistance</p>
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
              <CardTitle>Problem Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Problem Title *</Label>
                <Input
                  id="title"
                  value={currentQuestion.title}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, title: e.target.value })}
                  placeholder="e.g., Two Sum, Binary Search, etc."
                  className="rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Problem Description *</Label>
                <Textarea
                  id="description"
                  value={currentQuestion.description}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, description: e.target.value })}
                  placeholder="Write a detailed problem description with examples, constraints, and expected behavior..."
                  className="rounded-2xl min-h-32"
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
                    <SelectContent>
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
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) })}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Limit (min)</Label>
                  <Input
                    type="number"
                    value={currentQuestion.timeLimit}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: parseInt(e.target.value) })}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Memory (MB)</Label>
                  <Input
                    type="number"
                    value={currentQuestion.memoryLimit}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, memoryLimit: parseInt(e.target.value) })}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  value={currentQuestion.tags.join(", ")}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="Arrays, Hash Table, Two Pointers (comma separated)"
                  className="rounded-2xl"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {supportedLanguages.map((lang) => (
                  <div key={lang.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={lang.value}
                      checked={currentQuestion.languages.includes(lang.value)}
                      onChange={() => handleLanguageToggle(lang.value)}
                      className="rounded"
                    />
                    <Label htmlFor={lang.value} className="text-sm">
                      {lang.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Starter Code</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={currentQuestion.languages[0]} className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-muted/50">
                  {currentQuestion.languages.slice(0, 4).map((lang) => (
                    <TabsTrigger key={lang} value={lang} className="rounded-xl capitalize">
                      {lang}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {currentQuestion.languages.map((lang) => (
                  <TabsContent key={lang} value={lang} className="space-y-4">
                    <Textarea
                      value={currentQuestion.starterCode[lang] || ""}
                      onChange={(e) => updateStarterCode(lang, e.target.value)}
                      placeholder={`Enter starter code for ${lang}...`}
                      className="rounded-2xl min-h-32 font-mono text-sm"
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Test Cases</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={generateTestCases}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  AI Generate
                </Button>
                <Button onClick={addTestCase} variant="outline" size="sm" className="rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Test Case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentQuestion.testCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No test cases added yet. Click "Add Test Case" or "AI Generate" to get started.</p>
                </div>
              ) : (
                currentQuestion.testCases.map((testCase, index) => (
                  <div key={testCase.id} className="p-4 rounded-2xl bg-accent/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-xl">
                          Test Case {index + 1}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={testCase.isPublic}
                            onCheckedChange={(checked) => updateTestCase(testCase.id, "isPublic", checked)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {testCase.isPublic ? (
                              <><Eye className="h-4 w-4 inline mr-1" />Public</>
                            ) : (
                              <><EyeOff className="h-4 w-4 inline mr-1" />Private</>
                            )}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeTestCase(testCase.id)}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Input</Label>
                        <Textarea
                          value={testCase.input}
                          onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                          placeholder="Input data..."
                          className="rounded-2xl font-mono text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Expected Output</Label>
                        <Textarea
                          value={testCase.expectedOutput}
                          onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                          placeholder="Expected output..."
                          className="rounded-2xl font-mono text-sm"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Explanation (Optional)</Label>
                      <Input
                        value={testCase.explanation || ""}
                        onChange={(e) => updateTestCase(testCase.id, "explanation", e.target.value)}
                        placeholder="Brief explanation of this test case..."
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                ))
              )}
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
                    <TabsTrigger value="testcases" className="rounded-xl">Test Cases</TabsTrigger>
                    <TabsTrigger value="enhance" className="rounded-xl">Enhance</TabsTrigger>
                  </TabsList>

                  <TabsContent value="generate" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Topic</Label>
                        <Input
                          value={aiPanel.topic}
                          onChange={(e) => setAiPanel({ ...aiPanel, topic: e.target.value })}
                          placeholder="e.g., Arrays, Dynamic Programming"
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
                          <Label>Language</Label>
                          <Select
                            value={aiPanel.language}
                            onValueChange={(value) => setAiPanel({ ...aiPanel, language: value })}
                          >
                            <SelectTrigger className="rounded-2xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {supportedLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  {lang.label}
                                </SelectItem>
                              ))}
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
                            Generate Problem
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="testcases" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={aiPanel.language}
                          onValueChange={(value) => setAiPanel({ ...aiPanel, language: value })}
                        >
                          <SelectTrigger className="rounded-2xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {supportedLanguages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={generateTestCases}
                        disabled={aiPanel.isGenerating || !currentQuestion.description.trim()}
                        className="w-full rounded-2xl primary-gradient"
                      >
                        {aiPanel.isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Code className="mr-2 h-4 w-4" />
                            Generate Test Cases
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Add a problem description first to generate test cases.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="enhance" className="space-y-4">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-accent/50 mx-auto flex items-center justify-center">
                        <Target className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Problem Enhancement</h4>
                        <p className="text-sm text-muted-foreground">
                          AI will enhance your problem description, add constraints, and improve clarity
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
                {aiPanel.suggestions.slice(0, 2).map((suggestion, index) => (
                  <div key={index} className="p-4 rounded-2xl bg-accent/30 space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.description}</p>
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
                      Use This Problem
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
                <Play className="mr-2 h-4 w-4" />
                Test Run
              </Button>
              <Button variant="outline" size="sm" className="w-full rounded-xl">
                <Code className="mr-2 h-4 w-4" />
                Preview Problem
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

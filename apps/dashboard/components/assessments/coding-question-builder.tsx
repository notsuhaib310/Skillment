"use client"

import { useState } from "react"
import { Plus, Trash2, Play, Eye, EyeOff, Sparkles, Copy, Settings, Code, TestTube } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

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
  timeLimit: number
  memoryLimit: number
  languages: string[]
  starterCode: { [language: string]: string }
  testCases: TestCase[]
  marks: number
}

export function CodingQuestionBuilder() {
  const [questions, setQuestions] = useState<CodingQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<CodingQuestion>({
    id: "",
    title: "",
    description: "",
    difficulty: "medium",
    tags: [],
    timeLimit: 30,
    memoryLimit: 256,
    languages: ["javascript"],
    starterCode: { javascript: "" },
    testCases: [],
    marks: 10,
  })
  const [selectedLanguage, setSelectedLanguage] = useState("javascript")

  const languages = [
    { value: "javascript", label: "JavaScript", extension: "js" },
    { value: "python", label: "Python", extension: "py" },
    { value: "java", label: "Java", extension: "java" },
    { value: "cpp", label: "C++", extension: "cpp" },
    { value: "c", label: "C", extension: "c" },
    { value: "csharp", label: "C#", extension: "cs" },
    { value: "go", label: "Go", extension: "go" },
    { value: "rust", label: "Rust", extension: "rs" },
  ]

  const addTestCase = (isPublic = true) => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      input: "",
      expectedOutput: "",
      isPublic,
      explanation: "",
    }
    setCurrentQuestion({
      ...currentQuestion,
      testCases: [...currentQuestion.testCases, newTestCase],
    })
  }

  const updateTestCase = (id: string, field: keyof TestCase, value: any) => {
    setCurrentQuestion({
      ...currentQuestion,
      testCases: currentQuestion.testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)),
    })
  }

  const removeTestCase = (id: string) => {
    setCurrentQuestion({
      ...currentQuestion,
      testCases: currentQuestion.testCases.filter((tc) => tc.id !== id),
    })
  }

  const generateTestCasesWithAI = () => {
    // AI test case generation logic
    console.log("Generating test cases with AI...")
  }

  const publicTestCases = currentQuestion.testCases.filter((tc) => tc.isPublic)
  const privateTestCases = currentQuestion.testCases.filter((tc) => !tc.isPublic)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Coding Questions</h3>
          <p className="text-sm text-muted-foreground">Create programming challenges with auto-evaluation</p>
        </div>
        <Button className="rounded-2xl primary-gradient glow-primary">
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Question Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Question Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Question Title *</Label>
                  <Input
                    id="title"
                    value={currentQuestion.title}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, title: e.target.value })}
                    placeholder="e.g., Two Sum Problem"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Problem Statement *</Label>
                <Textarea
                  id="description"
                  value={currentQuestion.description}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, description: e.target.value })}
                  placeholder="Describe the problem in detail..."
                  className="rounded-2xl min-h-32"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    value={currentQuestion.marks}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: Number.parseInt(e.target.value) })}
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (min)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={currentQuestion.timeLimit}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, timeLimit: Number.parseInt(e.target.value) })
                    }
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memoryLimit">Memory (MB)</Label>
                  <Input
                    id="memoryLimit"
                    type="number"
                    value={currentQuestion.memoryLimit}
                    onChange={(e) =>
                      setCurrentQuestion({ ...currentQuestion, memoryLimit: Number.parseInt(e.target.value) })
                    }
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Cases</Label>
                  <div className="text-2xl font-bold text-foreground">{currentQuestion.testCases.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programming Languages */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Supported Languages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <div key={lang.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={lang.value}
                      checked={currentQuestion.languages.includes(lang.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCurrentQuestion({
                            ...currentQuestion,
                            languages: [...currentQuestion.languages, lang.value],
                          })
                        } else {
                          setCurrentQuestion({
                            ...currentQuestion,
                            languages: currentQuestion.languages.filter((l) => l !== lang.value),
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={lang.value} className="text-sm">
                      {lang.label}
                    </Label>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Starter Code</Label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-40 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {languages
                        .filter((lang) => currentQuestion.languages.includes(lang.value))
                        .map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={currentQuestion.starterCode[selectedLanguage] || ""}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      starterCode: {
                        ...currentQuestion.starterCode,
                        [selectedLanguage]: e.target.value,
                      },
                    })
                  }
                  placeholder={`// Starter code for ${languages.find((l) => l.value === selectedLanguage)?.label}`}
                  className="rounded-2xl font-mono text-sm min-h-32"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Cases */}
        <div className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Cases
              </CardTitle>
              <Button onClick={generateTestCasesWithAI} size="sm" className="rounded-2xl primary-gradient">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => addTestCase(true)} variant="outline" size="sm" className="rounded-2xl flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Public
                </Button>
                <Button onClick={() => addTestCase(false)} variant="outline" size="sm" className="rounded-2xl flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Private
                </Button>
              </div>

              <Tabs defaultValue="public" className="w-full">
                <TabsList className="grid w-full grid-cols-2 rounded-2xl">
                  <TabsTrigger value="public" className="rounded-xl">
                    Public ({publicTestCases.length})
                  </TabsTrigger>
                  <TabsTrigger value="private" className="rounded-xl">
                    Private ({privateTestCases.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="public" className="space-y-4">
                  <div className="text-xs text-muted-foreground mb-2">Visible to candidates as examples</div>
                  {publicTestCases.map((testCase) => (
                    <Card key={testCase.id} className="border-border/40">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="rounded-xl bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <Eye className="mr-1 h-3 w-3" />
                            Public
                          </Badge>
                          <Button
                            onClick={() => removeTestCase(testCase.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Input</Label>
                            <Textarea
                              value={testCase.input}
                              onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                              placeholder="Input data..."
                              className="rounded-xl text-xs font-mono"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Expected Output</Label>
                            <Textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                              placeholder="Expected output..."
                              className="rounded-xl text-xs font-mono"
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="private" className="space-y-4">
                  <div className="text-xs text-muted-foreground mb-2">Hidden from candidates, used for evaluation</div>
                  {privateTestCases.map((testCase) => (
                    <Card key={testCase.id} className="border-border/40">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge className="rounded-xl bg-red-500/20 text-red-400 border-red-500/30">
                            <EyeOff className="mr-1 h-3 w-3" />
                            Private
                          </Badge>
                          <Button
                            onClick={() => removeTestCase(testCase.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Input</Label>
                            <Textarea
                              value={testCase.input}
                              onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                              placeholder="Input data..."
                              className="rounded-xl text-xs font-mono"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Expected Output</Label>
                            <Textarea
                              value={testCase.expectedOutput}
                              onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                              placeholder="Expected output..."
                              className="rounded-xl text-xs font-mono"
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full rounded-2xl justify-start">
                <Play className="mr-2 h-4 w-4" />
                Test Solution
              </Button>
              <Button variant="outline" className="w-full rounded-2xl justify-start">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate Question
              </Button>
              <Button variant="outline" className="w-full rounded-2xl justify-start">
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

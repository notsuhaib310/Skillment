"use client"

import { useState } from "react"
import { Plus, Trash2, Sparkles, Copy, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

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
}

export function MCQQuestionBuilder() {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">MCQ Questions</h3>
          <p className="text-sm text-muted-foreground">Create multiple choice questions with detailed explanations</p>
        </div>
        <Button className="rounded-2xl primary-gradient glow-primary">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Generate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Question Details</CardTitle>
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
                        <RadioGroupItem value={option.id} id={option.id} />
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
              <CardTitle>Explanation (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentQuestion.explanation}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                placeholder="Provide an explanation for the correct answer..."
                className="rounded-2xl min-h-24"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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

          <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Add tags (comma separated)" className="rounded-2xl" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

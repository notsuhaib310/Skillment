"use client"

import { useState } from "react"
import { Edit, Trash2, ArrowUp, ArrowDown, Copy, Eye, Tag, Clock, Award } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface Question {
  id: string
  question?: string
  title?: string
  type: "mcq" | "coding"
  difficulty: "easy" | "medium" | "hard"
  marks: number
  tags: string[]
  options?: { text: string; isCorrect: boolean }[]
  testCases?: { input: string; expectedOutput: string; isPublic: boolean }[]
  explanation?: string
  timeLimit?: number
  order: number
}

interface QuestionManagerProps {
  questions: Question[]
  onUpdateQuestion: (questionId: string, updates: Partial<Question>) => void
  onDeleteQuestion: (questionId: string) => void
  onReorderQuestions: (questions: Question[]) => void
  onDuplicateQuestion: (question: Question) => void
}

export function QuestionManager({
  questions,
  onUpdateQuestion,
  onDeleteQuestion,
  onReorderQuestions,
  onDuplicateQuestion,
}: QuestionManagerProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [previewDialog, setPreviewDialog] = useState(false)
  const { toast } = useToast()

  const handleMoveUp = (questionId: string) => {
    const currentIndex = questions.findIndex((q) => q.id === questionId)
    if (currentIndex > 0) {
      const newQuestions = [...questions]
      const temp = newQuestions[currentIndex]
      newQuestions[currentIndex] = newQuestions[currentIndex - 1]
      newQuestions[currentIndex - 1] = temp
      
      // Update order numbers
      newQuestions.forEach((q, index) => {
        q.order = index + 1
      })
      
      onReorderQuestions(newQuestions)
    }
  }

  const handleMoveDown = (questionId: string) => {
    const currentIndex = questions.findIndex((q) => q.id === questionId)
    if (currentIndex < questions.length - 1) {
      const newQuestions = [...questions]
      const temp = newQuestions[currentIndex]
      newQuestions[currentIndex] = newQuestions[currentIndex + 1]
      newQuestions[currentIndex + 1] = temp
      
      // Update order numbers
      newQuestions.forEach((q, index) => {
        q.order = index + 1
      })
      
      onReorderQuestions(newQuestions)
    }
  }

  const handleDuplicate = (question: Question) => {
    const duplicatedQuestion = {
      ...question,
      id: Date.now().toString(),
      question: question.question ? `${question.question} (Copy)` : undefined,
      title: question.title ? `${question.title} (Copy)` : undefined,
      order: questions.length + 1,
    }
    onDuplicateQuestion(duplicatedQuestion)
    toast({
      title: "Question Duplicated",
      description: "Question has been duplicated successfully.",
    })
  }

  const handleDelete = (questionId: string) => {
    onDeleteQuestion(questionId)
    toast({
      title: "Question Deleted",
      description: "Question has been deleted successfully.",
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mcq":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "coding":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0)
  const averageDifficulty = questions.length > 0 
    ? questions.reduce((sum, q) => {
        const difficultyScore = q.difficulty === "easy" ? 1 : q.difficulty === "medium" ? 2 : 3
        return sum + difficultyScore
      }, 0) / questions.length
    : 0

  const getDifficultyLabel = (score: number) => {
    if (score <= 1.5) return "Easy"
    if (score <= 2.5) return "Medium"
    return "Hard"
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-gradient rounded-2xl border-border/40">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{questions.length}</div>
            <div className="text-sm text-muted-foreground">Total Questions</div>
          </CardContent>
        </Card>
        <Card className="card-gradient rounded-2xl border-border/40">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{totalMarks}</div>
            <div className="text-sm text-muted-foreground">Total Marks</div>
          </CardContent>
        </Card>
        <Card className="card-gradient rounded-2xl border-border/40">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{getDifficultyLabel(averageDifficulty)}</div>
            <div className="text-sm text-muted-foreground">Avg. Difficulty</div>
          </CardContent>
        </Card>
        <Card className="card-gradient rounded-2xl border-border/40">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">
              {questions.filter(q => q.type === "mcq").length}/{questions.filter(q => q.type === "coding").length}
            </div>
            <div className="text-sm text-muted-foreground">MCQ/Coding</div>
          </CardContent>
        </Card>
      </div>

      {/* Questions Table */}
      <Card className="card-gradient rounded-3xl border-border/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Questions Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No questions added yet. Use the question builders above to add questions.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={question.id} className="border-border/40 hover:bg-accent/30">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          onClick={() => handleMoveUp(question.id)}
                          disabled={index === 0}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium text-center">{question.order}</span>
                        <Button
                          onClick={() => handleMoveDown(question.id)}
                          disabled={index === questions.length - 1}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-foreground line-clamp-2">
                          {question.question || question.title || "Untitled Question"}
                        </div>
                        {question.type === "mcq" && question.options && (
                          <div className="text-xs text-muted-foreground">
                            {question.options.length} options, {question.options.filter(o => o.isCorrect).length} correct
                          </div>
                        )}
                        {question.type === "coding" && question.testCases && (
                          <div className="text-xs text-muted-foreground">
                            {question.testCases.length} test cases, {question.timeLimit}min limit
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-xl border ${getTypeColor(question.type)} capitalize`}>
                        {question.type === "mcq" ? "MCQ" : "Coding"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-xl border ${getDifficultyColor(question.difficulty)} capitalize`}>
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{question.marks}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {question.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs rounded-lg">
                            {tag}
                          </Badge>
                        ))}
                        {question.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs rounded-lg">
                            +{question.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          onClick={() => {
                            setSelectedQuestion(question)
                            setPreviewDialog(true)
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDuplicate(question)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(question.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Question Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={`rounded-xl border ${getTypeColor(selectedQuestion.type)}`}>
                    {selectedQuestion.type === "mcq" ? "MCQ" : "Coding"}
                  </Badge>
                  <Badge className={`rounded-xl border ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                    {selectedQuestion.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{selectedQuestion.marks} marks</span>
                  </div>
                </div>
                {selectedQuestion.timeLimit && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedQuestion.timeLimit}min</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Question</h4>
                <p className="text-foreground whitespace-pre-wrap">
                  {selectedQuestion.question || selectedQuestion.title}
                </p>
              </div>

              {selectedQuestion.type === "mcq" && selectedQuestion.options && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Options</h4>
                  <div className="space-y-2">
                    {selectedQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border ${
                          option.isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-accent/30 border-border/40"
                        }`}
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option.text}
                        {option.isCorrect && <span className="ml-2 text-xs">(Correct)</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedQuestion.type === "coding" && selectedQuestion.testCases && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Test Cases</h4>
                  <div className="space-y-3">
                    {selectedQuestion.testCases.slice(0, 3).map((testCase, index) => (
                      <div key={index} className="p-3 rounded-xl bg-accent/30 border border-border/40">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Test Case {index + 1}</span>
                          <Badge
                            variant={testCase.isPublic ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {testCase.isPublic ? "Public" : "Private"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="text-muted-foreground mb-1">Input:</div>
                            <pre className="bg-background/50 p-2 rounded text-foreground font-mono">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">Output:</div>
                            <pre className="bg-background/50 p-2 rounded text-foreground font-mono">
                              {testCase.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedQuestion.testCases.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground">
                        +{selectedQuestion.testCases.length - 3} more test cases
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedQuestion.explanation && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Explanation</h4>
                  <div className="p-4 rounded-xl bg-accent/30 border border-border/40">
                    <p className="text-foreground whitespace-pre-wrap">{selectedQuestion.explanation}</p>
                  </div>
                </div>
              )}

              {selectedQuestion.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuestion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="rounded-xl">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 
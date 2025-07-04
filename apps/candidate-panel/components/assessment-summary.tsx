"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ArrowLeft, Send, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AssessmentSummaryProps {
  assessment: any
  answers: Record<string, any>
  onSubmit: () => void
  onBack: () => void
}

export default function AssessmentSummary({ assessment, answers, onSubmit, onBack }: AssessmentSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalQuestions = assessment?.questions?.length || 0
  const answeredQuestions = Object.keys(answers).length
  const unansweredQuestions = totalQuestions - answeredQuestions

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#1a1d21] to-[#0a0b0d] p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" size="icon" className="rounded-xl text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Assessment Summary</h1>
              <p className="text-gray-300">Review your answers before submitting</p>
            </div>
          </div>
        </div>

        {/* Warning for unanswered questions */}
        {unansweredQuestions > 0 && (
          <Alert className="bg-amber-900/20 border-amber-500/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-amber-400">
              You have {unansweredQuestions} unanswered question(s). You can still submit, but consider reviewing them.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalQuestions}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Answered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{answeredQuestions}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Unanswered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">{unansweredQuestions}</div>
            </CardContent>
          </Card>
        </div>

        {/* Answers Review */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Your Answers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessment?.questions?.map((question: any, index: number) => {
              const answer = answers[question.id]
              const hasAnswer = answer !== undefined && answer !== null && answer !== ""

              return (
                <div key={question.id} className="p-4 border border-white/10 rounded-xl bg-white/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Q{index + 1}
                      </Badge>
                      {hasAnswer ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-500" />
                      )}
                    </div>
                    <Badge className={hasAnswer ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                      {hasAnswer ? "Answered" : "Unanswered"}
                    </Badge>
                  </div>

                  <h3 className="text-white font-medium mb-2">{question.question}</h3>

                  {hasAnswer ? (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-200 text-sm font-medium">Your Answer:</p>
                      {question.type === 'mcq' ? (
                        <p className="text-white">{answer}</p>
                      ) : question.type === 'coding' ? (
                        <pre className="text-green-400 text-sm bg-black/30 p-2 rounded mt-2 overflow-x-auto">
                          <code>{answer}</code>
                        </pre>
                      ) : (
                        <p className="text-white">{answer}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm italic">No answer provided</div>
                  )}
                </div>
              )
            }) || <div className="text-gray-400">No questions found</div>}
          </CardContent>
        </Card>

        {/* Submission Section */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Ready to Submit?</h3>
                <p className="text-gray-300">
                  Once you submit, you won't be able to make any changes to your answers.
                </p>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="rounded-xl border-white/20 text-white hover:bg-white/10"
                >
                  Back to Review
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Assessment
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                By submitting, you confirm that all answers are your own work
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
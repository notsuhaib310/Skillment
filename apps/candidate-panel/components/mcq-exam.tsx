"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle,
  AlertTriangle,
  Eye
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MCQExamProps {
  assessment: any
  onComplete: (answers: Record<string, any>) => void
  onBack: () => void
}

export default function MCQExam({ assessment, onComplete, onBack }: MCQExamProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(assessment?.duration * 60 || 3600) // Convert minutes to seconds
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set())
  const [showSidebar, setShowSidebar] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const questions = assessment?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  
  useEffect(() => {
    // Enter fullscreen if required
    if (assessment?.fullscreenMode && !isFullscreen) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(() => {
        alert("Fullscreen mode is required for this assessment")
      })
    }

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete() // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Prevent right-click if configured
    const handleContextMenu = (e: MouseEvent) => {
      if (assessment?.rightClickDisable) {
        e.preventDefault()
      }
    }

    // Prevent copy/paste if configured
    const handleKeyDown = (e: KeyboardEvent) => {
      if (assessment?.copyPasteDetection && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'c' || e.key === 'v' || e.key === 'x') {
          e.preventDefault()
          alert("Copy/paste operations are disabled during this assessment")
        }
      }
    }

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (assessment?.tabSwitchDetection && document.hidden) {
        alert("Tab switching detected! This action has been logged.")
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [assessment])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleQuestionJump = (index: number) => {
    setCurrentQuestionIndex(index)
    setShowSidebar(false)
  }

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions)
    if (newFlagged.has(currentQuestionIndex)) {
      newFlagged.delete(currentQuestionIndex)
    } else {
      newFlagged.add(currentQuestionIndex)
    }
    setFlaggedQuestions(newFlagged)
  }

  const handleComplete = () => {
    if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen()
    }
    onComplete(answers)
  }

  const getQuestionStatus = (index: number) => {
    const question = questions[index]
    const hasAnswer = answers[question?.id]
    const isFlagged = flaggedQuestions.has(index)
    const isCurrent = index === currentQuestionIndex

    if (isCurrent) return 'current'
    if (hasAnswer && isFlagged) return 'answered-flagged'
    if (hasAnswer) return 'answered'
    if (isFlagged) return 'flagged'
    return 'unanswered'
  }

  const answeredCount = questions.filter((q: any) => answers[q.id]).length
  const progress = (answeredCount / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0d] via-[#1a1d21] to-[#0a0b0d] flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-xl border-b border-white/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">{assessment?.title}</h1>
              <Badge variant="outline" className="text-white border-white/30">
                MCQ Assessment
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                timeLeft < 300 ? 'bg-red-500/20 border border-red-500/50' : 'bg-white/10 border border-white/20'
              }`}>
                <Clock className="h-4 w-4 text-white" />
                <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {/* Question Navigator Toggle */}
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="outline"
                size="sm"
                className="rounded-xl border-white/20 text-white hover:bg-white/10"
              >
                <Eye className="h-4 w-4 mr-2" />
                Questions
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{answeredCount} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 p-6">
          {questions.length > 0 ? (
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Question {currentQuestionIndex + 1}
                      </Badge>
                      {currentQuestion?.marks && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {currentQuestion.marks} marks
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-lg leading-relaxed">
                      {currentQuestion?.question}
                    </CardTitle>
                  </div>
                  <Button
                    onClick={toggleFlag}
                    variant="ghost"
                    size="sm"
                    className={`rounded-xl ${
                      flaggedQuestions.has(currentQuestionIndex)
                        ? 'text-yellow-400 hover:text-yellow-300'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {currentQuestion?.options && (
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={handleAnswerChange}
                    className="space-y-3"
                  >
                    {Object.entries(currentQuestion.options).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 border border-white/10">
                        <RadioGroupItem 
                          value={key} 
                          id={key}
                          className="border-white/30 text-white"
                        />
                        <Label 
                          htmlFor={key} 
                          className="text-white cursor-pointer flex-1"
                        >
                          <span className="font-medium mr-2">{key.toUpperCase()}.</span>
                          {value}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Hints */}
                {currentQuestion?.hints && currentQuestion.hints.length > 0 && (
                  <Alert className="bg-blue-900/20 border-blue-500/50 mt-6">
                    <AlertDescription className="text-blue-200">
                      <strong>Hint:</strong> {currentQuestion.hints[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-white">
              <p>No questions available</p>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="bg-black/30 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="rounded-xl border-white/20 text-white hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleComplete}
                  className="rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white px-8"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete Assessment
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Navigator Sidebar */}
      {showSidebar && (
        <div className="w-80 bg-black/50 backdrop-blur-xl border-l border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Question Navigator</h3>
            <Button
              onClick={() => setShowSidebar(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 rounded-xl"
            >
              ×
            </Button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((_: any, index: number) => {
              const status = getQuestionStatus(index)
              let className = "w-10 h-10 rounded-lg border text-sm font-medium flex items-center justify-center cursor-pointer transition-colors "
              
              switch (status) {
                case 'current':
                  className += 'bg-blue-500 text-white border-blue-500'
                  break
                case 'answered-flagged':
                  className += 'bg-green-500 text-white border-green-500 relative'
                  break
                case 'answered':
                  className += 'bg-green-500/30 text-green-400 border-green-500/50'
                  break
                case 'flagged':
                  className += 'bg-yellow-500/30 text-yellow-400 border-yellow-500/50'
                  break
                default:
                  className += 'bg-white/5 text-white border-white/20 hover:bg-white/10'
              }

              return (
                <button
                  key={index}
                  onClick={() => handleQuestionJump(index)}
                  className={className}
                >
                  {index + 1}
                  {flaggedQuestions.has(index) && status !== 'current' && (
                    <Flag className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400" />
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/30 border border-green-500/50 rounded"></div>
              <span className="text-gray-300">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500/30 border border-yellow-500/50 rounded"></div>
              <span className="text-gray-300">Flagged</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white/5 border border-white/20 rounded"></div>
              <span className="text-gray-300">Not Visited</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
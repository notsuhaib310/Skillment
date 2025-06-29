"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Clock, Camera, AlertTriangle, Eye, Shield, ChevronRight, Mic } from "lucide-react"
import { sendProctoringEvent } from "@/lib/proctoring"

interface ProctoredExamProps {
  candidateData: any
  systemStatus: any
  onComplete?: (results: any) => void
}

export default function ProctoredExam({ candidateData, systemStatus, onComplete }: ProctoredExamProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes total
  const [questionTimeLeft, setQuestionTimeLeft] = useState(120) // Question timer
  const [violations, setViolations] = useState(0)
  const [violationLogs, setViolationLogs] = useState<string[]>([])
  const [showSummary, setShowSummary] = useState(false)
  const [examComplete, setExamComplete] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [savedAnswers, setSavedAnswers] = useState<Record<number, boolean>>({})

  // Use questions from assessment prop, fallback to []
  const questions = candidateData?.assignedAssessment?.questions || [];

  useEffect(() => {
    initializeUltraStrictProctoring()
    setQuestionTimeLeft(questions[0].timeLimit)
    return () => cleanup()
  }, [])

  useEffect(() => {
    setCurrentAnswer(answers[currentQuestion] || "")
  }, [currentQuestion, answers])

  const initializeUltraStrictProctoring = async () => {
    // Start camera immediately
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      addViolation("Camera/Microphone access failed")
    }

    // ULTRA-STRICT SECURITY MEASURES
    setupUltraStrictSecurity()
  }

  const setupUltraStrictSecurity = () => {
    // Block ALL keyboard shortcuts and function keys
    document.addEventListener(
      "keydown",
      (e) => {
        // Block ALL function keys (F1-F12)
        if (e.key.startsWith("F") && e.key.length <= 3) {
          e.preventDefault()
          e.stopPropagation()
          addViolation(`Function key ${e.key} blocked`)
          return false
        }

        // Block ALL Ctrl combinations
        if (e.ctrlKey) {
          e.preventDefault()
          e.stopPropagation()
          addViolation(`Ctrl+${e.key} shortcut blocked`)
          return false
        }

        // Block ALL Alt combinations
        if (e.altKey) {
          e.preventDefault()
          e.stopPropagation()
          addViolation(`Alt+${e.key} shortcut blocked`)
          return false
        }

        // Block Windows/Cmd key
        if (e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
          addViolation("System key blocked")
          return false
        }

        // Block specific dangerous keys
        const blockedKeys = ["F12", "F11", "F5", "F3", "PrintScreen", "Insert", "Delete"]
        if (blockedKeys.includes(e.key)) {
          e.preventDefault()
          e.stopPropagation()
          addViolation(`Dangerous key ${e.key} blocked`)
          return false
        }

        // Block Escape and F11 keys to prevent fullscreen exit
        if (e.key === "Escape" || e.key === "F11") {
          e.preventDefault()
          e.stopPropagation()
          addViolation(`${e.key} key blocked (fullscreen exit attempt)`)
          sendProctoringEvent("keyboard_violation", { key: e.key, reason: "Attempted to exit fullscreen" }, candidateData?.candidateId)
          return false
        }
      },
      true,
    )

    // Disable right-click completely
    document.addEventListener(
      "contextmenu",
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        addViolation("Right-click blocked")
        return false
      },
      true,
    )

    // Block text selection
    document.addEventListener(
      "selectstart",
      (e) => {
        e.preventDefault()
        return false
      },
      true,
    )

    // Block drag and drop
    document.addEventListener(
      "dragstart",
      (e) => {
        e.preventDefault()
        return false
      },
      true,
    )

    // Block copy/paste/cut
    document.addEventListener(
      "copy",
      (e) => {
        e.preventDefault()
        addViolation("Copy operation blocked")
        return false
      },
      true,
    )

    document.addEventListener(
      "paste",
      (e) => {
        e.preventDefault()
        addViolation("Paste operation blocked")
        return false
      },
      true,
    )

    document.addEventListener(
      "cut",
      (e) => {
        e.preventDefault()
        addViolation("Cut operation blocked")
        return false
      },
      true,
    )

    // Detect tab switching with ZERO tolerance
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        addViolation("Tab switch detected - CRITICAL")
        sendProctoringEvent("tab_switch", { reason: "Tab became hidden" }, candidateData?.candidateId)
        // Auto-submit after 2 tab switches
        if (violations >= 1) {
          submitExam(true, "Multiple tab switches detected")
        }
      }
    })

    // Force fullscreen maintenance
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        addViolation("Fullscreen exit detected")
        sendProctoringEvent("fullscreen_exit", { reason: "User exited fullscreen" }, candidateData?.candidateId)
        // Instantly force back to fullscreen (no delay)
        document.documentElement.requestFullscreen().catch(() => {
          submitExam(true, "Fullscreen exit violation")
        })
      }
    })

    // Block window focus loss
    window.addEventListener("blur", () => {
      addViolation("Window focus lost")
    })

    // Block window resizing
    window.addEventListener("resize", () => {
      addViolation("Window resize detected")
    })

    // Block browser extensions - Advanced detection
    const originalFetch = window.fetch
    window.fetch = function (...args) {
      const url = args[0]?.toString() || ""
      if (url.includes("chrome-extension://") || url.includes("moz-extension://") || url.includes("extension")) {
        addViolation("Extension activity detected")
        return Promise.reject(new Error("Extension blocked"))
      }
      return originalFetch.apply(this, args)
    }

    // Disable console completely
    Object.defineProperty(window, "console", {
      value: {},
      writable: false,
      configurable: false,
    })

    // Block developer tools detection
    const devtools = { open: false, orientation: null }
    const threshold = 160

    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true
          addViolation("Developer tools detected")
          submitExam(true, "Developer tools violation")
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // Monitor DOM changes for extension injection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as Element
              // Check for extension-injected elements
              if (
                element.id?.includes("extension") ||
                element.className?.includes("extension") ||
                element.getAttribute("data-extension") ||
                element.tagName?.toLowerCase().includes("extension")
              ) {
                addViolation("Extension injection detected")
                element.remove()
              }
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
    })

    // Block print functionality
    window.addEventListener("beforeprint", (e) => {
      e.preventDefault()
      addViolation("Print attempt blocked")
      return false
    })

    // Block save functionality
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        addViolation("Save attempt blocked")
        return false
      }
    })

    // Disable text selection via CSS
    document.body.style.userSelect = "none"
    document.body.style.webkitUserSelect = "none"

    // Block image saving
    document.addEventListener("dragstart", (e) => {
      if (e.target instanceof HTMLImageElement) {
        e.preventDefault()
        addViolation("Image drag blocked")
        return false
      }
    })
  }

  const addViolation = (reason: string) => {
    setViolations((prev) => prev + 1)
    setViolationLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${reason}`])

    // Auto-submit on critical violations
    if (violations >= 2) {
      submitExam(true, "Multiple security violations")
    }
  }

  // Total exam timer
  useEffect(() => {
    if (timeLeft > 0 && !examComplete) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            submitExam(true, "Time expired")
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeLeft, examComplete])

  // Question timer with auto-progression
  useEffect(() => {
    if (questionTimeLeft > 0 && !examComplete) {
      const timer = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            // Auto-move to next question when time expires
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion((prev) => prev + 1)
              setQuestionTimeLeft(questions[currentQuestion + 1].timeLimit)
            } else {
              submitExam(false, "All questions completed")
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [questionTimeLeft, currentQuestion, examComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))
  }

  const handleFillAnswerChange = (value: string) => {
    setCurrentAnswer(value)
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: value,
    }))
  }

  const saveAnswer = () => {
    if (currentAnswer.trim()) {
      setSavedAnswers((prev) => ({
        ...prev,
        [currentQuestion]: true,
      }))
      // Show brief confirmation
      const button = document.getElementById("save-btn")
      if (button) {
        button.textContent = "Saved!"
        setTimeout(() => {
          button.textContent = "Save Answer"
        }, 1000)
      }
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setQuestionTimeLeft(questions[currentQuestion + 1].timeLimit)
      setCurrentAnswer(answers[currentQuestion + 1] || "")
    } else {
      submitExam(false, "Exam completed")
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
      setQuestionTimeLeft(questions[currentQuestion - 1].timeLimit)
      setCurrentAnswer(answers[currentQuestion - 1] || "")
    }
  }

  const submitExam = (autoSubmit = false, reason = "") => {
    setExamComplete(true)

    const results = {
      candidateId: candidateData.candidateId,
      answers,
      violations,
      violationLogs,
      timeSpent: 30 * 60 - timeLeft,
      autoSubmit,
      reason,
      score: calculateScore(),
      totalQuestions: questions.length,
      timestamp: new Date().toISOString(),
    }

    cleanup()

    if (onComplete) {
      onComplete(results)
    } else {
      // Show results immediately if no onComplete handler
      alert(`Exam ${autoSubmit ? "auto-" : ""}submitted! Score: ${results.score}/${questions.length}`)
    }
  }

  const calculateScore = () => {
    const correctAnswers = {
      0: "Paris",
      1: "O(log n)",
      2: "push",
      3: "All of the above",
      4: "useState, useEffect",
      5: "Hyper Text Markup Language",
      6: "background-color",
      7: "Stack",
    }

    let score = 0
    Object.entries(answers).forEach(([questionIndex, answer]) => {
      const idx = Number(questionIndex)
      if (Object.prototype.hasOwnProperty.call(correctAnswers, idx)) {
        const correctAnswer = correctAnswers[idx as keyof typeof correctAnswers]
        if (questions[idx].type === "fill") {
          // For fill-in-the-blank, check if answer contains correct keywords
          const answerLower = answer.toLowerCase().trim()
          const correctLower = correctAnswer.toLowerCase()
          if (answerLower.includes(correctLower) || correctLower.includes(answerLower)) {
            score += questions[idx].marks
          }
        } else {
          // For MCQ, exact match
          if (correctAnswer === answer) {
            score += questions[idx].marks
          }
        }
      }
    })
    return score
  }

  const cleanup = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }

  const toggleSummary = () => {
    setShowSummary(!showSummary)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const answeredCount = Object.keys(answers).length

  // Get question timer color based on remaining time
  const getTimerColor = (timeLeft: number, totalTime: number) => {
    const percentage = (timeLeft / totalTime) * 100
    if (percentage > 50) return "text-green-400"
    if (percentage > 25) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      {/* Ultra-Secure Header */}
      <div className="bg-[#1a1d21] border-b border-[#2a2d31] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-lg font-semibold">Skillment Assessment</h1>
            <Badge className="bg-red-900/30 text-red-400 border-red-500/30">
              <Shield className="w-3 h-3 mr-1" />
              Ultra Secure
            </Badge>
          </div>

          <div className="flex items-center space-x-6">
            {/* Total Timer */}
            <div className="flex items-center space-x-2 bg-red-900/30 border border-red-500/30 px-3 py-1 rounded">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="font-mono font-bold text-red-400">{formatTime(timeLeft)}</span>
            </div>

            {/* Question Timer */}
            <div className="flex items-center space-x-2 bg-orange-900/30 border border-orange-500/30 px-3 py-1 rounded">
              <Clock className="w-4 h-4 text-orange-400" />
              <span
                className={`font-mono font-bold ${getTimerColor(questionTimeLeft, questions[currentQuestion].timeLimit)}`}
              >
                {formatTime(questionTimeLeft)}
              </span>
            </div>

            {/* Violations Counter */}
            {violations > 0 && (
              <div className="flex items-center space-x-2 bg-yellow-900/30 border border-yellow-500/30 px-3 py-1 rounded">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{violations}</span>
              </div>
            )}

            {/* Live Monitoring */}
            <div className="flex items-center space-x-2 bg-green-900/30 border border-green-500/30 px-3 py-1 rounded">
              <Camera className="w-4 h-4 text-green-400" />
              <Eye className="w-4 h-4 text-green-400" />
              <Mic className="w-4 h-4 text-green-400" />
            </div>

            {/* Summary Button */}
            <Button
              onClick={toggleSummary}
              variant="outline"
              size="sm"
              className="border-[#2a2d31] text-gray-300 hover:bg-[#2a2d31]"
            >
              Summary
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-400">{answeredCount} answered</span>
            </div>
            <Progress value={progress} className="h-2 bg-[#2a2d31]" />
          </div>

          {/* Security Warnings */}
          {violations > 0 && (
            <Alert className="mb-6 bg-red-900/20 border-red-500/50">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                <strong>Security Alert:</strong> {violations} violation(s) detected.
                {violations >= 2 && " Exam will auto-submit on next violation."}
              </AlertDescription>
            </Alert>
          )}

          {/* Question Card */}
          <Card className="bg-[#1a1d21] border-[#2a2d31]">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Question {currentQuestion + 1}</h2>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Time Remaining</div>
                  <div
                    className={`text-xl font-mono font-bold ${getTimerColor(questionTimeLeft, questions[currentQuestion].timeLimit)}`}
                  >
                    {formatTime(questionTimeLeft)}
                  </div>
                  <div className="text-xs text-gray-500">Marks: {questions[currentQuestion].marks}</div>
                </div>
              </div>

              <p className="text-xl text-gray-200 mb-8">{questions[currentQuestion].question}</p>

              {questions[currentQuestion].type === "mcq" ? (
                <RadioGroup
                  value={answers[currentQuestion] || ""}
                  onValueChange={handleAnswerChange}
                  className="space-y-4"
                >
                  {questions[currentQuestion].options?.map((option: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-[#2a2d31] hover:border-[#ff4d00]/30 hover:bg-[#ff4d00]/5 transition-colors cursor-pointer"
                    >
                      <RadioGroupItem
                        value={typeof option === 'string' ? option : option.text}
                        id={`option-${index}`}
                        className="border-gray-500 text-[#ff4d00]"
                      />
                      <Label htmlFor={`option-${index}`} className="flex-1 text-gray-200 cursor-pointer text-lg">
                        {typeof option === 'string' ? option : option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={currentAnswer}
                      onChange={(e) => handleFillAnswerChange(e.target.value)}
                      placeholder={questions[currentQuestion].placeholder}
                      className="w-full p-4 bg-[#2a2d31] border border-[#3a3d41] rounded-lg text-white placeholder-gray-400 focus:border-[#ff4d00] focus:outline-none text-lg"
                    />
                    {savedAnswers[currentQuestion] && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Badge className="bg-green-900/30 text-green-400 border-green-500/30 text-xs">Saved</Badge>
                      </div>
                    )}
                  </div>
                  <Button
                    id="save-btn"
                    onClick={saveAnswer}
                    variant="outline"
                    className="border-[#ff4d00] text-[#ff4d00] hover:bg-[#ff4d00]/10"
                  >
                    Save Answer
                  </Button>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  className="border-[#2a2d31] text-gray-300 hover:bg-[#2a2d31] disabled:opacity-50"
                >
                  Previous
                </Button>

                <div className="flex space-x-3">
                  {questions[currentQuestion].type === "fill" && (
                    <Button
                      onClick={saveAnswer}
                      variant="outline"
                      className="border-[#ff4d00] text-[#ff4d00] hover:bg-[#ff4d00]/10"
                    >
                      Save & Continue
                    </Button>
                  )}
                  <Button
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white px-8 py-3"
                  >
                    {currentQuestion === questions.length - 1 ? "Finish Exam" : "Next Question"}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monitoring Sidebar */}
        <div className="w-80 bg-[#1a1d21] border-l border-[#2a2d31] p-4">
          {/* Live Camera */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Live Monitoring</h3>
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-32 bg-[#0a0b0d] rounded object-cover border border-[#2a2d31]"
            />
            <div className="mt-2 text-xs text-green-400 text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              AI Monitoring Active
            </div>
          </div>

          {/* Question Navigator */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Questions</h3>
            <div className="grid grid-cols-3 gap-2">
              {questions.map((question: any, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestion(index)
                    setQuestionTimeLeft(questions[index].timeLimit)
                  }}
                  className={`w-12 h-12 rounded text-sm font-medium transition-colors relative ${
                    index === currentQuestion
                      ? "bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] text-white"
                      : answers[index]
                        ? question.type === "fill"
                          ? "bg-blue-600 text-white"
                          : "bg-green-600 text-white"
                        : "bg-[#2a2d31] text-gray-300"
                  }`}
                >
                  {index + 1}
                  {question.type === "fill" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-[#0a0b0d] p-4 rounded border border-[#2a2d31] mb-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Security Status</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Extensions</span>
                <Badge className="bg-red-900/30 text-red-400 border-red-500/30 text-xs">Blocked</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Shortcuts</span>
                <Badge className="bg-red-900/30 text-red-400 border-red-500/30 text-xs">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Developer Tools</span>
                <Badge className="bg-red-900/30 text-red-400 border-red-500/30 text-xs">Blocked</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Violations</span>
                <Badge
                  className={`${violations > 0 ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/30" : "bg-green-900/30 text-green-400 border-green-500/30"} text-xs`}
                >
                  {violations}
                </Badge>
              </div>
            </div>
          </div>

          {/* Recent Violations */}
          {violationLogs.length > 0 && (
            <div className="bg-[#0a0b0d] p-4 rounded border border-[#2a2d31]">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Security Alerts</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {violationLogs
                  .slice(-5)
                  .reverse()
                  .map((log: string, index: number) => (
                    <div key={index} className="text-xs text-red-400">
                      {log}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unstop-Style Question Summary Sidebar */}
      {showSummary && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Question Summary</h2>
              <div className="text-sm text-gray-600">Time Left: {formatTime(timeLeft)}</div>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">You have gone through all the questions.</p>
                  <p>Either browse through them once again or Finish your assessment.</p>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="mb-6 text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${(answeredCount / questions.length) * 100}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
                    <div className="text-xs text-gray-600">Total Questions</div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-700">Answered & Submitted: {answeredCount}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded"></div>
                  <span className="text-gray-700">Skipped: {questions.length - answeredCount}</span>
                </div>
              </div>
            </div>

            {/* Status of Questions */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Status of Questions</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestion(index)
                      setQuestionTimeLeft(questions[index].timeLimit)
                      setShowSummary(false)
                    }}
                    className={`w-10 h-10 rounded text-sm font-medium ${
                      answers[index] ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button onClick={toggleSummary} variant="outline" className="flex-1">
                Close
              </Button>
              <Button
                onClick={() => submitExam(false, "Manual submission")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

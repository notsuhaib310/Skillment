"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Clock,
  Camera,
  AlertTriangle,
  Eye,
  Shield,
  Mic,
  Play,
  Square,
  CheckCircle,
  Code,
  FileText,
  TestTube,
  ZoomIn,
  ZoomOut,
  Check,
  X,
  Lock,
  Unlock,
  Skull,
  Ban,
} from "lucide-react"
import { sendProctoringEvent } from "@/lib/proctoring"
import { useFullscreenEnforcement } from "@/hooks/use-fullscreen-enforcement"
import { useDefensiveProctoring } from "@/hooks/use-defensive-proctoring"
import DefensiveViolationOverlay from "./defensive-violation-overlay"

interface CodingExamProps {
  candidateData: any
  systemStatus?: any
  assessment: any
  onComplete?: (results: any) => void
}

interface TestCase {
  id: number
  type: "public" | "private"
  input: string
  expectedOutput: string
  actualOutput?: string
  status?: "passed" | "failed" | "pending" | "running"
  runtime?: number
  memory?: number
  visible: boolean
}

interface CodingProblem {
  id: number
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  description: string
  examples: Array<{
    input: string
    output: string
    explanation?: string
  }>
  constraints: string[]
  testCases: TestCase[]
  starterCode: {
    [key: string]: string
  }
  timeLimit: number
  marks: number
}

interface Violation {
  id: number
  type: "critical" | "warning" | "minor"
  message: string
  timestamp: Date
  action: string
}

export default function CodingExam({ candidateData, systemStatus, assessment, onComplete }: CodingExamProps) {
  const [currentProblem, setCurrentProblem] = useState(0)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [problemTimeLeft, setProblemTimeLeft] = useState(0)
  const [violations, setViolations] = useState<Violation[]>([])
  const [violationLogs, setViolationLogs] = useState<string[]>([])
  const [examComplete, setExamComplete] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testResults, setTestResults] = useState<TestCase[]>([])
  const [fontSize, setFontSize] = useState(14)
  const [activeTab, setActiveTab] = useState<"description" | "submissions">("description")
  const [submissions, setSubmissions] = useState<any[]>([])
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [editorLoaded, setEditorLoaded] = useState(false)

  // Advanced Proctoring States
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fullscreenViolations, setFullscreenViolations] = useState(0)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [focusLossCount, setFocusLossCount] = useState(0)
  const [showCriticalWarning, setShowCriticalWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")
  const [suspiciousActivity, setSuspiciousActivity] = useState<string[]>([])
  const [mouseOutsideCount, setMouseOutsideCount] = useState(0)
  const [keyboardViolations, setKeyboardViolations] = useState(0)
  const [audioViolations, setAudioViolations] = useState(0)
  const [faceDetectionActive, setFaceDetectionActive] = useState(false)
  const [eyeTrackingActive, setEyeTrackingActive] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<any>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const fullscreenTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [windowTooSmall, setWindowTooSmall] = useState(false)
  const [tabInactive, setTabInactive] = useState(false)
  const [notFullscreen, setNotFullscreen] = useState(false)
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false)

  // Use the fullscreen enforcement hook
  const { enforceFullscreen, exitFullscreen, isFullscreen: checkFullscreen } = useFullscreenEnforcement({
    enforceOnMount: true,
    blockEscapeKey: true,
    monitorVisibility: true,
    retryDelay: 50
  });

  // Use the defensive proctoring system
  const { 
    violationState, 
    violationCount, 
    dismissViolation, 
    setExamActive 
  } = useDefensiveProctoring({
    onViolation: (violation: string) => {
      console.warn('Coding Exam Violation:', violation);
      addViolation("warning", violation, "Logged");
    },
    onCriticalViolation: (violation: string) => {
      console.error('Coding Exam Critical Violation:', violation);
      addViolation("critical", violation, "Enhanced Monitoring");
      
      // Auto-submit on 3+ critical violations
      if (violationCount >= 2) {
        setTimeout(() => {
          submitExam(true, `Multiple critical violations: ${violation}`);
        }, 3000);
      }
    },
    candidateId: candidateData?.candidateId,
    assessmentTitle: assessment?.title
  });

  // Map backend questions to CodingProblem format expected by the UI
  const problems = (assessment?.questions || []).map((q: any, idx: number) => {
    // Handle both new format (with codingData) and legacy format
    const codingData = q.codingData || q;
    
    return {
    id: q.id || idx + 1,
      title: codingData.title || codingData.question || `Problem ${idx + 1}`,
      description: codingData.description || codingData.explanation || codingData.question || 'Solve this coding problem',
      difficulty: codingData.difficulty || 'Medium',
      examples: codingData.examples || [
        {
          input: "Sample input will be provided",
          output: "Expected output",
          explanation: "Explanation of the example"
        }
      ],
      constraints: codingData.constraints || codingData.hints || [
        "Read the problem statement carefully",
        "Consider edge cases",
        "Optimize your solution"
      ],
      testCases: (codingData.testCases || []).map((tc: any, tcIdx: number) => ({
        id: tcIdx + 1,
        type: tc.isPublic ? "public" : "private",
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || tc.output || "",
        actualOutput: undefined,
        status: "pending" as const,
        runtime: undefined,
        memory: undefined,
        visible: tc.isPublic || false
      })),
      starterCode: codingData.starterCode || {
        javascript: '// Write your solution here\nfunction solution(input) {\n    // Your code here\n    return result;\n}',
        python: '# Write your solution here\ndef solution(input):\n    # Your code here\n    return result',
        java: '// Write your solution here\npublic class Solution {\n    public String solution(String input) {\n        // Your code here\n        return result;\n    }\n}',
        cpp: '// Write your solution here\n#include <iostream>\n#include <string>\nusing namespace std;\n\nstring solution(string input) {\n    // Your code here\n    return result;\n}'
      },
      timeLimit: codingData.timeLimit || assessment?.duration || 30,
      marks: codingData.marks || q.marks || 1,
    };
  });
  
  console.log('Formatted coding problems:', problems);

  const languages = [
    { id: "javascript", name: "JavaScript", monacoId: "javascript" },
    { id: "python", name: "Python", monacoId: "python" },
    { id: "java", name: "Java", monacoId: "java" },
    { id: "cpp", name: "C++", monacoId: "cpp" },
  ]

  useEffect(() => {
    if (problems.length > 0) {
    initializeUltraStrictProctoring()
    setProblemTimeLeft(problems[0].timeLimit * 60)
    setCode(problems[0].starterCode[language])
    setTestResults(problems[0].testCases)
    }
    return () => cleanup()
  }, [problems.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeMonacoEditor()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (problems.length > 0 && problems[currentProblem]) {
    setCode(problems[currentProblem].starterCode[language])
    setTestResults(problems[currentProblem].testCases)
    }
  }, [currentProblem, language, problems.length])

  const initializeMonacoEditor = async () => {
    if (editorRef.current && !monacoEditorRef.current) {
      try {
        // Import Monaco Editor dynamically
        const monaco = await import("monaco-editor")

        // Configure Monaco Editor theme
        monaco.editor.defineTheme("coding-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "6A9955", fontStyle: "italic" },
            { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
            { token: "string", foreground: "CE9178" },
            { token: "number", foreground: "B5CEA8" },
            { token: "type", foreground: "4EC9B0" },
            { token: "function", foreground: "DCDCAA" },
            { token: "variable", foreground: "9CDCFE" },
            { token: "operator", foreground: "D4D4D4" },
            { token: "delimiter", foreground: "D4D4D4" },
            { token: "identifier", foreground: "9CDCFE" },
            { token: "class", foreground: "4EC9B0" },
          ],
          colors: {
            "editor.background": "#1e1e1e",
            "editor.foreground": "#d4d4d4",
            "editorLineNumber.foreground": "#858585",
            "editorLineNumber.activeForeground": "#ff6b35",
            "editor.selectionBackground": "#264f78",
            "editor.lineHighlightBackground": "#2a2d31",
            "editorCursor.foreground": "#ff6b35",
            "editor.selectionHighlightBackground": "#add6ff26",
            "editorIndentGuide.background": "#404040",
            "editorIndentGuide.activeBackground": "#ff6b35",
            "editorBracketMatch.background": "#0064001a",
            "editorBracketMatch.border": "#ff6b35",
            "scrollbar.shadow": "#000000",
            "scrollbarSlider.background": "#79797966",
            "scrollbarSlider.hoverBackground": "#646464b3",
            "scrollbarSlider.activeBackground": "#bfbfbf66",
          },
        })

        // Clear container
        editorRef.current.innerHTML = ""

        // Create editor
        monacoEditorRef.current = monaco.editor.create(editorRef.current, {
          value: code,
          language: languages.find((l) => l.id === language)?.monacoId || "javascript",
          theme: "coding-dark",
          fontSize: fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: "off",
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          renderLineHighlight: "line",
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: "line",
          cursorWidth: 2,
          cursorBlinking: "blink",
          folding: true,
          foldingHighlight: true,
          showFoldingControls: "always",
          contextmenu: false,
          mouseWheelZoom: false,
          smoothScrolling: false,
          renderWhitespace: "none",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          scrollbar: {
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
            useShadows: false,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
        })

        // Set up change listener
        monacoEditorRef.current.onDidChangeModelContent(() => {
          if (monacoEditorRef.current) {
            const newValue = monacoEditorRef.current.getValue()
            setCode(newValue)
          }
        })

        // Force layout and focus
        setTimeout(() => {
          if (monacoEditorRef.current) {
            monacoEditorRef.current.layout()
            monacoEditorRef.current.focus()
            setEditorLoaded(true)
          }
        }, 100)
      } catch (error: any) {
        console.error("Failed to initialize Monaco Editor:", error)
        setConsoleOutput((prev) => [...prev, `Editor Error: ${error.message}`])
      }
    }
  }

  const initializeUltraStrictProctoring = async () => {
    try {
      // Initialize camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Initialize audio monitoring
      await initializeAudioMonitoring(stream)

      // Initialize face detection
      initializeFaceDetection()

      // Initialize eye tracking
      initializeEyeTracking()
    } catch (error: any) {
      addViolation("critical", "Camera/Microphone access failed", "System access denied")
    }

    // Setup ultra-strict security
    setupUltraStrictSecurity()
  }

  const initializeAudioMonitoring = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext()
      const analyser = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)

      source.connect(analyser)
      analyser.fftSize = 256

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length

        // Detect suspicious audio patterns
        if (average > 50) {
          setAudioViolations((prev) => prev + 1)
          if (audioViolations > 5) {
            addViolation("warning", "Suspicious audio activity detected", "Multiple voices detected")
          }
        }

        requestAnimationFrame(checkAudioLevel)
      }

      checkAudioLevel()
    } catch (error: any) {
      addViolation("warning", "Audio monitoring failed", "Audio analysis disabled")
    }
  }

  const initializeFaceDetection = () => {
    // Simulate face detection
    setFaceDetectionActive(true)

    setInterval(() => {
      // Simulate face detection analysis
      const faceCount = Math.random() > 0.95 ? 2 : 1 // 5% chance of multiple faces

      if (faceCount > 1) {
        addViolation("critical", "Multiple faces detected", "Identity verification failed")
      }
    }, 5000)
  }

  const initializeEyeTracking = () => {
    // Simulate eye tracking
    setEyeTrackingActive(true)

    setInterval(() => {
      // Simulate eye tracking analysis
      const lookingAway = Math.random() > 0.9 // 10% chance of looking away

      if (lookingAway) {
        addViolation("minor", "Candidate looking away from screen", "Attention monitoring")
      }
    }, 3000)
  }

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch (error: any) {
      addViolation("critical", "Failed to enter fullscreen", "Fullscreen enforcement failed")
    }
  }

  const setupUltraStrictSecurity = () => {
    // Disable text selection globally
    document.body.style.userSelect = "none"
    document.body.style.webkitUserSelect = "none"

    // Block all keyboard shortcuts except essential coding ones
    document.addEventListener(
      "keydown",
      (e) => {
        // Block function keys
        if (e.key.startsWith("F") && e.key.length <= 3) {
          e.preventDefault()
          e.stopPropagation()
          setKeyboardViolations((prev) => prev + 1)
          addViolation("warning", `Function key ${e.key} blocked`, "Unauthorized shortcut")
          return false
        }

        // Block dangerous Ctrl combinations
        if (e.ctrlKey) {
          const allowedKeys = ["c", "v", "x", "z", "y", "a", "s", "f"] // Essential coding shortcuts
          if (!allowedKeys.includes(e.key.toLowerCase())) {
            e.preventDefault()
            e.stopPropagation()
            setKeyboardViolations((prev) => prev + 1)
            addViolation("warning", `Ctrl+${e.key} blocked`, "Unauthorized shortcut")
            return false
          }
        }

        // Block Alt combinations
        if (e.altKey) {
          e.preventDefault()
          e.stopPropagation()
          setKeyboardViolations((prev) => prev + 1)
          addViolation("warning", `Alt+${e.key} blocked`, "Unauthorized shortcut")
          return false
        }

        // Block Windows/Cmd key
        if (e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
          setKeyboardViolations((prev) => prev + 1)
          addViolation("critical", "System key blocked", "OS access attempt")
          return false
        }

        // Block Escape and F11 keys to prevent fullscreen exit
        if (e.key === "Escape" || e.key === "F11") {
          e.preventDefault()
          e.stopPropagation()
          addViolation("critical", `${e.key} key blocked (fullscreen exit attempt)`, "Fullscreen enforcement")
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
        addViolation("minor", "Right-click blocked", "Context menu attempt")
        sendProctoringEvent("right_click_blocked", {}, candidateData?.candidateId)
        return false
      },
      true,
    )

    // Ultra-strict fullscreen monitoring - only warn after initial entry
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        if (isFullscreen) {
          setIsFullscreen(false)
          setFullscreenViolations((prev) => prev + 1)
          addViolation("critical", "Fullscreen exit detected", "Security breach")
          sendProctoringEvent("fullscreen_exit", { reason: "User exited fullscreen" }, candidateData?.candidateId)
          // Instantly force back to fullscreen (no delay)
          enterFullscreen().catch(() => {
            submitExam(true, "Fullscreen exit violation")
          })
        }
      } else {
        setIsFullscreen(true)
      }
    })

    // Tab switching detection with zero tolerance
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1)
        addViolation("critical", "Tab switch detected", "Navigation violation")
        sendProctoringEvent("tab_switch", { reason: "Tab became hidden" }, candidateData?.candidateId)

        // Show critical warning after 2 tab switches
        if (tabSwitchCount >= 2) {
          showCriticalWarningPopup(
            "CRITICAL: Tab switching detected! This is your final warning before auto-submission.",
          )
        }

        // Auto-submit after 3 tab switches
        if (tabSwitchCount >= 3) {
          submitExam(true, "Multiple tab switching violations")
        }
      }
    })

    // Window focus monitoring
    window.addEventListener("blur", () => {
      setFocusLossCount((prev) => prev + 1)
      addViolation("warning", "Window focus lost", "Attention violation")
      sendProctoringEvent("window_blur", {}, candidateData?.candidateId)

      if (focusLossCount >= 5) {
        showCriticalWarningPopup("WARNING: Multiple focus loss events detected. Please keep the exam window active.")
      }
    })

    // Mouse movement monitoring
    document.addEventListener("mousemove", (e) => {
      const examArea = document.body.getBoundingClientRect()

      // Check if mouse is outside exam area
      if (e.clientX < 0 || e.clientY < 0 || e.clientX > examArea.width || e.clientY > examArea.height) {
        setMouseOutsideCount((prev) => prev + 1)

        if (mouseOutsideCount > 20) {
          // Allow some tolerance
          addViolation("minor", "Mouse outside exam area", "Attention monitoring")
          setMouseOutsideCount(0) // Reset counter
        }
      }
    })

    // Clipboard monitoring
    document.addEventListener("copy", (e) => {
      e.preventDefault();
      addViolation("minor", "Copy operation blocked", "Content protection");
      sendProctoringEvent("copy_blocked", {}, candidateData?.candidateId);
      return false;
    }, true);

    document.addEventListener("paste", (e) => {
      e.preventDefault();
      addViolation("minor", "Paste operation blocked", "Content protection");
      sendProctoringEvent("paste_blocked", {}, candidateData?.candidateId);
      return false;
    }, true);

    document.addEventListener("cut", (e) => {
      e.preventDefault();
      addViolation("minor", "Cut operation blocked", "Content protection");
      sendProctoringEvent("cut_blocked", {}, candidateData?.candidateId);
      return false;
    }, true);

    // Developer tools detection
    const devtools = { open: false };
    const threshold = 160;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          addViolation("critical", "Developer tools detected", "Security breach");
          sendProctoringEvent("devtools_open", {}, candidateData?.candidateId);
        }
      } else {
        devtools.open = false;
      }
    }, 1000);

    // Disable drag and drop
    document.addEventListener(
      "dragstart",
      (e) => {
        e.preventDefault()
        addViolation("minor", "Drag operation blocked", "Content protection")
        sendProctoringEvent("drag_blocked", {}, candidateData?.candidateId)
        return false
      },
      true,
    )

    // Disable print
    window.addEventListener("beforeprint", (e) => {
      e.preventDefault()
      addViolation("warning", "Print attempt blocked", "Content protection")
      sendProctoringEvent("print_blocked", {}, candidateData?.candidateId)
      return false
    })

    // Select
    document.addEventListener("selectstart", (e) => {
      e.preventDefault();
      sendProctoringEvent("select_blocked", {}, candidateData?.candidateId);
      return false;
    }, true);

    // Window resize
    window.addEventListener("resize", () => {
      addViolation("warning", "Window resize detected", "Resize event");
      sendProctoringEvent("window_resize", { width: window.innerWidth, height: window.innerHeight }, candidateData?.candidateId);
    });

    // Window focus
    window.addEventListener("focus", () => {
      sendProctoringEvent("window_focus", {}, candidateData?.candidateId);
    });
  }

  const addViolation = (type: "critical" | "warning" | "minor", message: string, action: string) => {
    const violation: Violation = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
      action,
    }

    setViolations((prev) => [...prev, violation])
    setViolationLogs((prev) => [...prev, `${violation.timestamp.toLocaleTimeString()}: ${message}`])

    // Add to suspicious activity
    setSuspiciousActivity((prev) => [...prev.slice(-10), `${type.toUpperCase()}: ${message}`])

    // Auto-submit on critical violations
    const criticalCount = violations.filter((v) => v.type === "critical").length + (type === "critical" ? 1 : 0)

    if (criticalCount >= 5) {
      submitExam(true, "Multiple critical security violations")
    }
  }

  const showCriticalWarningPopup = (message: string) => {
    setWarningMessage(message)
    setShowCriticalWarning(true)

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowCriticalWarning(false)
    }, 5000)
  }

  // Timers
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

  useEffect(() => {
    if (problemTimeLeft > 0 && !examComplete) {
      const timer = setInterval(() => {
        setProblemTimeLeft((prev) => {
          if (prev <= 1) {
            if (currentProblem < problems.length - 1) {
              setCurrentProblem((prev) => prev + 1)
              setProblemTimeLeft(problems[currentProblem + 1].timeLimit * 60)
            } else {
              submitExam(false, "All problems completed")
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [problemTimeLeft, currentProblem, examComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const runCode = async () => {
    setIsRunning(true)
    setConsoleOutput(["Compiling and running code..."])

    // Reset test results to running state
    setTestResults((prev) =>
      prev.map((test) => ({
        ...test,
        status: "running" as const,
        actualOutput: undefined,
        runtime: undefined,
        memory: undefined,
      })),
    )

    try {
      const languageMap = {
        javascript: 63, // Node.js
        python: 71, // Python 3
        java: 62, // Java
        cpp: 54, // C++
      }

      const languageId = languageMap[language as keyof typeof languageMap]

      // Run all test cases
      const testCases = problems[currentProblem].testCases
      const results: any[] = []

      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i]

        setConsoleOutput((prev) => [...prev, `Running test case ${i + 1}/${testCases.length}...`])

        try {
          // Create submission
          const submission = await fetch("https://judge0.skillment.in/submissions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Host": "judge0.skillment.in",
            },
            body: JSON.stringify({
              source_code: btoa(code),
              language_id: languageId,
              stdin: btoa(testCase.input),
              expected_output: btoa(testCase.expectedOutput),
            }),
          })

          const submissionData = await submission.json()
          const token = submissionData.token

          // Poll for results
          let attempts = 0
          const maxAttempts = 30

          const pollResults = async (): Promise<any> => {
            const result = await fetch(`https://judge0.skillment.in/submissions/${token}`, {
              headers: {
                "X-RapidAPI-Host": "judge0.skillment.in",
              },
            })

            const resultData = await result.json()

            if (resultData.status.id <= 2 && attempts < maxAttempts) {
              attempts++
              await new Promise((resolve) => setTimeout(resolve, 1000))
              return pollResults()
            }

            return resultData
          }

          const resultData = await pollResults()

          const output = resultData.stdout ? atob(resultData.stdout) : ""
          const error = resultData.stderr ? atob(resultData.stderr) : ""
          const status = resultData.status.description

          const testResult = {
            ...testCase,
            actualOutput: output || error || "No output",
            status: output.trim() === testCase.expectedOutput.trim() ? ("passed" as const) : ("failed" as const),
            runtime: resultData.time || 0,
            memory: resultData.memory || 0,
          }

          results.push(testResult)

          // Update individual test case result
          setTestResults((prev) => prev.map((test, index) => (index === i ? testResult : test)))

          setConsoleOutput((prev) => [
            ...prev,
            `Test Case ${i + 1}: ${testResult.status.toUpperCase()}`,
            testCase.type === "public" ? `Input: ${testCase.input}` : `Input: [Hidden]`,
            testCase.type === "public" ? `Expected: ${testCase.expectedOutput}` : `Expected: [Hidden]`,
            testCase.type === "public" ? `Got: ${output || "No output"}` : `Got: [Hidden]`,
            `Runtime: ${resultData.time || 0}ms, Memory: ${resultData.memory || 0}KB`,
            "",
          ])
        } catch (error: any) {
          const testResult = {
            ...testCase,
            actualOutput: `Error: ${error.message}`,
            status: "failed" as const,
            runtime: 0,
            memory: 0,
          }

          results.push(testResult)

          setTestResults((prev) => prev.map((test, index) => (index === i ? testResult : test)))

          setConsoleOutput((prev) => [...prev, `Test Case ${i + 1}: ERROR - ${error.message}`, ""])
        }
      }

      const passedCount = results.filter((r) => r.status === "passed").length
      const totalCount = results.length

      setConsoleOutput((prev) => [
        ...prev,
        "=".repeat(50),
        `SUMMARY: ${passedCount}/${totalCount} test cases passed`,
        `Public Tests: ${results.filter((r) => r.type === "public" && r.status === "passed").length}/${results.filter((r) => r.type === "public").length} passed`,
        `Private Tests: ${results.filter((r) => r.type === "private" && r.status === "passed").length}/${results.filter((r) => r.type === "private").length} passed`,
        "=".repeat(50),
      ])

      setIsRunning(false)
    } catch (error: any) {
      setConsoleOutput((prev) => [...prev, `Compilation Error: ${error.message}`])
      setIsRunning(false)
    }
  }

  const submitCode = async () => {
    setIsSubmitting(true)

    // Run all test cases first
    await runCode()

    setTimeout(() => {
      const passedTests = testResults.filter((test) => test.status === "passed").length
      const totalTests = testResults.length
      const score = Math.round((passedTests / totalTests) * 100)

      const submission = {
        id: submissions.length + 1,
        timestamp: new Date().toISOString(),
        status: score >= 70 ? "Accepted" : "Partial",
        score: score,
        passedTests: passedTests,
        totalTests: totalTests,
        runtime: Math.max(...testResults.map((t) => t.runtime || 0)),
        memory: Math.max(...testResults.map((t) => t.memory || 0)),
        language: language,
        code: code,
      }

      setSubmissions((prev) => [submission, ...prev])
      setConsoleOutput((prev) => [
        ...prev,
        "",
        `✅ Solution ${submission.status}!`,
        `Score: ${submission.score}%`,
        `Tests Passed: ${submission.passedTests}/${submission.totalTests}`,
        `Runtime: ${submission.runtime}ms`,
        `Memory: ${submission.memory}KB`,
      ])
      setIsSubmitting(false)

      // Move to next problem or complete exam
      if (currentProblem < problems.length - 1) {
        setTimeout(() => {
          setCurrentProblem((prev) => prev + 1)
          setProblemTimeLeft(problems[currentProblem + 1].timeLimit * 60)
        }, 2000)
      } else {
        setTimeout(() => {
          submitExam(false, "All problems completed")
        }, 2000)
      }
    }, 1000)
  }

  const submitExam = (autoSubmit = false, reason = "") => {
    setExamComplete(true)

    const results = {
      candidateId: candidateData.candidateId,
      assessmentId: candidateData.assessmentId,
      answers: submissions.map((sub, idx) => ({
        questionId: problems[idx]?.id || `problem-${idx}`,
        answer: sub.code,
        timeSpent: sub.runtime || 0,
        language: sub.language,
        score: sub.score || 0
      })),
      submissions,
      violations: violations,
      violationLogs,
      suspiciousActivity,
      proctoring: {
        fullscreenViolations,
        tabSwitchCount,
        focusLossCount,
        keyboardViolations,
        audioViolations,
        faceDetectionActive,
        eyeTrackingActive,
      },
      totalTimeSpent: 60 * 60 - timeLeft,
      autoSubmit,
      reason,
      problemsCompleted: currentProblem + 1,
      totalProblems: problems.length,
      timestamp: new Date().toISOString(),
    }

    cleanup()

    if (onComplete) {
      onComplete(results)
    }
  }

  const cleanup = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    if (monacoEditorRef.current) {
      monacoEditorRef.current.dispose()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    if (fullscreenTimeoutRef.current) {
      clearTimeout(fullscreenTimeoutRef.current)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-400 bg-green-900/30 border-green-500/30"
      case "Medium":
        return "text-yellow-400 bg-yellow-900/30 border-yellow-500/30"
      case "Hard":
        return "text-red-400 bg-red-900/30 border-red-500/30"
      default:
        return "text-gray-400 bg-gray-900/30 border-gray-500/30"
    }
  }

  const getViolationColor = (type: string) => {
    switch (type) {
      case "critical":
        return "text-red-400"
      case "warning":
        return "text-yellow-400"
      case "minor":
        return "text-blue-400"
      default:
        return "text-gray-400"
    }
  }

  const progress = problems.length > 0 ? ((currentProblem + 1) / problems.length) * 100 : 0
  const criticalViolations = violations.filter((v) => v.type === "critical").length
  const warningViolations = violations.filter((v) => v.type === "warning").length
  
  // Show error state if no problems are available
  if (problems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0b0d] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Coding Problems Available</h2>
          <p className="text-gray-400">Please contact support if this is unexpected.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (monacoEditorRef.current) {
      const monaco = require("monaco-editor")
      const model = monacoEditorRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, languages.find((l) => l.id === language)?.monacoId || "javascript")
      }
    }
  }, [language])

  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({ fontSize })
      setTimeout(() => {
        if (monacoEditorRef.current) {
          monacoEditorRef.current.layout()
        }
      }, 100)
    }
  }, [fontSize])

  // Monitor fullscreen state for UI blocking
  useEffect(() => {
    const checkFullscreenState = () => {
      const fullscreenActive = !!document.fullscreenElement;
      setIsFullscreen(fullscreenActive);
      
      if (!fullscreenActive && !examComplete) {
        // Not in fullscreen and exam is active
        setFullscreenBlocked(true);
        setNotFullscreen(true);
        
        // Try to force fullscreen again
        setTimeout(() => {
          enforceFullscreen();
        }, 100);
      } else if (fullscreenActive) {
        setFullscreenBlocked(false);
        setNotFullscreen(false);
      }
    };

    // Initial check
    checkFullscreenState();

    // Monitor fullscreen changes
    const handleFullscreenChange = () => {
      checkFullscreenState();
    };

    // Monitor page visibility
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(checkFullscreenState, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic check every 500ms
    const interval = setInterval(checkFullscreenState, 500);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [examComplete, enforceFullscreen]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-white">
      {/* Defensive Violation Overlay - Takes priority over all other overlays */}
      {violationState?.isActive && (
        <DefensiveViolationOverlay
          violation={violationState}
          onDismiss={dismissViolation}
          candidateId={candidateData?.candidateId}
          assessmentTitle={assessment?.title}
        />
      )}

      {/* Fullscreen Enforcement Overlay - Only show if no violation overlay is active */}
      {fullscreenBlocked && !violationState?.isActive && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-40 flex items-center justify-center">
          <div className="bg-red-900/20 border border-red-500 p-8 rounded-lg text-center max-w-md mx-4">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-4">Fullscreen Required</h2>
            <p className="text-red-300 mb-6">
              You must be in fullscreen mode to attempt this coding exam. Please click the button below to continue.
            </p>
            <button
              onClick={() => {
                enforceFullscreen();
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Enter Fullscreen to Continue
            </button>
            <p className="text-red-400 text-sm mt-4">
              ⚠️ Exam content is hidden until fullscreen mode is activated
            </p>
          </div>
        </div>
      )}

      {/* Main Exam Content - Hidden when fullscreen blocked or violation active */}
      <div className={(fullscreenBlocked || violationState?.isActive) ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
        <div className="h-screen bg-[#0a0b0d] text-white overflow-hidden relative">
          {(windowTooSmall || tabInactive || notFullscreen) && (
            <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95">
              <div className="bg-red-900 border-4 border-red-600 rounded-2xl p-10 max-w-lg w-full mx-4 animate-pulse text-center shadow-2xl relative">
                <svg className="mx-auto mb-6 animate-bounce" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" stroke="red" strokeWidth="2" fill="#fff0f0"/><path d="M12 8v4" stroke="red" strokeWidth="2"/><circle cx="12" cy="16" r="1" fill="red"/></svg>
                <h2 className="text-3xl font-extrabold text-white mb-4 drop-shadow-lg">SECURITY WARNING</h2>
                <p className="text-lg text-red-300 font-bold mb-6 drop-shadow">{windowTooSmall ? 'Window is too small or minimized.' : tabInactive ? 'Tab is inactive or switched.' : 'You must be in fullscreen mode to continue your exam.'}<br/>Please maximize, return to this tab, and enter fullscreen to continue your exam.</p>
                <button
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 py-3 rounded-xl font-bold text-xl shadow-lg border-2 border-white/20 focus:outline-none focus:ring-4 focus:ring-red-500"
                  onClick={async () => {
                    await document.documentElement.requestFullscreen();
                    setWindowTooSmall(false);
                    setTabInactive(false);
                    setNotFullscreen(false);
                  }}
                >
                  Go Fullscreen
                </button>
              </div>
            </div>
          )}
          <div className={`${(windowTooSmall || tabInactive || notFullscreen) ? 'blur-sm pointer-events-none select-none' : ''}`}>
            {/* Critical Warning Popup */}
            {showCriticalWarning && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
                <div className="bg-red-900 border-2 border-red-500 rounded-lg p-8 max-w-md mx-4 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skull className="w-8 h-8 text-red-400" />
                    <h2 className="text-xl font-bold text-red-400">CRITICAL WARNING</h2>
                  </div>
                  <p className="text-red-200 mb-6">{warningMessage}</p>
                  <div className="flex justify-center">
                    <Button onClick={() => setShowCriticalWarning(false)} className="bg-red-600 hover:bg-red-700 text-white">
                      I UNDERSTAND
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Header - Fixed */}
            <div className="h-16 bg-[#1a1d21] border-b border-[#2a2d31] p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] rounded-lg flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold">Coding Assessment</h1>
                <Badge className="bg-red-900/30 text-red-400 border-red-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Ultra Secure
                </Badge>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 bg-red-900/30 border border-red-500/30 px-3 py-1 rounded">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="font-mono font-bold text-red-400">{formatTime(timeLeft)}</span>
                </div>

                <div className="flex items-center space-x-2 bg-orange-900/30 border border-orange-500/30 px-3 py-1 rounded">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="font-mono font-bold text-orange-400">{formatTime(problemTimeLeft)}</span>
                </div>

                {criticalViolations > 0 && (
                  <div className="flex items-center space-x-2 bg-red-900/30 border border-red-500/30 px-3 py-1 rounded animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-bold">{criticalViolations}</span>
                  </div>
                )}

                {warningViolations > 0 && (
                  <div className="flex items-center space-x-2 bg-yellow-900/30 border border-yellow-500/30 px-3 py-1 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{warningViolations}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 bg-green-900/30 border border-green-500/30 px-3 py-1 rounded">
                  <Camera className="w-4 h-4 text-green-400" />
                  <Eye className="w-4 h-4 text-green-400" />
                  <Mic className="w-4 h-4 text-green-400" />
                </div>

                <Button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to end the test? This action cannot be undone.")) {
                      submitExam(false, "Manual submission by candidate")
                    }
                  }}
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                >
                  End Test
                </Button>
              </div>
            </div>

            {/* Main Content - Fixed Height */}
            <div className="h-[calc(100vh-64px)] flex">
              {/* Left Panel - Problem Description - Fixed Width */}
              <div className="w-96 border-r border-[#2a2d31] flex flex-col">
                {/* Problem Header - Fixed */}
                <div className="h-20 p-4 border-b border-[#2a2d31] flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-bold truncate">{problems[currentProblem].title}</h2>
                    <Badge className={getDifficultyColor(problems[currentProblem].difficulty)}>
                      {problems[currentProblem].difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>
                      Problem {currentProblem + 1} of {problems.length}
                    </span>
                    <span>{problems[currentProblem].marks} marks</span>
                  </div>
                  <Progress value={progress} className="h-1 mt-2 bg-[#2a2d31]" />
                </div>

                {/* Tabs - Fixed */}
                <div className="h-12 flex border-b border-[#2a2d31] flex-shrink-0">
                  {[
                    { id: "description", label: "Description", icon: FileText },
                    { id: "submissions", label: "Submissions", icon: CheckCircle },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-[#ff4d00] text-[#ff4d00]"
                          : "border-transparent text-gray-400 hover:text-gray-300"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content - ONLY SCROLLABLE SECTION */}
                <div className="flex-1 overflow-y-auto p-4">
                  {activeTab === "description" && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {problems[currentProblem].description}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Examples</h3>
                        {problems[currentProblem].examples.map((example: any, index: number) => (
                          <div key={index} className="mb-4 p-4 bg-[#1a1d21] rounded-lg border border-[#2a2d31]">
                            <div className="mb-2">
                              <strong className="text-gray-300">Input:</strong>
                              <code className="ml-2 text-[#ff4d00]">{example.input}</code>
                            </div>
                            <div className="mb-2">
                              <strong className="text-gray-300">Output:</strong>
                              <code className="ml-2 text-[#ff4d00]">{example.output}</code>
                            </div>
                            {example.explanation && (
                              <div>
                                <strong className="text-gray-300">Explanation:</strong>
                                <span className="ml-2 text-gray-400">{example.explanation}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                        <ul className="space-y-1">
                          {problems[currentProblem].constraints.map((constraint: any, index: number) => (
                            <li key={index} className="text-gray-400">
                              • {constraint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "submissions" && (
                    <div className="space-y-4">
                      {submissions.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No submissions yet</p>
                        </div>
                      ) : (
                        submissions.map((submission) => (
                          <div key={submission.id} className="p-4 bg-[#1a1d21] rounded-lg border border-[#2a2d31]">
                            <div className="flex items-center justify-between mb-2">
                              <Badge
                                className={
                                  submission.status === "Accepted"
                                    ? "bg-green-900/30 text-green-400 border-green-500/30"
                                    : "bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
                                }
                              >
                                {submission.status}
                              </Badge>
                              <span className="text-sm text-gray-400">
                                {new Date(submission.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Score: {submission.score}%</span>
                              <span>
                                Tests: {submission.passedTests}/{submission.totalTests}
                              </span>
                              <span>Runtime: {submission.runtime}ms</span>
                              <span>Memory: {submission.memory}KB</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Panel - Code Editor - Flexible Width */}
              <div className="flex-1 flex flex-col">
                {/* Editor Header - Fixed */}
                <div className="h-14 p-4 border-b border-[#2a2d31] flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-4">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="bg-[#2a2d31] border border-[#3a3d41] rounded px-3 py-1 text-sm text-white"
                    >
                      {languages.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setFontSize((prev) => Math.max(prev - 2, 10))}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-400 min-w-[3rem] text-center">{fontSize}px</span>
                      <button
                        onClick={() => setFontSize((prev) => Math.min(prev + 2, 24))}
                        className="p-1 text-gray-400 hover:text-white"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>

                    {editorLoaded && (
                      <Badge className="bg-green-900/30 text-green-400 border-green-500/30 text-xs">Editor Ready</Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={runCode}
                      disabled={isRunning || !editorLoaded}
                      variant="outline"
                      size="sm"
                      className="border-[#2a2d31] text-gray-300 hover:bg-[#2a2d31]"
                    >
                      {isRunning ? (
                        <>
                          <Square className="w-4 h-4 mr-2" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={submitCode}
                      disabled={isSubmitting || !editorLoaded}
                      className="bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white"
                      size="sm"
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>

                {/* Monaco Editor - Fixed Height */}
                <div className="flex-1 relative bg-[#1e1e1e]">
                  <div ref={editorRef} className="absolute inset-0" />
                  {!editorLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1e1e1e]">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[#ff6b35] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading Editor...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Test Cases Section - Fixed Height */}
                <div className="h-64 border-t border-[#2a2d31] bg-[#1a1d21] flex-shrink-0">
                  <div className="h-10 flex items-center justify-between p-3 border-b border-[#2a2d31]">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 text-sm font-medium text-[#ff4d00]">
                        <TestTube className="w-4 h-4" />
                        <span>Test Cases</span>
                      </button>
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-gray-400">
                          Passed: {testResults.filter((t) => t.status === "passed").length}/{testResults.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[calc(100%-40px)] flex">
                    {/* Test Cases List */}
                    <div className="w-1/3 border-r border-[#2a2d31] p-2 overflow-y-auto">
                      <div className="space-y-2">
                        {testResults.map((testCase, index) => (
                          <div
                            key={testCase.id}
                            className={`p-3 rounded border text-sm ${
                              testCase.status === "passed"
                                ? "bg-green-900/20 border-green-500/30 text-green-400"
                                : testCase.status === "failed"
                                  ? "bg-red-900/20 border-red-500/30 text-red-400"
                                  : testCase.status === "running"
                                    ? "bg-yellow-900/20 border-yellow-500/30 text-yellow-400"
                                    : "bg-[#2a2d31] border-[#3a3d41] text-gray-400"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">Test Case {index + 1}</span>
                              <div className="flex items-center space-x-1">
                                {testCase.type === "private" ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                {testCase.status === "passed" && <Check className="w-3 h-3" />}
                                {testCase.status === "failed" && <X className="w-3 h-3" />}
                                {testCase.status === "running" && (
                                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs opacity-75">
                              {testCase.type === "public" ? "Public Test" : "Private Test"}
                            </div>
                            {testCase.runtime !== undefined && (
                              <div className="text-xs opacity-75 mt-1">
                                {testCase.runtime}ms • {testCase.memory}KB
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Console Output */}
                    <div className="flex-1 p-4 overflow-y-auto">
                      {consoleOutput.length === 0 ? (
                        <div className="text-gray-400 text-sm">Click "Run" to test your code against all test cases</div>
                      ) : (
                        <div className="space-y-1">
                          {consoleOutput.map((line, index) => (
                            <div key={index} className="text-sm font-mono text-gray-300">
                              {line}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Monitoring Sidebar - Fixed Width */}
              <div className="w-80 bg-[#1a1d21] border-l border-[#2a2d31] p-4 flex flex-col">
                <div className="mb-6 flex-shrink-0">
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
                  <div className="mt-1 flex justify-center space-x-2 text-xs">
                    {faceDetectionActive && (
                      <Badge className="bg-blue-900/30 text-blue-400 border-blue-500/30 text-xs">FACE</Badge>
                    )}
                    {eyeTrackingActive && (
                      <Badge className="bg-purple-900/30 text-purple-400 border-purple-500/30 text-xs">EYE</Badge>
                    )}
                  </div>
                </div>

                <div className="mb-6 flex-shrink-0">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Problems</h3>
                  <div className="space-y-2">
                    {problems.map((problem: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentProblem(index)
                          setProblemTimeLeft(problem.timeLimit * 60)
                        }}
                        className={`w-full text-left p-3 rounded border transition-colors ${
                          index === currentProblem
                            ? "bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] text-white border-transparent"
                            : submissions.some((s) => s.id === problem.id)
                              ? "bg-green-600 text-white border-transparent"
                              : "bg-[#2a2d31] text-gray-300 border-[#3a3d41] hover:border-[#ff4d00]/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{problem.title}</span>
                          <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</Badge>
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                          {problem.marks} marks • {problem.timeLimit}min
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0a0b0d] p-4 rounded border border-[#2a2d31] mb-4 flex-shrink-0">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">Security Status</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Fullscreen</span>
                      <Badge
                        className={
                          isFullscreen
                            ? "bg-green-900/30 text-green-400 border-green-500/30"
                            : "bg-red-900/30 text-red-400 border-red-500/30"
                        }
                      >
                        {isFullscreen ? "Active" : "Violated"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tab Switches</span>
                      <Badge
                        className={
                          tabSwitchCount === 0
                            ? "bg-green-900/30 text-green-400 border-green-500/30"
                            : "bg-red-900/30 text-red-400 border-red-500/30"
                        }
                      >
                        {tabSwitchCount}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Critical Violations</span>
                      <Badge
                        className={
                          criticalViolations === 0
                            ? "bg-green-900/30 text-green-400 border-green-500/30"
                            : "bg-red-900/30 text-red-400 border-red-500/30"
                        }
                      >
                        {criticalViolations}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Warnings</span>
                      <Badge
                        className={
                          warningViolations === 0
                            ? "bg-green-900/30 text-green-400 border-green-500/30"
                            : "bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
                        }
                      >
                        {warningViolations}
                      </Badge>
                    </div>
                  </div>
                </div>

                {violations.length > 0 && (
                  <div className="bg-[#0a0b0d] p-4 rounded border border-[#2a2d31] flex-1 min-h-0">
                    <h3 className="text-sm font-medium text-gray-300 mb-2">Security Alerts</h3>
                    <div className="space-y-1 h-full overflow-y-auto">
                      {violations
                        .slice(-10)
                        .reverse()
                        .map((violation: any, index: number) => (
                          <div key={violation.id} className={`text-xs ${getViolationColor(violation.type)}`}>
                            <div className="font-medium">{violation.type.toUpperCase()}</div>
                            <div className="opacity-75">{violation.message}</div>
                            <div className="opacity-50">{violation.timestamp.toLocaleTimeString()}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Warnings - Fixed Position */}
            {criticalViolations > 0 && (
              <Alert className="fixed bottom-4 right-4 w-96 bg-red-900/20 border-red-500/50 z-50 animate-pulse">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">
                  <strong>CRITICAL ALERT:</strong> {criticalViolations} critical violation(s) detected. Exam will auto-submit
                  after 5 critical violations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

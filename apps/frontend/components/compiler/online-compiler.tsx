"use client"
import { useState, useEffect } from "react"
import { LanguageSelector } from "./language-selector"
import { ThemeToggle } from "./theme-toggle"
import { CodeEditor } from "./code-editor"
import { OutputTerminal } from "./output-terminal"
import { Button } from "@/components/ui/button"
import { Play, Save, Loader2 } from "lucide-react"
import { Socket } from "socket.io-client"
import { io } from "socket.io-client"

const defaultCode = {
  python: `# Welcome to Python!
# Write your code here
print("Hello, World!")`,
  java: `// Welcome to Java!
// Write your code here
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
}

export const OnlineCompiler = () => {
  const [language, setLanguage] = useState<"python" | "java">("python")
  const [code, setCode] = useState(defaultCode.python)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null)
  const [input, setInput] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Connect to the code-runner server
    const newSocket = io("http://localhost:5000")
    setSocket(newSocket)

    newSocket.on("connect", () => {
      console.log("Connected to code-runner server")
    })

    newSocket.on("output", (data) => {
      // Handle different types of output data
      if (typeof data === 'string') {
        setOutput((prev) => prev + data)
      } else if (data && typeof data === 'object') {
        switch (data.type) {
          case 'clear':
            setOutput("")
            break
          case 'error':
            setOutput((prev) => prev + `Error: ${data.data}\n`)
            break
          case 'prompt':
            setOutput((prev) => prev + data.data)
            break
          case 'stdout':
          case 'stderr':
            setOutput((prev) => prev + data.data)
            break
          default:
            if (data.data) {
              setOutput((prev) => prev + data.data)
            }
        }
      }
    })

    newSocket.on("execution_end", (data) => {
      setIsRunning(false)
      if (typeof data?.executionTime === 'number') {
        setExecutionTime(data.executionTime)
      }
      if (typeof data?.memoryUsage === 'number') {
        setMemoryUsage(data.memoryUsage)
      }
    })

    newSocket.on("error", (error) => {
      setOutput((prev) => prev + `\nError: ${error}`)
      setIsRunning(false)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    // Auto-save code to localStorage
    localStorage.setItem(`code_${language}`, code)
  }, [code, language])

  useEffect(() => {
    // Load saved code from localStorage
    const savedCode = localStorage.getItem(`code_${language}`)
    if (savedCode) {
      setCode(savedCode)
    } else {
      setCode(defaultCode[language])
    }
  }, [language])

  const runCode = async () => {
    if (!socket) return

    setIsRunning(true)
    setOutput("")
    setExecutionTime(null)
    setMemoryUsage(null)

    socket.emit("run_code", {
      language,
      code,
      input
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    if (socket) {
      socket.emit("user_input", e.target.value)
    }
  }

  const formatExecutionTime = (time: number | null): string => {
    if (time === null || typeof time !== 'number') return ""
    return `${Number(time).toFixed(2)}ms`
  }

  const formatMemoryUsage = (memory: number | null): string => {
    if (memory === null || typeof memory !== 'number') return ""
    return `${Number(memory).toFixed(2)}MB`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
          <ThemeToggle isDarkTheme={isDarkTheme} onThemeChange={setIsDarkTheme} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Code Editor</h2>
              <div className="flex gap-2">
                <Button
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isRunning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Run Code
                </Button>
                <Button
                  variant="outline"
                  className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <CodeEditor
              language={language}
              code={code}
              onChange={setCode}
              isDarkTheme={isDarkTheme}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Output</h2>
              {(executionTime !== null || memoryUsage !== null) && (
                <div className="text-sm text-gray-400">
                  {executionTime !== null && (
                    <span className="mr-4">Time: {formatExecutionTime(executionTime)}</span>
                  )}
                  {memoryUsage !== null && (
                    <span>Memory: {formatMemoryUsage(memoryUsage)}</span>
                  )}
                </div>
              )}
            </div>
            <OutputTerminal
              output={output}
              input={input}
              onInputChange={handleInputChange}
              isRunning={isRunning}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Code,
  Play,
  Download,
  Share,
  Trash2,
  Copy,
  Settings,
  X,
  RefreshCw,
  Clock,
  Cpu,
  BookmarkPlus,
  Loader2,
} from "lucide-react"
import { LanguageSelector } from "./language-selector"
import { CodeEditor } from "./code-editor"
import { OutputTerminal } from "./output-terminal"
import { CodeSnippets } from "./code-snippets"
import { ThemeToggle } from "./theme-toggle"

type Language = "python" | "java"

const DEFAULT_PYTHON_CODE = `# Python Example
print("Hello, World!")

# Get user input
name = input("Enter your name: ")
print(f"Welcome, {name}!")

# Simple calculation
a = 10
b = 20
print(f"Sum of {a} and {b} is {a + b}")
`

const DEFAULT_JAVA_CODE = `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Get user input
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Welcome, " + name + "!");
        
        // Simple calculation
        int a = 10;
        int b = 20;
        System.out.println("Sum of " + a + " and " + b + " is " + (a + b));
    }
}
`

export const OnlineCompiler = () => {
  const [language, setLanguage] = useState<Language>("python")
  const [code, setCode] = useState(DEFAULT_PYTHON_CODE)
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [showSnippets, setShowSnippets] = useState(false)
  const [executionTime, setExecutionTime] = useState<number | null>(null)
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null)
  const [isAutoSave, setIsAutoSave] = useState(true)
  const [isSaved, setIsSaved] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Handle language change
  useEffect(() => {
    if (language === "python") {
      setCode(DEFAULT_PYTHON_CODE)
    } else {
      setCode(DEFAULT_JAVA_CODE)
    }
  }, [language])

  // Auto-save functionality
  useEffect(() => {
    if (isAutoSave) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      autoSaveTimerRef.current = setTimeout(() => {
        localStorage.setItem(`${language}-code`, code)
        localStorage.setItem(`${language}-input`, input)
        setIsSaved(true)
      }, 1000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [code, input, language, isAutoSave])

  // Load saved code on initial load
  useEffect(() => {
    const savedCode = localStorage.getItem(`${language}-code`)
    const savedInput = localStorage.getItem(`${language}-input`)

    if (savedCode) {
      setCode(savedCode)
    }

    if (savedInput) {
      setInput(savedInput)
    }
  }, [language])

  const handleCodeChange = (value: string) => {
    setCode(value)
    setIsSaved(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    setIsSaved(false)
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("")

    // Simulate code execution
    const startTime = performance.now()

    try {
      // In a real implementation, this would be an API call to execute the code
      await new Promise((resolve) => setTimeout(resolve, 1000))

      let simulatedOutput = ""

      if (language === "python") {
        simulatedOutput = simulatePythonExecution(code, input)
      } else {
        simulatedOutput = simulateJavaExecution(code, input)
      }

      const endTime = performance.now()
      setExecutionTime(endTime - startTime)
      setMemoryUsage(Math.floor(Math.random() * 50) + 10) // Simulated memory usage in MB

      setOutput(simulatedOutput)
    } catch (error: any) {
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const simulatePythonExecution = (code: string, input: string) => {
    // This is a very simplified simulation
    let output = ""
    const inputLines = input.split("\n")
    let inputIndex = 0

    // Very basic simulation of Python execution
    if (code.includes("print(")) {
      const printStatements = code.match(/print$$(.*?)$$/g) || []

      for (const statement of printStatements) {
        let content = statement.substring(6, statement.length - 1)

        // Handle f-strings (very simplified)
        if (content.startsWith('f"') || content.startsWith("f'")) {
          content = content.substring(2, content.length - 1)

          // Replace {variables} with values (simplified)
          content = content.replace(/{([^}]*)}/g, (match, variable) => {
            if (variable === "a + b") return "30"
            if (variable === "a") return "10"
            if (variable === "b") return "20"
            if (variable === "name") return inputLines[0] || "User"
            return match
          })
        } else {
          // Remove quotes
          if (
            (content.startsWith('"') && content.endsWith('"')) ||
            (content.startsWith("'") && content.endsWith("'"))
          ) {
            content = content.substring(1, content.length - 1)
          }
        }

        output += content + "\n"
      }

      // Handle input simulation
      if (code.includes("input(")) {
        const inputPrompts = code.match(/input$$(.*?)$$/g) || []

        for (const prompt of inputPrompts) {
          let promptText = prompt.substring(6, prompt.length - 1)

          // Remove quotes
          if (
            (promptText.startsWith('"') && promptText.endsWith('"')) ||
            (promptText.startsWith("'") && promptText.endsWith("'"))
          ) {
            promptText = promptText.substring(1, promptText.length - 1)
          }

          output += promptText

          if (inputIndex < inputLines.length) {
            output += inputLines[inputIndex] + "\n"
            inputIndex++
          } else {
            output += "[No input provided]\n"
          }
        }
      }
    }

    return output
  }

  const simulateJavaExecution = (code: string, input: string) => {
    // This is a very simplified simulation
    let output = ""
    const inputLines = input.split("\n")
    let inputIndex = 0

    // Very basic simulation of Java execution
    if (code.includes("System.out.println")) {
      const printStatements = code.match(/System\.out\.println$$(.*?)$$;/g) || []

      for (const statement of printStatements) {
        let content = statement.substring(19, statement.length - 2)

        // Handle string literals
        if ((content.startsWith('"') && content.endsWith('"')) || (content.startsWith("'") && content.endsWith("'"))) {
          content = content.substring(1, content.length - 1)
        }

        // Handle string concatenation (simplified)
        if (content.includes(" + ")) {
          content = content.replace(/"([^"]*)" \+ ([^+]*) \+ "([^"]*)"/g, (match, prefix, variable, suffix) => {
            if (variable.trim() === "name") return prefix + (inputLines[0] || "User") + suffix
            if (variable.trim() === "(a + b)") return prefix + "30" + suffix
            if (variable.trim() === "a") return prefix + "10" + suffix
            if (variable.trim() === "b") return prefix + "20" + suffix
            return match
          })
        }

        output += content + "\n"
      }

      // Handle input simulation
      if (code.includes("scanner.nextLine()")) {
        const scannerPrompts = code.match(/System\.out\.print$$(.*?)$$;/g) || []

        for (const prompt of scannerPrompts) {
          let promptText = prompt.substring(17, prompt.length - 2)

          // Remove quotes
          if (
            (promptText.startsWith('"') && promptText.endsWith('"')) ||
            (promptText.startsWith("'") && promptText.endsWith("'"))
          ) {
            promptText = promptText.substring(1, promptText.length - 1)
          }

          output += promptText

          if (inputIndex < inputLines.length) {
            output += inputLines[inputIndex] + "\n"
            inputIndex++
          } else {
            output += "[No input provided]\n"
          }
        }
      }
    }

    return output
  }

  const clearCode = () => {
    if (language === "python") {
      setCode(DEFAULT_PYTHON_CODE)
    } else {
      setCode(DEFAULT_JAVA_CODE)
    }
  }

  const clearOutput = () => {
    setOutput("")
    setExecutionTime(null)
    setMemoryUsage(null)
  }

  const handleSnippetSelect = (snippetCode: string) => {
    setCode(snippetCode)
    setShowSnippets(false)
  }

  const downloadCode = () => {
    const element = document.createElement("a")
    const fileExtension = language === "python" ? "py" : "java"
    const fileName = language === "python" ? "main.py" : "Main.java"

    const file = new Blob([code], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = fileName
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
  }

  const shareCode = () => {
    // In a real implementation, this would generate a shareable link
    alert("Sharing functionality would be implemented here")
  }

  return (
    <div
      className={cn(
        "bg-zinc-900/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6",
        isDarkTheme ? "text-white" : "text-gray-800",
      )}
    >
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Online Compiler</h1>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector language={language} setLanguage={setLanguage} />

            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-300" />
              </button>

              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl z-10"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Auto-Save</span>
                      <button
                        onClick={() => setIsAutoSave(!isAutoSave)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors",
                          isAutoSave ? "bg-gradient-to-r from-orange-500 to-red-500" : "bg-white/10",
                        )}
                      >
                        <div
                          className={cn(
                            "w-4 h-4 bg-white rounded-full transition-transform",
                            isAutoSave ? "translate-x-7" : "translate-x-1",
                          )}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Theme</span>
                      <ThemeToggle isDark={isDarkTheme} setIsDark={setIsDarkTheme} />
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <button
                        onClick={() => {
                          localStorage.clear()
                          setCode(language === "python" ? DEFAULT_PYTHON_CODE : DEFAULT_JAVA_CODE)
                          setInput("")
                          setOutput("")
                          setShowSettings(false)
                        }}
                        className="w-full py-2 text-red-400 hover:text-red-300 transition-colors text-sm flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Saved Data
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code Editor */}
          <div className="lg:col-span-2 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-semibold">Code Editor</h2>
                {!isSaved && <span className="text-xs text-orange-400">Unsaved changes</span>}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSnippets(!showSnippets)}
                  className="flex items-center space-x-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Snippets</span>
                </button>

                <button
                  onClick={clearCode}
                  className="flex items-center space-x-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="relative">
              {showSnippets && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-0 right-0 w-64 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl z-10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Code Snippets</h3>
                    <button onClick={() => setShowSnippets(false)} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <CodeSnippets language={language} onSelect={handleSnippetSelect} />
                </motion.div>
              )}

              <div className="h-[400px] border border-white/10 rounded-lg overflow-hidden">
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={handleCodeChange}
                  theme={isDarkTheme ? "vs-dark" : "vs"}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={copyCode}
                  className="flex items-center space-x-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>

                <button
                  onClick={downloadCode}
                  className="flex items-center space-x-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>

                <button
                  onClick={shareCode}
                  className="flex items-center space-x-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                >
                  <Share className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-xs text-gray-400">
                {executionTime !== null && (
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{executionTime.toFixed(2)} ms</span>
                  </div>
                )}

                {memoryUsage !== null && (
                  <div className="flex items-center ml-3">
                    <Cpu className="w-3 h-3 mr-1" />
                    <span>{memoryUsage} MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Input/Output */}
          <div className="flex flex-col space-y-4">
            {/* Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Input</h2>
                <button onClick={() => setInput("")} className="text-xs text-gray-400 hover:text-white">
                  Clear
                </button>
              </div>

              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Enter input values here..."
                className="w-full h-[100px] bg-black/50 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono text-sm resize-none"
              />
            </div>

            {/* Run Button */}
            <div className="flex justify-center">
              <motion.button
                onClick={runCode}
                disabled={isRunning}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Run Code</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Output</h2>
                <button onClick={clearOutput} className="text-xs text-gray-400 hover:text-white">
                  Clear
                </button>
              </div>

              <div className="h-[200px] bg-black/50 border border-white/10 rounded-lg overflow-hidden">
                <OutputTerminal output={output} />
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-6 text-xs text-gray-400">
            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-black/50 border border-white/10 rounded text-gray-300 mr-2">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-black/50 border border-white/10 rounded text-gray-300 mx-2">Enter</kbd>
              <span>Run Code</span>
            </div>

            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-black/50 border border-white/10 rounded text-gray-300 mr-2">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-black/50 border border-white/10 rounded text-gray-300 mx-2">S</kbd>
              <span>Save</span>
            </div>

            <div className="flex items-center">
              <kbd className="px-2 py-1 bg-black/50 border border-white/10 rounded text-gray-300 mr-2">Esc</kbd>
              <span>Close Panels</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

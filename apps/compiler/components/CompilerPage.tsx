"use client"

import { useState, useEffect } from "react"
import SkillmentHeader from "@/components/SkillmentHeader"
import CodeEditorPanel from "@/components/CodeEditorPanel"
import InputOutputPanel from "@/components/InputOutputPanel"
import type { Language, SubmissionResult } from "@/lib/types"
import { SUPPORTED_LANGUAGES } from "@/lib/constants"

export default function CompilerPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0])
  const [code, setCode] = useState<string>(selectedLanguage.defaultCode)
  const [customInput, setCustomInput] = useState<string>("")
  const [output, setOutput] = useState<SubmissionResult | null>(null)
  const [isRunning, setIsRunning] = useState<boolean>(false)

  // Check for shared code in URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sharedData = urlParams.get("shared")

    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(sharedData))
        const sharedLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.id === decoded.language)

        if (sharedLanguage && decoded.code) {
          setSelectedLanguage(sharedLanguage)
          setCode(decoded.code)
          // Clear the URL parameter after loading
          window.history.replaceState({}, document.title, window.location.pathname)
        }
      } catch (error) {
        console.error("Failed to load shared code:", error)
      }
    }
  }, [])

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language)
    setCode(language.defaultCode)
    setOutput(null)
  }

  const handleRunCode = async () => {
    setIsRunning(true)
    setOutput(null)

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: selectedLanguage.id,
          stdin: customInput || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to execute code")
      }

      const result: SubmissionResult = await response.json()
      setOutput(result)
    } catch (error) {
      setOutput({
        status: { description: "Error" },
        stdout: null,
        stderr: "Failed to execute code. Please try again.",
        compile_output: null,
        time: null,
        memory: null,
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      <SkillmentHeader code={code} language={selectedLanguage} />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Panel - Code Editor */}
        <div className="w-3/5 border-r border-[#3a3a3a]">
          <CodeEditorPanel
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={setCode}
            onRunCode={handleRunCode}
            isRunning={isRunning}
            output={output}
          />
        </div>

        {/* Right Panel - Input/Output */}
        <div className="w-2/5">
          <InputOutputPanel
            customInput={customInput}
            onInputChange={setCustomInput}
            output={output}
            isRunning={isRunning}
            onRunCode={handleRunCode}
          />
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useState } from "react"
import { ChevronDown, Settings, Maximize2, RotateCcw } from "lucide-react"
import ProfessionalCodeEditor from "@/components/ProfessionalCodeEditor"
import TestCasePanel from "@/components/TestCasePanel"
import type { Language, SubmissionResult, TestCase } from "@/lib/types"

interface CodePanelProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
  code: string
  onCodeChange: (code: string) => void
  onRunCode: () => void
  isRunning: boolean
  output: SubmissionResult | null
  testCases: TestCase[]
  onTestCaseChange: (testCases: TestCase[]) => void
}

export default function CodePanel({
  selectedLanguage,
  onLanguageChange,
  code,
  onCodeChange,
  onRunCode,
  isRunning,
  output,
  testCases,
  onTestCaseChange,
}: CodePanelProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [editorHeight, setEditorHeight] = useState(60) // percentage

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Code Header */}
      <div className="h-12 bg-[#262626] border-b border-[#3a3a3a] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="text-[#00af9b] text-sm font-medium">Code</span>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] px-3 py-1.5 rounded text-sm text-white"
            >
              <span>{selectedLanguage.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                {/* Language options would go here */}
              </div>
            )}
          </div>

          <span className="text-gray-400 text-sm">Auto</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1.5 text-gray-400 hover:text-white">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div style={{ height: `${editorHeight}%` }} className="relative">
        <ProfessionalCodeEditor code={code} language={selectedLanguage} onChange={onCodeChange} />

        {/* Saved indicator */}
        <div className="absolute bottom-2 left-4 text-xs text-gray-500">Saved</div>

        {/* Line/Column indicator */}
        <div className="absolute bottom-2 right-4 text-xs text-gray-500">Ln 1, Col 1</div>
      </div>

      {/* Resize Handle */}
      <div
        className="h-1 bg-[#3a3a3a] cursor-row-resize hover:bg-[#4a4a4a] transition-colors"
        onMouseDown={(e) => {
          const startY = e.clientY
          const startHeight = editorHeight

          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY
            const containerHeight = window.innerHeight - 120 // Account for headers
            const deltaPercent = (deltaY / containerHeight) * 100
            const newHeight = Math.max(30, Math.min(80, startHeight - deltaPercent))
            setEditorHeight(newHeight)
          }

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
          }

          document.addEventListener("mousemove", handleMouseMove)
          document.addEventListener("mouseup", handleMouseUp)
        }}
      />

      {/* Test Case Panel */}
      <div style={{ height: `${100 - editorHeight}%` }} className="flex flex-col">
        <TestCasePanel
          testCases={testCases}
          onTestCaseChange={onTestCaseChange}
          onRunCode={onRunCode}
          isRunning={isRunning}
          output={output}
        />
      </div>
    </div>
  )
}

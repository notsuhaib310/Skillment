"use client"

import { useState } from "react"
import { ChevronDown, Settings, Maximize2, RotateCcw, Play, Clock, MemoryStick, Zap, CheckCircle } from "lucide-react"
import MonaccoEditor from "@/components/MonaccoEditor"
import type { Language, SubmissionResult } from "@/lib/types"
import { SUPPORTED_LANGUAGES } from "@/lib/constants"

interface CodeEditorPanelProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
  code: string
  onCodeChange: (code: string) => void
  onRunCode: () => void
  isRunning: boolean
  output?: SubmissionResult | null
}

export default function CodeEditorPanel({
  selectedLanguage,
  onLanguageChange,
  code,
  onCodeChange,
  onRunCode,
  isRunning,
  output,
}: CodeEditorPanelProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a] overflow-hidden">
      {/* Code Header */}
      <div className="h-12 bg-[#262626] flex items-center justify-between px-4 flex-shrink-0 border-b border-[#3a3a3a]">
        <div className="flex items-center gap-4">
          <span className="text-[#FF6B35] text-sm font-medium">Code Editor</span>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="flex items-center gap-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] px-3 py-1.5 rounded-lg text-sm text-white transition-colors border border-[#4a4a4a]"
            >
              <span>{selectedLanguage.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar">
                {SUPPORTED_LANGUAGES.map((language) => (
                  <button
                    key={language.id}
                    onClick={() => {
                      onLanguageChange(language)
                      setShowLanguageDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-[#3a3a3a] transition-colors ${
                      selectedLanguage.id === language.id ? "bg-[#3a3a3a] text-[#FF6B35]" : "text-white"
                    }`}
                  >
                    {language.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-gray-400 text-sm">Auto</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRunCode}
            disabled={isRunning}
            className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-[#2a2a2a] px-4 py-1.5 rounded-lg text-sm text-white disabled:text-gray-500 font-medium transition-colors shadow-lg"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="w-3 h-3" />
                Run Code
              </>
            )}
          </button>

          <div className="w-px h-6 bg-[#3a3a3a] mx-2"></div>

          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Editor - 60% */}
      <div className="flex-1 bg-[#1a1a1a] overflow-hidden" style={{ height: "60%" }}>
        <MonaccoEditor code={code} language={selectedLanguage} onChange={onCodeChange} />
      </div>

      {/* Status Panel - 40% */}
      <div className="border-t border-[#3a3a3a] bg-[#1a1a1a] overflow-hidden" style={{ height: "40%" }}>
        <StatusPanel output={output} isRunning={isRunning} selectedLanguage={selectedLanguage} />
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 4px;
          border: 1px solid #3a3a3a;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5a5a5a;
        }

        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #1a1a1a;
        }

        /* Firefox scrollbar styling */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #4a4a4a #1a1a1a;
        }
      `}</style>
    </div>
  )
}

interface StatusPanelProps {
  output: SubmissionResult | null | undefined
  isRunning: boolean
  selectedLanguage: Language
}

function StatusPanel({ output, isRunning, selectedLanguage }: StatusPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return "text-green-400"
      case "wrong answer":
      case "compilation error":
      case "runtime error":
        return "text-red-400"
      case "time limit exceeded":
      case "memory limit exceeded":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "wrong answer":
      case "compilation error":
      case "runtime error":
        return (
          <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center text-white text-xs">✕</div>
        )
      default:
        return (
          <div className="w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center text-black text-xs">
            !
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Status Header */}
      <div className="h-10 bg-[#262626] border-b border-[#3a3a3a] flex items-center px-4 flex-shrink-0">
        <span className="text-[#FF6B35] text-sm font-medium">Execution Status</span>
      </div>

      {/* Status Content */}
      <div className="flex-1 p-4 overflow-auto">
        {isRunning ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-300">Executing {selectedLanguage.name} code...</span>
            </div>
          </div>
        ) : output ? (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center gap-3">
              {getStatusIcon(output.status.description)}
              <div>
                <div className={`font-medium ${getStatusColor(output.status.description)}`}>
                  {output.status.description}
                </div>
                <div className="text-xs text-gray-400">Executed at {new Date().toLocaleTimeString()}</div>
              </div>
            </div>

            {/* Execution Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {output.time && (
                <div className="bg-[#2a2a2a] p-3 rounded-lg border border-[#3a3a3a]">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Runtime</span>
                  </div>
                  <div className="text-lg font-mono text-white">{output.time}s</div>
                </div>
              )}

              {output.memory && (
                <div className="bg-[#2a2a2a] p-3 rounded-lg border border-[#3a3a3a]">
                  <div className="flex items-center gap-2 mb-1">
                    <MemoryStick className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Memory</span>
                  </div>
                  <div className="text-lg font-mono text-white">{output.memory} KB</div>
                </div>
              )}
            </div>

            {/* Language Info */}
            <div className="bg-[#2a2a2a] p-3 rounded-lg border border-[#3a3a3a]">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-sm text-gray-300">Language</span>
              </div>
              <div className="text-sm text-white">{selectedLanguage.name}</div>
              <div className="text-xs text-gray-400">Judge0 ID: {selectedLanguage.id}</div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-[#2a2a2a] p-2 rounded text-center border border-[#3a3a3a]">
                <div className="text-gray-400">Lines</div>
                <div className="text-white font-mono">{output.stdout?.split("\n").length || 0}</div>
              </div>
              <div className="bg-[#2a2a2a] p-2 rounded text-center border border-[#3a3a3a]">
                <div className="text-gray-400">Chars</div>
                <div className="text-white font-mono">
                  {(output.stdout?.length || 0) + (output.stderr?.length || 0)}
                </div>
              </div>
              <div className="bg-[#2a2a2a] p-2 rounded text-center border border-[#3a3a3a]">
                <div className="text-gray-400">Status</div>
                <div className="text-white font-mono">{output.status.description.split(" ")[0]}</div>
              </div>
            </div>

            {/* Error Preview */}
            {(output.stderr || output.compile_output) && (
              <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-lg">
                <div className="text-red-400 text-sm font-medium mb-1">Error Preview</div>
                <div className="text-red-300 text-xs font-mono truncate">
                  {(output.stderr || output.compile_output || "").split("\n")[0]}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-3 mx-auto border border-[#3a3a3a]">
                <Play className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-gray-400 text-sm mb-1">Ready to Execute</div>
              <div className="text-gray-500 text-xs">Click "Run Code" to see execution details</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

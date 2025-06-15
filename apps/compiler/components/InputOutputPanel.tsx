"use client"

import { useState } from "react"
import { Play, Copy, Download, Trash2, Settings } from "lucide-react"
import type { SubmissionResult } from "@/lib/types"

interface InputOutputPanelProps {
  customInput: string
  onInputChange: (input: string) => void
  output: SubmissionResult | null
  isRunning: boolean
  onRunCode: () => void
}

export default function InputOutputPanel({
  customInput,
  onInputChange,
  output,
  isRunning,
  onRunCode,
}: InputOutputPanelProps) {
  const [inputHeight, setInputHeight] = useState(50) // percentage

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
        return "✅"
      case "wrong answer":
      case "compilation error":
      case "runtime error":
        return "❌"
      default:
        return "⚠️"
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Input Section */}
      <div style={{ height: `${inputHeight}%` }} className="flex flex-col border-b border-[#3a3a3a]">
        {/* Input Header */}
        <div className="h-12 bg-[#262626] border-b border-[#3a3a3a] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-[#00af9b] text-sm font-medium">Input</span>
            <span className="text-xs text-gray-400">({customInput.length} characters)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onInputChange("")}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
              title="Clear input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-1 p-4">
          <textarea
            value={customInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter your input here...
Example:
123
-456
789"
            className="w-full h-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#00af9b] focus:border-transparent font-mono text-sm leading-relaxed"
            style={{
              fontFamily:
                "'JetBrains Mono', 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, monospace",
            }}
          />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onRunCode}
              disabled={isRunning}
              className="flex items-center gap-2 bg-[#00af9b] hover:bg-[#00c4a7] disabled:bg-[#2a2a2a] px-3 py-1.5 rounded text-sm text-white disabled:text-gray-500 font-medium transition-colors"
            >
              {isRunning ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Run
                </>
              )}
            </button>
            <button className="px-3 py-1.5 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white text-sm rounded transition-colors">
              Sample Input
            </button>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="h-1 bg-[#3a3a3a] cursor-row-resize hover:bg-[#00af9b] transition-colors"
        onMouseDown={(e) => {
          const startY = e.clientY
          const startHeight = inputHeight

          const handleMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY
            const containerHeight = window.innerHeight - 120
            const deltaPercent = (deltaY / containerHeight) * 100
            const newHeight = Math.max(20, Math.min(80, startHeight + deltaPercent))
            setInputHeight(newHeight)
          }

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
          }

          document.addEventListener("mousemove", handleMouseMove)
          document.addEventListener("mouseup", handleMouseUp)
        }}
      />

      {/* Output Section */}
      <div style={{ height: `${100 - inputHeight}%` }} className="flex flex-col">
        {/* Output Header */}
        <div className="h-12 bg-[#262626] border-b border-[#3a3a3a] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-[#00af9b] text-sm font-medium">Output</span>
            {output && (
              <div className="flex items-center gap-2">
                <span className="text-xs">{getStatusIcon(output.status.description)}</span>
                <span className={`text-xs font-medium ${getStatusColor(output.status.description)}`}>
                  {output.status.description}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {output && (
              <>
                <button
                  onClick={() => {
                    const outputText = output.stdout || output.stderr || "No output"
                    navigator.clipboard.writeText(outputText)
                  }}
                  className="p-1.5 text-gray-400 hover:text-white transition-colors"
                  title="Copy output"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-white transition-colors" title="Download output">
                  <Download className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output Content */}
        <div className="flex-1 overflow-auto">
          {isRunning ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-[#00af9b] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-300">Executing your code...</span>
              </div>
            </div>
          ) : output ? (
            <div className="p-4 space-y-4">
              {/* Execution Stats */}
              {(output.time || output.memory) && (
                <div className="flex gap-6 text-sm">
                  {output.time && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Runtime:</span>
                      <span className="text-white font-mono">{output.time}s</span>
                    </div>
                  )}
                  {output.memory && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Memory:</span>
                      <span className="text-white font-mono">{output.memory} KB</span>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Output */}
              {output.stdout && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Standard Output:</h3>
                  <pre className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-3 text-green-400 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                    {output.stdout}
                  </pre>
                </div>
              )}

              {/* Compilation Error */}
              {output.compile_output && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Compilation Error:</h3>
                  <pre className="bg-[#2a2a2a] border border-red-900 rounded-lg p-3 text-red-400 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                    {output.compile_output}
                  </pre>
                </div>
              )}

              {/* Runtime Error */}
              {output.stderr && (
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Runtime Error:</h3>
                  <pre className="bg-[#2a2a2a] border border-red-900 rounded-lg p-3 text-red-400 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                    {output.stderr}
                  </pre>
                </div>
              )}

              {/* No output message */}
              {!output.stdout && !output.stderr && !output.compile_output && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm">No output generated</div>
                  <div className="text-gray-500 text-xs mt-1">
                    Your program completed successfully but produced no output
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-400 text-lg mb-2">Ready to run</div>
                <div className="text-gray-500 text-sm">Click "Run Code" to execute your program</div>
              </div>
            </div>
          )}
        </div>

        {/* Output Footer */}
        {output && (
          <div className="h-8 bg-[#262626] border-t border-[#3a3a3a] flex items-center justify-between px-4 text-xs text-gray-400">
            <div>Execution completed at {new Date().toLocaleTimeString()}</div>
            <div className="flex items-center gap-4">
              {output.stdout && <span>Output: {output.stdout.length} chars</span>}
              {output.stderr && <span>Error: {output.stderr.length} chars</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

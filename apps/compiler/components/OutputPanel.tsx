"use client"

import { Clock, MemoryStick, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import type { SubmissionResult } from "@/lib/types"

interface OutputPanelProps {
  result: SubmissionResult | null
  isRunning: boolean
}

export default function OutputPanel({ result, isRunning }: OutputPanelProps) {
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
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
    }
  }

  return (
    <div className="h-full bg-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Output</h2>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {isRunning ? (
          <div className="flex items-center justify-center h-32">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-300">Executing code...</span>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusIcon(result.status.description)}
              <span className={`font-medium ${getStatusColor(result.status.description)}`}>
                {result.status.description}
              </span>
            </div>

            {/* Execution Stats */}
            {(result.time || result.memory) && (
              <div className="flex gap-4 text-sm text-gray-400">
                {result.time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{result.time}s</span>
                  </div>
                )}
                {result.memory && (
                  <div className="flex items-center gap-1">
                    <MemoryStick className="w-4 h-4" />
                    <span>{result.memory} KB</span>
                  </div>
                )}
              </div>
            )}

            {/* Output */}
            {result.stdout && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Output:</h3>
                <pre className="bg-gray-900 p-3 rounded-lg text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
                  {result.stdout}
                </pre>
              </div>
            )}

            {/* Compilation Error */}
            {result.compile_output && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Compilation Error:</h3>
                <pre className="bg-gray-900 p-3 rounded-lg text-red-400 text-sm overflow-x-auto whitespace-pre-wrap">
                  {result.compile_output}
                </pre>
              </div>
            )}

            {/* Runtime Error */}
            {result.stderr && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Runtime Error:</h3>
                <pre className="bg-gray-900 p-3 rounded-lg text-red-400 text-sm overflow-x-auto whitespace-pre-wrap">
                  {result.stderr}
                </pre>
              </div>
            )}

            {/* No output message */}
            {!result.stdout && !result.stderr && !result.compile_output && (
              <div className="text-gray-400 text-sm">No output generated.</div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-400">Click "Run Code" to see the output</div>
        )}
      </div>
    </div>
  )
}

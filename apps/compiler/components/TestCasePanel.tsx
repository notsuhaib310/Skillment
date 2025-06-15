"use client"

import { useState } from "react"
import { Play, Plus } from "lucide-react"
import type { TestCase, SubmissionResult } from "@/lib/types"

interface TestCasePanelProps {
  testCases: TestCase[]
  onTestCaseChange: (testCases: TestCase[]) => void
  onRunCode: () => void
  isRunning: boolean
  output: SubmissionResult | null
}

export default function TestCasePanel({
  testCases,
  onTestCaseChange,
  onRunCode,
  isRunning,
  output,
}: TestCasePanelProps) {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase")

  const handleTestCaseSelect = (id: number) => {
    const updatedTestCases = testCases.map((tc) => ({
      ...tc,
      isActive: tc.id === id,
    }))
    onTestCaseChange(updatedTestCases)
  }

  const activeTestCase = testCases.find((tc) => tc.isActive)

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a]">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-[#3a3a3a] bg-[#262626] px-4 py-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("testcase")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium ${
              activeTab === "testcase" ? "bg-[#00af9b] text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 bg-[#00af9b] rounded-full"></span>
            Testcase
          </button>
          <button
            onClick={() => setActiveTab("result")}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              activeTab === "result" ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            Test Result
          </button>
        </div>

        <button
          onClick={onRunCode}
          disabled={isRunning}
          className="flex items-center gap-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] disabled:bg-[#2a2a2a] px-3 py-1.5 rounded text-sm text-white disabled:text-gray-500"
        >
          {isRunning ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Running...
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              Run
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "testcase" ? (
          <div className="h-full flex flex-col">
            {/* Test Case Tabs */}
            <div className="flex items-center gap-2 p-4 border-b border-[#3a3a3a]">
              {testCases.map((testCase) => (
                <button
                  key={testCase.id}
                  onClick={() => handleTestCaseSelect(testCase.id)}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    testCase.isActive ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                  }`}
                >
                  Case {testCase.id}
                </button>
              ))}
              <button className="p-1.5 text-gray-400 hover:text-white">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Test Case Content */}
            {activeTestCase && (
              <div className="flex-1 p-4 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Input:</label>
                  <div className="bg-[#2a2a2a] p-3 rounded font-mono text-sm text-white">{activeTestCase.input}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Expected Output:</label>
                  <div className="bg-[#2a2a2a] p-3 rounded font-mono text-sm text-white">{activeTestCase.output}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full p-4">
            {output ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      output.status.description === "Accepted" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span
                    className={`font-medium ${
                      output.status.description === "Accepted" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {output.status.description}
                  </span>
                </div>

                {output.stdout && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Output:</label>
                    <div className="bg-[#2a2a2a] p-3 rounded font-mono text-sm text-green-400">{output.stdout}</div>
                  </div>
                )}

                {output.stderr && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Error:</label>
                    <div className="bg-[#2a2a2a] p-3 rounded font-mono text-sm text-red-400">{output.stderr}</div>
                  </div>
                )}

                {(output.time || output.memory) && (
                  <div className="flex gap-4 text-sm text-gray-400">
                    {output.time && <span>Runtime: {output.time}s</span>}
                    {output.memory && <span>Memory: {output.memory} KB</span>}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">Run your code to see the results</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

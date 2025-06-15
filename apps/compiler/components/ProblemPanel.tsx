"use client"

import { MessageSquare, Bookmark, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Problem } from "@/lib/types"

interface ProblemPanelProps {
  problem: Problem
  activeTab: "description" | "editorial" | "solutions" | "submissions"
  onTabChange: (tab: "description" | "editorial" | "solutions" | "submissions") => void
}

export default function ProblemPanel({ problem, activeTab, onTabChange }: ProblemPanelProps) {
  const tabs = [
    { id: "description", label: "Description", icon: "📝" },
    { id: "editorial", label: "Editorial", icon: "📖" },
    { id: "solutions", label: "Solutions", icon: "💡" },
    { id: "submissions", label: "Submissions", icon: "📊" },
  ] as const

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[#3a3a3a] bg-[#1a1a1a]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? "text-white border-[#00af9b]" : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "description" && (
          <div className="space-y-6">
            {/* Problem Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold text-white">
                  {problem.id}. {problem.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    problem.difficulty === "Easy"
                      ? "bg-green-900 text-green-300"
                      : problem.difficulty === "Medium"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-red-900 text-red-300"
                  }`}
                >
                  {problem.difficulty}
                </span>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs">Topics</span>
                  {problem.topics.map((topic) => (
                    <span key={topic} className="text-xs bg-[#3a3a3a] px-2 py-1 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-xs">Companies</span>
                  <span className="text-xs bg-[#3a3a3a] px-2 py-1 rounded">Google</span>
                </div>
              </div>
            </div>

            {/* Problem Description */}
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">{problem.description}</p>

              <div className="space-y-4">
                {problem.examples.map((example, index) => (
                  <div key={index} className="bg-[#2a2a2a] p-4 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Example {index + 1}:</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Input: </span>
                        <span className="text-white font-mono">{example.input}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Output: </span>
                        <span className="text-white font-mono">{example.output}</span>
                      </div>
                      {example.explanation && (
                        <div>
                          <span className="text-gray-400">Explanation: </span>
                          <span className="text-gray-300">{example.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              <div>
                <h3 className="text-white font-medium mb-2">Constraints:</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  {problem.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-500">•</span>
                      <span className="font-mono">{constraint}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Follow-up */}
              {problem.followUp && (
                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Follow-up:</h3>
                  <p className="text-gray-300 text-sm">{problem.followUp}</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="border-t border-[#3a3a3a] pt-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div>
                  <span>Accepted: </span>
                  <span className="text-white font-medium">4,094,368</span>
                  <span className="text-gray-500">/13.5M</span>
                </div>
                <div>
                  <span>Acceptance Rate: </span>
                  <span className="text-white font-medium">30.3%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-[#3a3a3a]">
              <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm">14.2K</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm">544</span>
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-white">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

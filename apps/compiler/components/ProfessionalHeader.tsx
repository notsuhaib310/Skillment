"use client"

import { useState } from "react"
import { Code2, Settings, User, Crown, Github, Share2 } from "lucide-react"
import ShareModal from "./ShareModal"
import type { Language } from "@/lib/types"

interface ProfessionalHeaderProps {
  code?: string
  language?: Language
}

export default function ProfessionalHeader({ code = "", language }: ProfessionalHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false)

  const handleShare = () => {
    if (code.trim()) {
      setShowShareModal(true)
    } else {
      // Show a toast or alert that there's no code to share
      alert("Please write some code before sharing!")
    }
  }

  return (
    <>
      <header className="h-[60px] bg-[#262626] border-b border-[#3a3a3a] flex items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF6B35] rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CodeRunner</h1>
              <p className="text-xs text-gray-400">Professional Code Execution Platform</p>
            </div>
          </div>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#3a3a3a] px-3 py-1.5 rounded-lg border border-[#4a4a4a]">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">Judge0 Connected</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-[#3a3a3a] hover:bg-[#4a4a4a] px-3 py-2 rounded-lg transition-colors border border-[#4a4a4a]"
            title="Share Code Snippet"
          >
            <Share2 className="w-4 h-4 text-[#FF6B35]" />
            <span className="text-white text-sm font-medium">Share</span>
          </button>

          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors">
            <Github className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-[#FF6B35] text-sm font-medium">Pro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      {language && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          code={code}
          language={language}
          title="My Code Snippet"
        />
      )}
    </>
  )
}

"use client"

import { useState } from "react"
import { Code2, Share2, Menu, X, Github, BookOpen, Users, Zap, ArrowRight, Play } from "lucide-react"
import ShareModal from "./ShareModal"
import type { Language } from "@/lib/types"

interface PublicHeaderProps {
  code?: string
  language?: Language
}

export default function PublicHeader({ code = "", language }: PublicHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleShare = () => {
    if (code.trim()) {
      setShowShareModal(true)
    } else {
      alert("Please write some code before sharing!")
    }
  }

  return (
    <>
      <header className="h-16 bg-gradient-to-r from-[#1a1a1a] via-[#262626] to-[#1a1a1a] border-b border-[#3a3a3a] shadow-lg">
        <div className="h-full flex items-center justify-between px-6">
          {/* Left Section - Logo & Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-xl flex items-center justify-center shadow-lg">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Skillment
                </h1>
                <p className="text-xs text-green-400 font-medium">Free • Open • For Everyone</p>
              </div>
            </div>

            {/* Navigation Menu - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              <a
                href="#"
                className="flex items-center gap-2 text-white hover:text-[#FF6B35] transition-colors font-medium"
              >
                <Play className="w-4 h-4" />
                Code Editor
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-300 hover:text-[#FF6B35] transition-colors font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Learn
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-300 hover:text-[#FF6B35] transition-colors font-medium"
              >
                <Users className="w-4 h-4" />
                Community
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-300 hover:text-[#FF6B35] transition-colors font-medium"
              >
                <Github className="w-4 h-4" />
                Open Source
              </a>
            </nav>
          </div>

          {/* Center Section - Value Proposition */}
          <div className="hidden xl:flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-300">
                <span className="text-green-400 font-semibold">100% Free</span> • No Limits • No Ads
              </div>
              <div className="text-xs text-gray-400">Empowering developers worldwide</div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3">
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] hover:from-[#E55A2B] hover:to-[#D54A1F] px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Share Code Snippet"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Share</span>
            </button>

            {/* Try Premium */}
            <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">Try Premium</span>
            </button>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button className="px-4 py-2 text-gray-300 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors font-medium">
                Sign In
              </button>
              <button className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden bg-[#1a1a1a] border-t border-[#3a3a3a]">
            <nav className="p-4 space-y-2">
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-white hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                Code Editor
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Learn
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                Community
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <Github className="w-4 h-4" />
                Open Source
              </a>

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-[#3a3a3a] space-y-2">
                <button className="w-full p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors text-left">
                  Sign In
                </button>
                <button className="w-full p-3 bg-white text-black hover:bg-gray-100 rounded-lg transition-colors font-semibold">
                  Get Started Free
                </button>
                <button className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg transition-colors font-semibold">
                  Try Premium
                </button>
              </div>
            </nav>
          </div>
        )}
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

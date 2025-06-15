"use client"

import { useState } from "react"
import {
  Code2,
  Settings,
  Github,
  Share2,
  Bell,
  Search,
  BookOpen,
  Users,
  Zap,
  Menu,
  X,
  Home,
  FileCode,
  Target,
  HelpCircle,
  User,
  ChevronDown,
  Heart,
  Coffee,
  Star,
  ExternalLink,
  Mail,
  Globe,
} from "lucide-react"
import ShareModal from "./ShareModal"
import type { Language } from "@/lib/types"

interface SkillmentHeaderProps {
  code?: string
  language?: Language
}

export default function SkillmentHeader({ code = "", language }: SkillmentHeaderProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAboutMenu, setShowAboutMenu] = useState(false)

  const handleShare = () => {
    if (code.trim()) {
      setShowShareModal(true)
    } else {
      alert("Please write some code before sharing!")
    }
  }

  const notifications = [
    {
      id: 1,
      title: "New Feature Available",
      message: "Code preview mode is now available!",
      time: "2m ago",
      unread: true,
    },
    {
      id: 2,
      title: "Server Update",
      message: "Judge0 server has been updated for better performance",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      title: "New Language Support",
      message: "Rust and Go are now supported!",
      time: "3h ago",
      unread: false,
    },
  ]

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
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Zap className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Skillment
                </h1>
                <p className="text-xs text-[#FF6B35] font-medium">Code • Execute • Share</p>
              </div>
            </div>

            {/* Navigation Menu - Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              <a
                href="#"
                className="flex items-center gap-2 text-white hover:text-[#FF6B35] transition-colors font-medium"
              >
                <Home className="w-4 h-4" />
                Home
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-300 hover:text-[#FF6B35] transition-colors font-medium"
              >
                <FileCode className="w-4 h-4" />
                Code Editor
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-300 hover:text-[#FF6B35] transition-colors font-medium"
              >
                <Target className="w-4 h-4" />
                Examples
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-300 hover:text-[#FF6B35] transition-colors font-medium"
              >
                <BookOpen className="w-4 h-4" />
                Documentation
              </a>
              <a
                href="#"
                className="flex items-center gap-2 text-gray-300 hover:text-[#FF6B35] transition-colors font-medium"
              >
                <Users className="w-4 h-4" />
                Community
              </a>
            </nav>
          </div>

          {/* Center Section - Search & Status */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search examples, docs..."
                className="w-80 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:border-transparent"
              />
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-2 rounded-lg border border-[#3a3a3a]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300 font-medium">Judge0 Online</span>
            </div>
          </div>

          {/* Right Section - Actions & About */}
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

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  2
                </span>
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl shadow-xl z-50 custom-scrollbar">
                  <div className="p-4 border-b border-[#3a3a3a]">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors ${notification.unread ? "bg-[#FF6B35]/5" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? "bg-[#FF6B35]" : "bg-gray-600"}`}
                          ></div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                            <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                            <span className="text-gray-500 text-xs">{notification.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-[#3a3a3a]">
                    <button className="w-full text-[#FF6B35] text-sm font-medium hover:text-[#E55A2B] transition-colors">
                      View All Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors"
                title="GitHub Repository"
              >
                <Github className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors"
                title="Help & Documentation"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Made by Suhaib King Section */}
            <div className="relative">
              <button
                onClick={() => setShowAboutMenu(!showAboutMenu)}
                className="flex items-center gap-3 p-2 hover:bg-[#3a3a3a] rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Heart className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-white font-semibold text-sm">Suhaib King</div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-[#FF6B35] text-xs font-medium">Creator</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </button>

              {/* About Dropdown */}
              {showAboutMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-[#3a3a3a]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Suhaib King</div>
                        <div className="text-gray-400 text-sm">Full Stack Developer</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          <span className="text-red-400 text-xs">Made with passion</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="p-3 bg-gradient-to-r from-[#FF6B35]/10 to-[#E55A2B]/10 border border-[#FF6B35]/20 rounded-lg mb-2">
                      <div className="text-white font-medium text-sm mb-1">About Skillment</div>
                      <div className="text-gray-300 text-xs">
                        A powerful online code execution platform built to help developers write, test, and share code
                        seamlessly.
                      </div>
                    </div>

                    <a href="#" className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                      <Github className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-white text-sm">View Source Code</span>
                        <div className="text-gray-400 text-xs">Open source on GitHub</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>

                    <a href="#" className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-white text-sm">Portfolio</span>
                        <div className="text-gray-400 text-xs">Check out my other projects</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>

                    <a href="#" className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-white text-sm">Contact</span>
                        <div className="text-gray-400 text-xs">Get in touch for feedback</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>

                    <a href="#" className="flex items-center gap-3 p-3 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                      <Coffee className="w-4 h-4 text-yellow-600" />
                      <div className="flex-1">
                        <span className="text-white text-sm">Buy me a coffee</span>
                        <div className="text-gray-400 text-xs">Support the project</div>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>
                  </div>

                  <div className="p-3 border-t border-[#3a3a3a] bg-[#262626] rounded-b-xl">
                    <div className="text-center text-xs text-gray-400">Built with ❤️ by Suhaib King • © 2024</div>
                  </div>
                </div>
              )}
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
                <Home className="w-4 h-4" />
                Home
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <FileCode className="w-4 h-4" />
                Code Editor
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <Target className="w-4 h-4" />
                Examples
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Documentation
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors"
              >
                <Users className="w-4 h-4" />
                Community
              </a>
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
    </>
  )
}

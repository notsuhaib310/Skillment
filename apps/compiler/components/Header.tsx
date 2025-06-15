"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Code2 } from "lucide-react"
import type { Language } from "@/lib/types"
import { SUPPORTED_LANGUAGES } from "@/lib/constants"

interface HeaderProps {
  selectedLanguage: Language
  onLanguageChange: (language: Language) => void
}

export default function Header({ selectedLanguage, onLanguageChange }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 lg:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Code2 className="w-8 h-8 text-blue-500" />
        <span className="text-xl font-bold text-white">CodeRunner</span>
      </div>

      {/* Language Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <span className="text-white font-medium">{selectedLanguage.name}</span>
          <ChevronDown className={`w-4 h-4 text-gray-300 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.id}
                onClick={() => {
                  onLanguageChange(language)
                  setIsDropdownOpen(false)
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                  selectedLanguage.id === language.id ? "bg-gray-700 text-blue-400" : "text-white"
                }`}
              >
                {language.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

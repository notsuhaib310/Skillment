"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type Language = "python" | "java"

interface LanguageSelectorProps {
  language: Language
  setLanguage: (language: Language) => void
}

export const LanguageSelector = ({ language, setLanguage }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const languages = [
    { id: "python", name: "Python", icon: "🐍" },
    { id: "java", name: "Java", icon: "☕" },
  ]

  const currentLanguage = languages.find((lang) => lang.id === language)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <span>{currentLanguage?.icon}</span>
        <span>{currentLanguage?.name}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-0 mt-2 w-full bg-black/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden shadow-xl z-10"
        >
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                setLanguage(lang.id as Language)
                setIsOpen(false)
              }}
              className={cn(
                "w-full flex items-center space-x-2 px-4 py-2 hover:bg-white/10 transition-colors",
                language === lang.id ? "bg-white/10" : "",
              )}
            >
              <span>{lang.icon}</span>
              <span>{lang.name}</span>
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

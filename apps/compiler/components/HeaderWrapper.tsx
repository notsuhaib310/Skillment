"use client"

import { useState } from "react"
import PublicHeader from "./PublicHeader"
import SkillmentHeader from "./SkillmentHeader"
import type { Language } from "@/lib/types"

interface HeaderWrapperProps {
  code?: string
  language?: Language
}

export default function HeaderWrapper({ code, language }: HeaderWrapperProps) {
  // This would normally come from your auth system
  // For demo purposes, you can toggle this
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Demo toggle button (remove in production)
  const toggleAuth = () => {
    setIsLoggedIn(!isLoggedIn)
  }

  return (
    <div className="relative">
      {isLoggedIn ? (
        <SkillmentHeader code={code} language={language} />
      ) : (
        <PublicHeader code={code} language={language} />
      )}

      {/* Demo Toggle Button - Remove in production */}
      <button
        onClick={toggleAuth}
        className="fixed top-20 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
      >
        Demo: {isLoggedIn ? "Logout" : "Login"}
      </button>
    </div>
  )
}

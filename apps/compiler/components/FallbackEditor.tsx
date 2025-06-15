"use client"

import type { Language } from "@/lib/types"

interface FallbackEditorProps {
  code: string
  language: Language
  onChange: (value: string) => void
}

export default function FallbackEditor({ code, language, onChange }: FallbackEditorProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 bg-gray-700 text-sm text-gray-300 border-b border-gray-600">
        Simple Text Editor (Monaco Editor failed to load)
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full p-4 bg-gray-800 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border-none"
        placeholder={`Write your ${language.name} code here...`}
        spellCheck={false}
        style={{
          fontFamily: "JetBrains Mono, Consolas, Monaco, 'Courier New', monospace",
          lineHeight: "1.5",
          tabSize: 2,
        }}
      />
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import type { Language } from "@/lib/types"

interface CodeEditorProps {
  code: string
  language: Language
  onChange: (value: string) => void
  onError?: () => void
}

export default function CodeEditor({ code, language, onChange, onError }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  useEffect(() => {
    if (editorRef.current && !monacoRef.current) {
      // Configure Monaco Editor theme
      monaco.editor.defineTheme("leetcode-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955" },
          { token: "keyword", foreground: "569CD6" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
        ],
        colors: {
          "editor.background": "#1F2937",
          "editor.foreground": "#F9FAFB",
          "editorLineNumber.foreground": "#6B7280",
          "editor.selectionBackground": "#374151",
          "editor.lineHighlightBackground": "#374151",
          "editorCursor.foreground": "#F9FAFB",
          "editor.selectionHighlightBackground": "#374151",
        },
      })

      try {
        monacoRef.current = monaco.editor.create(editorRef.current, {
          value: code,
          language: language.monacoLanguage,
          theme: "leetcode-dark",
          fontSize: 14,
          fontFamily: "JetBrains Mono, Consolas, Monaco, 'Courier New', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: "on",
          lineNumbers: "on",
          renderLineHighlight: "line",
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false, // Explicitly set to false
          cursorStyle: "line",
          folding: true,
          foldingHighlight: true,
          showFoldingControls: "mouseover",
          contextmenu: true,
          mouseWheelZoom: true,
          smoothScrolling: true,
          cursorBlinking: "blink",
          renderWhitespace: "selection",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        })

        // Set up change listener
        monacoRef.current.onDidChangeModelContent(() => {
          if (monacoRef.current) {
            const newValue = monacoRef.current.getValue()
            onChange(newValue)
          }
        })

        // Focus the editor after creation
        setTimeout(() => {
          if (monacoRef.current) {
            monacoRef.current.focus()
            setIsEditorReady(true)
          }
        }, 100)

        console.log("Monaco Editor initialized successfully")
      } catch (error) {
        console.error("Failed to initialize Monaco Editor:", error)
        if (onError) {
          onError()
        }
      }
    }

    return () => {
      if (monacoRef.current) {
        monacoRef.current.dispose()
        monacoRef.current = null
        setIsEditorReady(false)
      }
    }
  }, [])

  // Update code when prop changes
  useEffect(() => {
    if (monacoRef.current && isEditorReady) {
      const currentValue = monacoRef.current.getValue()
      if (currentValue !== code) {
        monacoRef.current.setValue(code)
        // Focus after setting value
        setTimeout(() => {
          if (monacoRef.current) {
            monacoRef.current.focus()
          }
        }, 50)
      }
    }
  }, [code, isEditorReady])

  // Update language when prop changes
  useEffect(() => {
    if (monacoRef.current && isEditorReady) {
      const model = monacoRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language.monacoLanguage)
      }
    }
  }, [language, isEditorReady])

  // Handle click to focus
  const handleClick = () => {
    if (monacoRef.current) {
      monacoRef.current.focus()
    }
  }

  return (
    <div ref={editorRef} className="w-full h-full cursor-text" onClick={handleClick} style={{ minHeight: "400px" }} />
  )
}

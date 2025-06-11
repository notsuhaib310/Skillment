"use client"
import { useEffect, useRef } from "react"
import type * as monaco from "monaco-editor"

interface CodeEditorProps {
  language: string
  value: string
  onChange: (value: string) => void
  theme?: string
}

export const CodeEditor = ({ language, value, onChange, theme = "vs-dark" }: CodeEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      // This is a simplified version - in a real implementation, you would use the actual Monaco Editor
      // For now, we'll use a basic textarea with syntax highlighting simulation
      const editor = document.createElement("textarea")
      editor.value = value
      editor.className = "w-full h-full bg-black/50 text-white font-mono p-4 resize-none focus:outline-none"
      editor.spellcheck = false

      editor.addEventListener("input", () => {
        onChange(editor.value)
      })

      // Add keyboard shortcuts
      editor.addEventListener("keydown", (e) => {
        // Ctrl+Enter to run code
        if (e.ctrlKey && e.key === "Enter") {
          e.preventDefault()
          // This would trigger the run code function
          // In a real implementation, you would pass this as a prop
        }

        // Ctrl+S to save
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault()
          // This would trigger the save function
          // In a real implementation, you would pass this as a prop
        }
      })

      editorRef.current.innerHTML = ""
      editorRef.current.appendChild(editor)

      return () => {
        if (editorRef.current) {
          editorRef.current.innerHTML = ""
        }
      }
    }
  }, [])

  // Update editor value when language changes
  useEffect(() => {
    if (editorRef.current) {
      const textarea = editorRef.current.querySelector("textarea")
      if (textarea) {
        textarea.value = value
      }
    }
  }, [value])

  return <div ref={editorRef} className="w-full h-full" />
}

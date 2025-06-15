"use client"

import { useRef, useEffect, useState } from "react"
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from "lucide-react"
import * as monaco from "monaco-editor"
import type { Language } from "@/lib/types"

interface MonacoCodeEditorProps {
  code: string
  language: Language
  onChange: (value: string) => void
}

export default function MonaccoEditor({ code, language, onChange }: MonacoCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [fontSize, setFontSize] = useState(14)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  // Initialize Monaco Editor
  useEffect(() => {
    if (editorRef.current && !monacoEditorRef.current) {
      // Configure Monaco Editor theme
      monaco.editor.defineTheme("skillment-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955" },
          { token: "keyword", foreground: "569CD6" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "type", foreground: "4EC9B0" },
          { token: "function", foreground: "DCDCAA" },
          { token: "variable", foreground: "9CDCFE" },
          { token: "operator", foreground: "D4D4D4" },
          { token: "delimiter", foreground: "D4D4D4" },
        ],
        colors: {
          "editor.background": "#1a1a1a",
          "editor.foreground": "#D4D4D4",
          "editorLineNumber.foreground": "#858585",
          "editorLineNumber.activeForeground": "#FF6B35",
          "editor.selectionBackground": "#264F78",
          "editor.lineHighlightBackground": "#2a2a2a",
          "editorCursor.foreground": "#FF6B35",
          "editor.selectionHighlightBackground": "#264F78",
          "editorIndentGuide.background": "#404040",
          "editorIndentGuide.activeBackground": "#FF6B35",
          "editorBracketMatch.background": "#264F78",
          "editorBracketMatch.border": "#FF6B35",
          "editorSuggestWidget.background": "#1a1a1a",
          "editorSuggestWidget.border": "#3a3a3a",
          "editorSuggestWidget.selectedBackground": "#264F78",
          "editorSuggestWidget.highlightForeground": "#FF6B35",
        },
      })

      try {
        monacoEditorRef.current = monaco.editor.create(editorRef.current, {
          value: code,
          language: language.monacoLanguage,
          theme: "skillment-dark",
          fontSize: fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, monospace",
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
          readOnly: false,
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
          suggest: {
            preview: true,
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
            showFields: true,
            showVariables: true,
            showClasses: true,
            showStructs: true,
            showInterfaces: true,
            showModules: true,
            showProperties: true,
            showEvents: true,
            showOperators: true,
            showUnits: true,
            showValues: true,
            showConstants: true,
            showEnums: true,
            showEnumMembers: true,
            showKeywords: true,
            showWords: true,
            showColors: true,
            showFiles: true,
            showReferences: true,
            showFolders: true,
            showTypeParameters: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true,
          },
          parameterHints: {
            enabled: true,
          },
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          wordBasedSuggestions: "currentDocument",
        })

        // Set up change listener
        monacoEditorRef.current.onDidChangeModelContent(() => {
          if (monacoEditorRef.current) {
            const newValue = monacoEditorRef.current.getValue()
            onChange(newValue)
          }
        })

        // Set up cursor position listener
        monacoEditorRef.current.onDidChangeCursorPosition((e) => {
          setCursorPosition({
            line: e.position.lineNumber,
            column: e.position.column,
          })
        })

        // Focus the editor after creation
        setTimeout(() => {
          if (monacoEditorRef.current) {
            monacoEditorRef.current.focus()
          }
        }, 100)
      } catch (error) {
        console.error("Failed to initialize Monaco Editor:", error)
      }
    }

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose()
        monacoEditorRef.current = null
      }
    }
  }, [])

  // Update code when prop changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      const currentValue = monacoEditorRef.current.getValue()
      if (currentValue !== code) {
        monacoEditorRef.current.setValue(code)
      }
    }
  }, [code])

  // Update language when prop changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, language.monacoLanguage)
      }
    }
  }, [language])

  // Update font size when it changes
  useEffect(() => {
    if (monacoEditorRef.current) {
      monacoEditorRef.current.updateOptions({ fontSize })
    }
  }, [fontSize])

  // Zoom controls
  const handleZoomIn = () => setFontSize((prev) => Math.min(prev + 2, 24))
  const handleZoomOut = () => setFontSize((prev) => Math.max(prev - 2, 10))
  const handleResetZoom = () => setFontSize(14)

  return (
    <div className="w-full h-full relative group bg-[#1a1a1a] flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#2a2a2a] rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3 h-3" />
        </button>
        <span className="text-xs text-gray-400 px-2 min-w-[3rem] text-center">{fontSize}px</span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3 h-3" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Editor Container */}
      <div ref={editorRef} className="flex-1 bg-[#1a1a1a] overflow-hidden" />

      {/* Status Bar */}
      <div className="h-6 bg-[#262626] border-t border-[#3a3a3a] flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>{language.name}</span>
          <span>{code.split("\n").length} lines</span>
          <span>{code.length} characters</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        </div>
      </div>
    </div>
  )
} 
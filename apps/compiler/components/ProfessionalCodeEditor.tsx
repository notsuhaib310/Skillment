"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from "lucide-react"
import CodePreview from "./CodePreview"
import type { Language } from "@/lib/types"

interface ProfessionalCodeEditorProps {
  code: string
  language: Language
  onChange: (value: string) => void
}

export default function ProfessionalCodeEditor({ code, language, onChange }: ProfessionalCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [fontSize, setFontSize] = useState(14)
  const [lineCount, setLineCount] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })

  // Update line count when code changes
  useEffect(() => {
    const lines = code.split("\n").length
    setLineCount(lines)
  }, [code])

  // Update cursor position
  const updateCursorPosition = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const text = textarea.value.substring(0, textarea.selectionStart)
      const lines = text.split("\n")
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      setCursorPosition({ line, column })
    }
  }

  // Handle input changes
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    updateCursorPosition()
  }

  // Handle selection changes
  const handleSelectionChange = () => {
    updateCursorPosition()
  }

  // Render highlighted code with React components
  const renderHighlightedCode = (code: string, language: string) => {
    const lines = code.split("\n")

    const highlightLine = (line: string, lineIndex: number) => {
      const tokens = tokenizeLine(line, language)

      return (
        <div key={lineIndex} className="leading-relaxed" style={{ lineHeight: `${fontSize * 1.5}px` }}>
          {tokens.map((token, tokenIndex) => (
            <span key={tokenIndex} className={getTokenClass(token.type)}>
              {token.value}
            </span>
          ))}
          {line === "" && <br />}
        </div>
      )
    }

    return lines.map((line, index) => highlightLine(line, index))
  }

  const tokenizeLine = (line: string, language: string) => {
    const tokens: Array<{ type: string; value: string }> = []
    let remaining = line

    const patterns = {
      javascript: [
        {
          type: "keyword",
          pattern:
            /^(function|const|let|var|if|else|for|while|return|class|import|export|from|async|await|try|catch|finally|console)\b/,
        },
        { type: "string", pattern: /^("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)/ },
        { type: "comment", pattern: /^(\/\/.*$|\/\*[\s\S]*?\*\/)/ },
        { type: "number", pattern: /^\b\d+\.?\d*\b/ },
        { type: "boolean", pattern: /^(true|false|null|undefined)\b/ },
        { type: "operator", pattern: /^[+\-*/%=<>!&|]+/ },
        { type: "punctuation", pattern: /^[{}[\]();,.]/ },
      ],
      python: [
        {
          type: "keyword",
          pattern:
            /^(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield|global|nonlocal|print)\b/,
        },
        { type: "string", pattern: /^("""[\s\S]*?"""|"([^"\\]|\\.)*"|'([^'\\]|\\.)*')/ },
        { type: "comment", pattern: /^#.*$/ },
        { type: "number", pattern: /^\b\d+\.?\d*\b/ },
        { type: "boolean", pattern: /^(True|False|None)\b/ },
        { type: "operator", pattern: /^[+\-*/%=<>!&|]+/ },
        { type: "punctuation", pattern: /^[{}[\]();,.]/ },
      ],
      java: [
        {
          type: "keyword",
          pattern:
            /^(public|private|protected|static|final|class|interface|extends|implements|if|else|for|while|return|import|package|try|catch|finally|new|this|super|System)\b/,
        },
        { type: "string", pattern: /^("([^"\\]|\\.)*")/ },
        { type: "comment", pattern: /^(\/\/.*$|\/\*[\s\S]*?\*\/)/ },
        { type: "number", pattern: /^\b\d+\.?\d*[fFdDlL]?\b/ },
        { type: "boolean", pattern: /^(true|false|null)\b/ },
        { type: "operator", pattern: /^[+\-*/%=<>!&|]+/ },
        { type: "punctuation", pattern: /^[{}[\]();,.]/ },
      ],
      cpp: [
        {
          type: "keyword",
          pattern:
            /^(int|float|double|char|bool|void|string|class|struct|public|private|protected|if|else|for|while|return|include|using|namespace|try|catch|new|delete|this|cout|cin|endl)\b/,
        },
        { type: "string", pattern: /^("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/ },
        { type: "comment", pattern: /^(\/\/.*$|\/\*[\s\S]*?\*\/)/ },
        { type: "preprocessor", pattern: /^#\w+/ },
        { type: "number", pattern: /^\b\d+\.?\d*[fFdDlL]?\b/ },
        { type: "boolean", pattern: /^(true|false|nullptr)\b/ },
        { type: "operator", pattern: /^[+\-*/%=<>!&|]+/ },
        { type: "punctuation", pattern: /^[{}[\]();,.]/ },
      ],
    }

    const langPatterns = patterns[language as keyof typeof patterns] || patterns.javascript

    while (remaining.length > 0) {
      let matched = false

      for (const { type, pattern } of langPatterns) {
        const match = remaining.match(pattern)
        if (match) {
          tokens.push({ type, value: match[0] })
          remaining = remaining.slice(match[0].length)
          matched = true
          break
        }
      }

      if (!matched) {
        // Handle whitespace and unknown characters
        const whitespaceMatch = remaining.match(/^\s+/)
        if (whitespaceMatch) {
          tokens.push({ type: "whitespace", value: whitespaceMatch[0] })
          remaining = remaining.slice(whitespaceMatch[0].length)
        } else {
          tokens.push({ type: "text", value: remaining[0] })
          remaining = remaining.slice(1)
        }
      }
    }

    return tokens
  }

  const getTokenClass = (type: string) => {
    switch (type) {
      case "keyword":
        return "text-blue-400 font-medium"
      case "string":
        return "text-green-400"
      case "comment":
        return "text-gray-500 italic"
      case "number":
        return "text-orange-400"
      case "boolean":
        return "text-purple-400"
      case "operator":
        return "text-red-400"
      case "punctuation":
        return "text-yellow-400"
      case "preprocessor":
        return "text-purple-400"
      case "whitespace":
        return ""
      default:
        return "text-gray-300"
    }
  }

  // Handle key events for better editing experience
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget
    const { selectionStart, selectionEnd, value } = textarea

    // Tab key handling
    if (e.key === "Tab") {
      e.preventDefault()
      const newValue = value.substring(0, selectionStart) + "  " + value.substring(selectionEnd)
      onChange(newValue)

      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 2, selectionStart + 2)
        updateCursorPosition()
      }, 0)
    }

    // Auto-closing brackets
    const pairs: Record<string, string> = {
      "(": ")",
      "[": "]",
      "{": "}",
      '"': '"',
      "'": "'",
    }

    if (pairs[e.key] && selectionStart === selectionEnd) {
      e.preventDefault()
      const newValue = value.substring(0, selectionStart) + e.key + pairs[e.key] + value.substring(selectionEnd)
      onChange(newValue)

      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1)
        updateCursorPosition()
      }, 0)
    }

    // Enter key auto-indentation
    if (e.key === "Enter") {
      const currentLine = value.substring(0, selectionStart).split("\n").pop() || ""
      const indent = currentLine.match(/^\s*/)?.[0] || ""
      const extraIndent = currentLine.trim().endsWith("{") || currentLine.trim().endsWith(":") ? "  " : ""

      setTimeout(() => {
        const newValue =
          value.substring(0, selectionStart) + "\n" + indent + extraIndent + value.substring(selectionEnd)
        onChange(newValue)
        textarea.setSelectionRange(
          selectionStart + 1 + indent.length + extraIndent.length,
          selectionStart + 1 + indent.length + extraIndent.length,
        )
        updateCursorPosition()
      }, 0)
    }
  }

  // Zoom controls
  const handleZoomIn = () => setFontSize((prev) => Math.min(prev + 2, 24))
  const handleZoomOut = () => setFontSize((prev) => Math.max(prev - 2, 10))
  const handleResetZoom = () => setFontSize(14)

  // Generate line numbers
  const generateLineNumbers = () => {
    return Array.from({ length: Math.max(lineCount, 20) }, (_, i) => (
      <div
        key={i + 1}
        className={`line-number text-right px-2 select-none transition-colors ${
          i + 1 === cursorPosition.line ? "text-[#FF6B35] bg-[#2a2a2a]" : "text-gray-500"
        }`}
        style={{
          fontSize: "12px",
          lineHeight: `${fontSize * 1.5}px`,
          minHeight: `${fontSize * 1.5}px`,
        }}
      >
        {i + 1}
      </div>
    ))
  }

  if (showPreview) {
    return (
      <div className="w-full h-full relative group bg-[#1a1a1a] flex flex-col">
        {/* Preview Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#2a2a2a] rounded-lg p-1">
          <button
            onClick={() => setShowPreview(false)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
            title="Edit Mode"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>

        <div className="flex-1 p-4">
          <CodePreview
            code={code}
            language={language}
            title={`${language.name} Code Preview`}
            showLineNumbers={true}
            maxHeight="100%"
            className="h-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative group bg-[#1a1a1a] flex flex-col">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-[#2a2a2a] rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowPreview(true)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
          title="Preview Mode"
        >
          <Eye className="w-3 h-3" />
        </button>
        <div className="w-px h-4 bg-[#3a3a3a] mx-1"></div>
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
      <div ref={editorRef} className="flex-1 flex bg-[#1a1a1a] overflow-hidden">
        {/* Line Numbers */}
        <div className="flex-shrink-0 bg-[#1a1a1a] border-r border-[#333333] py-4 min-w-[50px] overflow-hidden">
          <div className="flex flex-col">{generateLineNumbers()}</div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative">
          {/* Syntax Highlighting Background */}
          <div
            className="absolute inset-0 p-4 pointer-events-none font-mono overflow-hidden"
            style={{
              fontSize: `${fontSize}px`,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, monospace",
            }}
          >
            {renderHighlightedCode(code, language.monacoLanguage)}
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onSelect={handleSelectionChange}
            onMouseUp={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            className="w-full h-full p-4 bg-transparent text-transparent border-none outline-none resize-none font-mono relative z-10 caret-[#FF6B35]"
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: `${fontSize * 1.5}px`,
              fontFamily:
                "'JetBrains Mono', 'Fira Code', 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', 'Source Code Pro', Menlo, Consolas, monospace",
              tabSize: 2,
            }}
            placeholder={`Write your ${language.name} code here...`}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#262626] border-t border-[#3a3a3a] flex items-center justify-between px-4 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>{language.name}</span>
          <span>{lineCount} lines</span>
          <span>{code.length} characters</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
        </div>
      </div>

      <style jsx>{`
        /* Custom scrollbar */
        textarea::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        textarea::-webkit-scrollbar-track {
          background: #1a1a1a;
        }

        textarea::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 6px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: #505050;
        }

        textarea::-webkit-scrollbar-corner {
          background: #1a1a1a;
        }

        /* Selection styling */
        textarea::selection {
          background: #ff6b3530;
        }

        /* Line number hover effect */
        .line-number:hover {
          color: #ff6b35;
          background: #2a2a2a;
        }
      `}</style>
    </div>
  )
}

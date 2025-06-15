"use client"

import { useState } from "react"
import { Copy, Check, Maximize2, Minimize2 } from "lucide-react"
import type { Language } from "@/lib/types"

interface CodePreviewProps {
  code: string
  language: Language
  title?: string
  showLineNumbers?: boolean
  maxHeight?: string
  className?: string
}

export default function CodePreview({
  code,
  language,
  title,
  showLineNumbers = true,
  maxHeight = "400px",
  className = "",
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy code:", error)
    }
  }

  const getLanguageColor = (lang: string) => {
    const colors = {
      javascript: "#f7df1e",
      python: "#3776ab",
      java: "#ed8b00",
      cpp: "#00599c",
      c: "#a8b9cc",
      csharp: "#239120",
      php: "#777bb4",
      ruby: "#cc342d",
      go: "#00add8",
      rust: "#000000",
    }
    return colors[lang as keyof typeof colors] || "#6b7280"
  }

  // Render code with proper React components instead of dangerouslySetInnerHTML
  const renderHighlightedCode = (code: string, language: string) => {
    const lines = code.split("\n")

    const highlightLine = (line: string, lineIndex: number) => {
      const tokens = tokenizeLine(line, language)

      return (
        <div key={lineIndex} className="flex">
          {showLineNumbers && (
            <span className="text-gray-500 text-right pr-4 select-none" style={{ minWidth: "3rem" }}>
              {lineIndex + 1}
            </span>
          )}
          <span className="flex-1">
            {tokens.map((token, tokenIndex) => (
              <span key={tokenIndex} className={getTokenClass(token.type)}>
                {token.value}
              </span>
            ))}
          </span>
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
      case "whitespace":
        return ""
      default:
        return "text-gray-300"
    }
  }

  const lines = code.split("\n")
  const lineCount = lines.length

  return (
    <div className={`bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#262626] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          {title && <span className="text-gray-300 text-sm font-medium">{title}</span>}
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getLanguageColor(language.monacoLanguage) }}
            ></div>
            <span className="text-gray-400 text-xs">{language.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">{lineCount} lines</span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div
        className="relative overflow-auto"
        style={{
          maxHeight: isExpanded ? "none" : maxHeight,
          height: isExpanded ? "auto" : undefined,
        }}
      >
        <div className="p-4">
          <pre className="text-sm font-mono leading-6 whitespace-pre-wrap">
            <code className="block">{renderHighlightedCode(code, language.monacoLanguage)}</code>
          </pre>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-[#262626] border-t border-[#3a3a3a] flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>{language.name}</span>
          <span>{code.length} characters</span>
        </div>
        <div className="flex items-center gap-2">
          <span>UTF-8</span>
          {copied && <span className="text-green-400">Copied!</span>}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { X, Copy, Check, Link, Twitter, Facebook, Linkedin, Download } from "lucide-react"
import CodePreview from "./CodePreview"
import type { Language } from "@/lib/types"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  code: string
  language: Language
  title?: string
}

export default function ShareModal({ isOpen, onClose, code, language, title = "Code Snippet" }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  // Generate shareable URL when modal opens
  useEffect(() => {
    if (isOpen && !shareUrl) {
      generateShareUrl()
    }
  }, [isOpen])

  const generateShareUrl = async () => {
    setIsGenerating(true)
    try {
      const encodedData = btoa(
        JSON.stringify({
          code,
          language: language.id,
          languageName: language.name,
          title,
          timestamp: Date.now(),
        }),
      )

      const baseUrl = window.location.origin + window.location.pathname
      const url = `${baseUrl}?shared=${encodedData}`
      setShareUrl(url)
    } catch (error) {
      console.error("Failed to generate share URL:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy URL to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      if (urlInputRef.current) {
        urlInputRef.current.select()
        document.execCommand("copy")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    }
  }

  // Copy code to clipboard
  const copyCode = async () => {
    await copyToClipboard(code)
  }

  // Download code as file
  const downloadCode = () => {
    const fileExtensions = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
      java: "java",
      php: "php",
      rust: "rs",
      go: "go",
      csharp: "cs",
      ruby: "rb",
    }

    const extension = fileExtensions[language.monacoLanguage as keyof typeof fileExtensions] || "txt"
    const filename = `${title.replace(/\s+/g, "_").toLowerCase()}.${extension}`

    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Social media sharing
  const shareToTwitter = () => {
    const text = `Check out this ${language.name} code snippet!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  // Generate QR code URL
  const getQRCodeUrl = () => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3a3a3a]">
          <div>
            <h2 className="text-xl font-bold text-white">Share Code Snippet</h2>
            <p className="text-gray-400 text-sm mt-1">
              {language.name} • {code.split("\n").length} lines • {code.length} characters
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share URL Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Shareable Link</h3>
            <div className="flex gap-2">
              <input
                ref={urlInputRef}
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-3 py-2 text-white text-sm font-mono"
                placeholder={isGenerating ? "Generating link..." : "Share URL will appear here"}
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                disabled={!shareUrl || isGenerating}
                className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-[#3a3a3a] px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:text-gray-500"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-gray-400 text-xs mt-2">Anyone with this link can view and run your code snippet</p>
          </div>

          {/* Code Preview Section */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
            <CodePreview code={code} language={language} title={title} showLineNumbers={true} maxHeight="300px" />
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyCode}
                className="flex items-center gap-3 p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a] rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5 text-[#FF6B35]" />
                <div className="text-left">
                  <div className="text-white font-medium">Copy Code</div>
                  <div className="text-gray-400 text-xs">Copy to clipboard</div>
                </div>
              </button>

              <button
                onClick={downloadCode}
                className="flex items-center gap-3 p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-[#3a3a3a] rounded-lg transition-colors"
              >
                <Download className="w-5 h-5 text-[#4ECDC4]" />
                <div className="text-left">
                  <div className="text-white font-medium">Download</div>
                  <div className="text-gray-400 text-xs">Save as .{language.monacoLanguage} file</div>
                </div>
              </button>
            </div>
          </div>

          {/* Social Media Sharing */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Share on Social Media</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={shareToTwitter}
                disabled={!shareUrl}
                className="flex items-center justify-center gap-2 p-3 bg-[#1DA1F2] hover:bg-[#1a91da] disabled:bg-[#3a3a3a] rounded-lg transition-colors disabled:text-gray-500"
              >
                <Twitter className="w-5 h-5" />
                <span className="text-white font-medium">Twitter</span>
              </button>

              <button
                onClick={shareToLinkedIn}
                disabled={!shareUrl}
                className="flex items-center justify-center gap-2 p-3 bg-[#0077B5] hover:bg-[#006ba1] disabled:bg-[#3a3a3a] rounded-lg transition-colors disabled:text-gray-500"
              >
                <Linkedin className="w-5 h-5" />
                <span className="text-white font-medium">LinkedIn</span>
              </button>

              <button
                onClick={shareToFacebook}
                disabled={!shareUrl}
                className="flex items-center justify-center gap-2 p-3 bg-[#1877F2] hover:bg-[#166fe5] disabled:bg-[#3a3a3a] rounded-lg transition-colors disabled:text-gray-500"
              >
                <Facebook className="w-5 h-5" />
                <span className="text-white font-medium">Facebook</span>
              </button>
            </div>
          </div>

          {/* QR Code */}
          {shareUrl && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">QR Code</h3>
              <div className="flex items-center gap-4 p-4 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg">
                <div className="bg-white p-2 rounded-lg">
                  <img src={getQRCodeUrl() || "/placeholder.svg"} alt="QR Code" className="w-24 h-24" />
                </div>
                <div>
                  <div className="text-white font-medium">Scan to view code</div>
                  <div className="text-gray-400 text-sm mt-1">
                    Scan this QR code with your phone to quickly access the shared code snippet
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#3a3a3a] bg-[#262626]">
          <div className="text-gray-400 text-xs">Shared links expire after 30 days of inactivity</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
              Close
            </button>
            <button
              onClick={() => copyToClipboard(shareUrl)}
              disabled={!shareUrl}
              className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#E55A2B] disabled:bg-[#3a3a3a] px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:text-gray-500"
            >
              <Link className="w-4 h-4" />
              Share Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

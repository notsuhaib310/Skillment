"use client"
import { useEffect, useRef } from "react"
import type { ChangeEvent, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface OutputTerminalProps {
  output: string
  input: string
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onKeyPress: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  isRunning: boolean
  isWaitingForInput: boolean
  onSubmit: () => void
}

export const OutputTerminal = ({
  output,
  input,
  onInputChange,
  onKeyPress,
  isRunning,
  isWaitingForInput,
  onSubmit
}: OutputTerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isWaitingForInput])

  return (
    <div className="flex flex-col h-[400px]">
      <div ref={terminalRef} className="flex-1 bg-black/70 font-mono text-sm p-4 overflow-auto">
        {output ? (
          <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
        ) : (
          <div className="text-gray-500 italic">Output will appear here after running the code...</div>
        )}
      </div>
      {isWaitingForInput && (
        <div className="mt-4">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={onInputChange}
              onKeyPress={onKeyPress}
              placeholder="Enter input value..."
              className="flex-1 h-[100px] bg-black/50 border border-white/10 rounded-lg p-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-mono text-sm resize-none"
            />
            <Button
              onClick={onSubmit}
              disabled={!input.trim()}
              className="self-end bg-orange-500 hover:bg-orange-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

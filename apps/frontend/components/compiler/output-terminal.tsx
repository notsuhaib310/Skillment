"use client"
import { useEffect, useRef } from "react"

interface OutputTerminalProps {
  output: string
}

export const OutputTerminal = ({ output }: OutputTerminalProps) => {
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <div ref={terminalRef} className="w-full h-full bg-black/70 font-mono text-sm p-4 overflow-auto">
      {output ? (
        <pre className="text-green-400 whitespace-pre-wrap">{output}</pre>
      ) : (
        <div className="text-gray-500 italic">Output will appear here after running the code...</div>
      )}
    </div>
  )
}

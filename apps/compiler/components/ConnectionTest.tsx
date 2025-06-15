"use client"

import { useState } from "react"
import { Wifi, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface ConnectionResult {
  message: string
  status?: number
  endpoint?: string
  error?: string
  serverUrl?: string
  suggestion?: string
}

export default function ConnectionTest() {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<ConnectionResult | null>(null)

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      const response = await fetch("/api/test-connection")
      const result = await response.json()

      setConnectionResult(result)
    } catch (error) {
      setConnectionResult({
        error: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        message: "❌ Failed to test connection",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const getStatusIcon = () => {
    if (!connectionResult) return null

    if (connectionResult.error) {
      return <XCircle className="w-4 h-4 text-red-400" />
    } else if (connectionResult.message.includes("✅")) {
      return <CheckCircle className="w-4 h-4 text-green-400" />
    } else {
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    }
  }

  const getStatusColor = () => {
    if (!connectionResult) return "text-gray-300"

    if (connectionResult.error) {
      return "text-red-300"
    } else if (connectionResult.message.includes("✅")) {
      return "text-green-300"
    } else {
      return "text-yellow-300"
    }
  }

  return (
    <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white">Judge0 Server Status</h3>
        <button
          onClick={testConnection}
          disabled={isTestingConnection}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition-colors"
        >
          {isTestingConnection ? (
            <>
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Testing...
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3" />
              Test Connection
            </>
          )}
        </button>
      </div>

      {connectionResult && (
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>{connectionResult.message}</span>
          </div>

          {connectionResult.status && (
            <div className="text-xs text-gray-400">
              Status: {connectionResult.status} | Endpoint: {connectionResult.endpoint}
            </div>
          )}

          {connectionResult.error && (
            <div className="text-xs text-red-300 bg-red-900/20 p-2 rounded">{connectionResult.error}</div>
          )}

          {connectionResult.suggestion && (
            <div className="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded">💡 {connectionResult.suggestion}</div>
          )}

          {connectionResult.serverUrl && (
            <div className="text-xs text-gray-400">Server: {connectionResult.serverUrl}</div>
          )}
        </div>
      )}
    </div>
  )
}

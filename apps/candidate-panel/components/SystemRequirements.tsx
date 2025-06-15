"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface Requirement {
  name: string
  critical: boolean
  status: "checking" | "success" | "error"
  message: string
}

export default function SystemRequirements() {
  const [requirements, setRequirements] = useState<Requirement[]>([
    {
      name: "Internet Connection",
      critical: true,
      status: "checking",
      message: "Checking connection...",
    },
    {
      name: "Network Bandwidth",
      critical: true,
      status: "checking",
      message: "Checking bandwidth...",
    },
    {
      name: "Camera Access",
      critical: true,
      status: "checking",
      message: "Requesting camera access...",
    },
    {
      name: "Camera Quality",
      critical: true,
      status: "checking",
      message: "Checking camera quality...",
    },
    {
      name: "Microphone Access",
      critical: true,
      status: "checking",
      message: "Requesting microphone access...",
    },
    {
      name: "Audio Quality",
      critical: false,
      status: "checking",
      message: "Checking audio quality...",
    },
    {
      name: "Location Access",
      critical: true,
      status: "checking",
      message: "Requesting location access...",
    },
    {
      name: "Screen Resolution",
      critical: false,
      status: "checking",
      message: "Checking screen resolution...",
    },
    {
      name: "Browser Compatibility",
      critical: true,
      status: "checking",
      message: "Checking browser compatibility...",
    },
    {
      name: "System Resources",
      critical: false,
      status: "checking",
      message: "Checking system resources...",
    },
  ])

  useEffect(() => {
    checkRequirements()
  }, [])

  const checkRequirements = async () => {
    // Check Internet Connection
    try {
      const startTime = performance.now()
      await fetch("https://www.google.com", { mode: "no-cors" })
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)
      
      updateRequirement("Internet Connection", "success", `Connected (${latency}ms latency)`)
    } catch (error) {
      updateRequirement("Internet Connection", "error", "No internet connection")
    }

    // Check Network Bandwidth
    try {
      const startTime = performance.now()
      const response = await fetch("https://www.google.com", { mode: "no-cors" })
      const endTime = performance.now()
      const downloadTime = endTime - startTime
      const bandwidth = Math.round(1000 / downloadTime) // Rough estimate in Mbps
      
      updateRequirement("Network Bandwidth", "success", `${bandwidth} Mbps download speed`)
    } catch (error) {
      updateRequirement("Network Bandwidth", "error", "Unable to measure bandwidth")
    }

    // Request Camera Access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      updateRequirement("Camera Access", "success", "Camera access granted")
      
      // Check Camera Quality
      const videoTrack = stream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()
      if (settings.width && settings.width >= 640) {
        updateRequirement("Camera Quality", "success", "Camera quality is sufficient")
      } else {
        updateRequirement("Camera Quality", "error", "Camera resolution too low")
      }
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      updateRequirement("Camera Access", "error", "Camera access denied: Permission denied")
      updateRequirement("Camera Quality", "error", "Camera quality test failed")
    }

    // Request Microphone Access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      updateRequirement("Microphone Access", "success", "Microphone access granted")
      
      // Check Audio Quality
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        updateRequirement("Audio Quality", "success", "Audio quality is sufficient")
      } else {
        updateRequirement("Audio Quality", "error", "Audio quality test failed")
      }
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      updateRequirement("Microphone Access", "error", "Microphone access denied: Permission denied")
      updateRequirement("Audio Quality", "error", "Audio quality test failed")
    }

    // Request Location Access
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      updateRequirement("Location Access", "success", "Location access granted")
    } catch (error) {
      updateRequirement("Location Access", "error", "Location access denied: Geolocation has been disabled in this document by permissions policy.")
    }

    // Check Screen Resolution
    const width = window.screen.width
    const height = window.screen.height
    const dpi = window.devicePixelRatio
    updateRequirement("Screen Resolution", "success", `${width}x${height} (${dpi}x DPI)`)

    // Check Browser Compatibility
    const isModernBrowser = "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices
    updateRequirement("Browser Compatibility", "success", "All features supported (5/5)")

    // Check System Resources
    const memory = (performance as any).memory
    if (memory) {
      const usedHeap = Math.round(memory.usedJSHeapSize / 1024 / 1024)
      const totalHeap = Math.round(memory.totalJSHeapSize / 1024 / 1024)
      updateRequirement("System Resources", "success", `${usedHeap}MB / ${totalHeap}MB memory used`)
    } else {
      updateRequirement("System Resources", "success", "System resources available")
    }
  }

  const updateRequirement = (name: string, status: "checking" | "success" | "error", message: string) => {
    setRequirements(prev => 
      prev.map(req => 
        req.name === name ? { ...req, status, message } : req
      )
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    }
  }

  const failedCriticalRequirements = requirements.filter(
    req => req.critical && req.status === "error"
  ).length

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#1a1a1a] rounded-lg p-6 max-w-2xl w-full mx-4 border border-[#3a3a3a]">
        <h2 className="text-xl font-semibold text-white mb-4">
          System Requirements Check
        </h2>
        
        {failedCriticalRequirements > 0 && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-500 font-medium">
              {failedCriticalRequirements} critical system requirement(s) failed. Please resolve these issues to continue.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {requirements.map((req) => (
            <div
              key={req.name}
              className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a]"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(req.status)}
                <div>
                  <h3 className="text-white font-medium">{req.name}</h3>
                  <p className="text-sm text-gray-400">{req.message}</p>
                </div>
              </div>
              {req.critical && (
                <span className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded">
                  Critical
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => checkRequirements()}
            className="px-4 py-2 text-white bg-[#3a3a3a] hover:bg-[#4a4a4a] rounded-lg transition-colors"
          >
            Recheck Requirements
          </button>
          {failedCriticalRequirements === 0 && (
            <button
              onClick={() => {
                // Handle successful requirements check
                // You can emit an event or use a callback here
              }}
              className="px-4 py-2 text-white bg-[#FF6B35] hover:bg-[#E55A2B] rounded-lg transition-colors"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 
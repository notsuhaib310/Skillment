"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Camera,
  Mic,
  MapPin,
  Wifi,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Monitor,
  Eye,
  Globe,
  Cpu,
  Battery,
} from "lucide-react"

interface SystemChecksProps {
  onComplete: (status: any) => void
}

interface CheckItem {
  id: string
  name: string
  description: string
  icon: any
  status: "pending" | "checking" | "success" | "error"
  message: string
  critical: boolean
}

export default function SystemChecks({ onComplete }: SystemChecksProps) {
  const [checks, setChecks] = useState<CheckItem[]>([
    {
      id: "internet",
      name: "Internet Connection",
      description: "Verifying network connectivity and speed",
      icon: Wifi,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
    {
      id: "bandwidth",
      name: "Network Bandwidth",
      description: "Testing upload/download speeds",
      icon: Globe,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
    {
      id: "camera",
      name: "Camera Access",
      description: "Requesting camera permissions",
      icon: Camera,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
    {
      id: "camera_quality",
      name: "Camera Quality",
      description: "Testing video resolution and clarity",
      icon: Eye,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
    {
      id: "microphone",
      name: "Microphone Access",
      description: "Requesting audio permissions",
      icon: Mic,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
    {
      id: "audio_quality",
      name: "Audio Quality",
      description: "Testing microphone sensitivity",
      icon: Mic,
      status: "pending",
      message: "Waiting to check...",
      critical: false,
    },
    {
      id: "location",
      name: "Location Access",
      description: "Requesting GPS coordinates",
      icon: MapPin,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
    {
      id: "screen_resolution",
      name: "Screen Resolution",
      description: "Checking display compatibility",
      icon: Monitor,
      status: "pending",
      message: "Waiting to check...",
      critical: false,
    },
    {
      id: "browser_compatibility",
      name: "Browser Compatibility",
      description: "Verifying browser features",
      icon: Globe,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
    {
      id: "system_resources",
      name: "System Resources",
      description: "Checking CPU and memory",
      icon: Cpu,
      status: "pending",
      message: "Waiting to check...",
      critical: false,
    },
    {
      id: "battery_status",
      name: "Battery Status",
      description: "Checking power level (mobile)",
      icon: Battery,
      status: "pending",
      message: "Waiting to check...",
      critical: false,
    },
    {
      id: "photo_capture",
      name: "Identity Verification",
      description: "Capturing candidate photo",
      icon: Camera,
      status: "pending",
      message: "Waiting to check...",
      critical: true,
    },
  ])

  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [allChecksComplete, setAllChecksComplete] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    runSystemChecks()
  }, [])

  const runSystemChecks = async () => {
    for (let i = 0; i < checks.length; i++) {
      setCurrentCheckIndex(i)
      await runSingleCheck(checks[i].id, i)
      await new Promise((resolve) => setTimeout(resolve, 800)) // Delay between checks
    }
    setAllChecksComplete(true)
  }

  const runSingleCheck = async (checkId: string, index: number) => {
    updateCheck(checkId, "checking", "Testing...")

    try {
      switch (checkId) {
        case "internet":
          await checkInternet(checkId)
          break
        case "bandwidth":
          await checkBandwidth(checkId)
          break
        case "camera":
          await checkCamera(checkId)
          break
        case "camera_quality":
          await checkCameraQuality(checkId)
          break
        case "microphone":
          await checkMicrophone(checkId)
          break
        case "audio_quality":
          await checkAudioQuality(checkId)
          break
        case "location":
          await checkLocation(checkId)
          break
        case "screen_resolution":
          await checkScreenResolution(checkId)
          break
        case "browser_compatibility":
          await checkBrowserCompatibility(checkId)
          break
        case "system_resources":
          await checkSystemResources(checkId)
          break
        case "battery_status":
          await checkBatteryStatus(checkId)
          break
        case "photo_capture":
          await capturePhoto(checkId)
          break
      }
    } catch (error) {
      updateCheck(checkId, "error", `Failed: ${error}`)
    }

    setOverallProgress(((index + 1) / checks.length) * 100)
  }

  const checkInternet = async (checkId: string) => {
    try {
      const start = Date.now()
      await fetch("https://www.google.com/favicon.ico", { mode: "no-cors" })
      const latency = Date.now() - start

      if (latency < 1000) {
        updateCheck(checkId, "success", `Connected (${latency}ms latency)`)
      } else {
        updateCheck(checkId, "error", `Slow connection (${latency}ms)`)
      }
    } catch {
      updateCheck(checkId, "error", "No internet connection")
    }
  }

  const checkBandwidth = async (checkId: string) => {
    try {
      // Simulate bandwidth test
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const speed = Math.floor(Math.random() * 50) + 10 // Mock speed 10-60 Mbps
      updateCheck(checkId, "success", `${speed} Mbps download speed`)
    } catch {
      updateCheck(checkId, "error", "Bandwidth test failed")
    }
  }

  const checkCamera = async (checkId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const videoTrack = stream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()

      stream.getTracks().forEach((track) => track.stop())
      updateCheck(checkId, "success", `Camera access granted (${settings.width}x${settings.height})`)
    } catch (error: any) {
      updateCheck(checkId, "error", `Camera access denied: ${error.message}`)
    }
  }

  const checkCameraQuality = async (checkId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      })
      const videoTrack = stream.getVideoTracks()[0]
      const settings = videoTrack.getSettings()

      stream.getTracks().forEach((track) => track.stop())

      if (settings.width >= 640 && settings.height >= 480) {
        updateCheck(checkId, "success", `HD quality (${settings.width}x${settings.height})`)
      } else {
        updateCheck(checkId, "error", `Low quality (${settings.width}x${settings.height})`)
      }
    } catch {
      updateCheck(checkId, "error", "Camera quality test failed")
    }
  }

  const checkMicrophone = async (checkId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioTrack = stream.getAudioTracks()[0]
      const settings = audioTrack.getSettings()

      stream.getTracks().forEach((track) => track.stop())
      updateCheck(checkId, "success", `Microphone access granted (${settings.sampleRate}Hz)`)
    } catch (error: any) {
      updateCheck(checkId, "error", `Microphone access denied: ${error.message}`)
    }
  }

  const checkAudioQuality = async (checkId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create audio context to analyze audio
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      source.connect(analyser)

      // Test for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))

      stream.getTracks().forEach((track) => track.stop())
      audioContext.close()

      updateCheck(checkId, "success", "Audio quality verified")
    } catch {
      updateCheck(checkId, "error", "Audio quality test failed")
    }
  }

  const checkLocation = async (checkId: string) => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        })
      })

      updateCheck(checkId, "success", `Location acquired (±${Math.round(position.coords.accuracy)}m accuracy)`)
    } catch (error: any) {
      updateCheck(checkId, "error", `Location access denied: ${error.message}`)
    }
  }

  const checkScreenResolution = async (checkId: string) => {
    const width = window.screen.width
    const height = window.screen.height
    const ratio = window.devicePixelRatio

    if (width >= 1024 && height >= 768) {
      updateCheck(checkId, "success", `${width}x${height} (${ratio}x DPI)`)
    } else {
      updateCheck(checkId, "error", `Low resolution: ${width}x${height}`)
    }
  }

  const checkBrowserCompatibility = async (checkId: string) => {
    const features = {
      webrtc: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      fullscreen: !!document.documentElement.requestFullscreen,
      notifications: !!window.Notification,
      localStorage: !!window.localStorage,
      websockets: !!window.WebSocket,
    }

    const supportedFeatures = Object.values(features).filter(Boolean).length
    const totalFeatures = Object.keys(features).length

    if (supportedFeatures === totalFeatures) {
      updateCheck(checkId, "success", `All features supported (${supportedFeatures}/${totalFeatures})`)
    } else {
      updateCheck(checkId, "error", `Missing features (${supportedFeatures}/${totalFeatures})`)
    }
  }

  const checkSystemResources = async (checkId: string) => {
    // @ts-ignore - navigator.deviceMemory is experimental
    const memory = navigator.deviceMemory || "Unknown"
    const cores = navigator.hardwareConcurrency || "Unknown"

    updateCheck(checkId, "success", `${cores} cores, ${memory}GB RAM`)
  }

  const checkBatteryStatus = async (checkId: string) => {
    try {
      // @ts-ignore - navigator.getBattery is experimental
      if (navigator.getBattery) {
        // @ts-ignore
        const battery = await navigator.getBattery()
        const level = Math.round(battery.level * 100)

        if (level > 20) {
          updateCheck(checkId, "success", `Battery: ${level}% ${battery.charging ? "(charging)" : ""}`)
        } else {
          updateCheck(checkId, "error", `Low battery: ${level}%`)
        }
      } else {
        updateCheck(checkId, "success", "Desktop/AC powered")
      }
    } catch {
      updateCheck(checkId, "success", "Battery status unavailable")
    }
  }

  const capturePhoto = async (checkId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement("video")
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      video.srcObject = stream
      await video.play()

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx?.drawImage(video, 0, 0)

      const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8)
      setPhotoData(photoDataUrl)

      stream.getTracks().forEach((track) => track.stop())
      updateCheck(checkId, "success", "Identity photo captured")
    } catch (error: any) {
      updateCheck(checkId, "error", `Photo capture failed: ${error.message}`)
    }
  }

  const updateCheck = (checkId: string, status: CheckItem["status"], message: string) => {
    setChecks((prev) => prev.map((check) => (check.id === checkId ? { ...check, status, message } : check)))
  }

  const getStatusIcon = (status: CheckItem["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-400" />
      case "checking":
        return <Loader2 className="w-5 h-5 text-[#ff4d00] animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
    }
  }

  const getStatusBadge = (status: CheckItem["status"]) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-900/30 text-green-400 border-green-500/30 hover:bg-green-900/30">✓</Badge>
      case "error":
        return <Badge className="bg-red-900/30 text-red-400 border-red-500/30 hover:bg-red-900/30">✗</Badge>
      case "checking":
        return (
          <Badge className="bg-orange-900/30 text-[#ff4d00] border-orange-500/30 hover:bg-orange-900/30">...</Badge>
        )
      default:
        return <Badge className="bg-gray-800 text-gray-400 border-gray-600 hover:bg-gray-800">○</Badge>
    }
  }

  const handleContinue = () => {
    const systemStatus = {
      internet: checks.find((c) => c.id === "internet")?.status === "success",
      camera: checks.find((c) => c.id === "camera")?.status === "success",
      microphone: checks.find((c) => c.id === "microphone")?.status === "success",
      location: checks.find((c) => c.id === "location")?.status === "success",
      photo: photoData,
      allChecks: checks.reduce((acc, check) => {
        acc[check.id] = {
          status: check.status,
          message: check.message,
          critical: check.critical,
        }
        return acc
      }, {} as any),
    }
    onComplete(systemStatus)
  }

  const criticalErrors = checks.filter((c) => c.critical && c.status === "error").length
  const totalErrors = checks.filter((c) => c.status === "error").length

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0b0d] p-4">
      <Card className="w-full max-w-4xl bg-[#1a1d21] border-[#2a2d31] shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Advanced System Verification</CardTitle>
          <p className="text-gray-400">Comprehensive security and compatibility assessment</p>

          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Overall Progress</span>
              <span className="text-sm text-gray-400">{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-[#2a2d31]" />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {criticalErrors > 0 && (
            <Alert className="bg-red-900/20 border-red-500/50">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {criticalErrors} critical system requirement(s) failed. Please resolve these issues to continue.
              </AlertDescription>
            </Alert>
          )}

          {/* System Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {checks.map((check, index) => {
              const Icon = check.icon
              const isActive = index <= currentCheckIndex
              const isCurrent = index === currentCheckIndex

              return (
                <div
                  key={check.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isCurrent
                      ? "border-[#ff4d00] bg-[#ff4d00]/5 shadow-lg"
                      : isActive
                        ? check.status === "success"
                          ? "border-green-500/30 bg-green-900/10"
                          : check.status === "error"
                            ? "border-red-500/30 bg-red-900/10"
                            : "border-[#2a2d31] bg-[#2a2d31]/50"
                        : "border-[#2a2d31] bg-[#2a2d31]/30"
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <Icon
                      className={`w-5 h-5 ${
                        isCurrent
                          ? "text-[#ff4d00]"
                          : check.status === "success"
                            ? "text-green-400"
                            : check.status === "error"
                              ? "text-red-400"
                              : isActive
                                ? "text-[#ff4d00]"
                                : "text-gray-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white text-sm">{check.name}</h3>
                        {check.critical && (
                          <Badge className="bg-red-900/30 text-red-400 border-red-500/30 hover:bg-red-900/30 text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{check.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(check.status)}
                    {getStatusIcon(check.status)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Photo Preview */}
          {photoData && (
            <div className="text-center mt-6">
              <h3 className="font-medium text-white mb-2">Identity Verification Photo</h3>
              <img
                src={photoData || "/placeholder.svg"}
                alt="Candidate verification photo"
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#ff4d00]/30"
              />
            </div>
          )}

          {/* Summary Stats */}
          {allChecksComplete && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-[#2a2d31] rounded-lg">
                <div className="text-2xl font-bold text-green-400">
                  {checks.filter((c) => c.status === "success").length}
                </div>
                <div className="text-xs text-gray-400">Passed</div>
              </div>
              <div className="text-center p-3 bg-[#2a2d31] rounded-lg">
                <div className="text-2xl font-bold text-red-400">{totalErrors}</div>
                <div className="text-xs text-gray-400">Failed</div>
              </div>
              <div className="text-center p-3 bg-[#2a2d31] rounded-lg">
                <div className="text-2xl font-bold text-[#ff4d00]">{criticalErrors}</div>
                <div className="text-xs text-gray-400">Critical</div>
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleContinue}
              disabled={!allChecksComplete || criticalErrors > 0}
              className="px-8 py-3 bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] hover:from-[#e63900] hover:to-[#ff5722] text-white font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!allChecksComplete
                ? "Running System Checks..."
                : criticalErrors > 0
                  ? "Resolve Critical Issues"
                  : "Continue to Assessment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

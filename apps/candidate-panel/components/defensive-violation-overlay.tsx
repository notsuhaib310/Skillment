"use client"

import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, Eye, Skull, Zap, Ban, Camera, Lock } from 'lucide-react'

interface ViolationOverlayProps {
  violation: {
    isActive: boolean
    type: string
    message: string
    severity: 'warning' | 'critical' | 'fatal'
    count: number
    timestamp: string
  } | null
  onDismiss: () => void
  candidateId?: string
  assessmentTitle?: string
}

export default function DefensiveViolationOverlay({ 
  violation, 
  onDismiss, 
  candidateId, 
  assessmentTitle 
}: ViolationOverlayProps) {
  const [countdown, setCountdown] = useState(10)
  const [pulseAnimation, setPulseAnimation] = useState(true)

  useEffect(() => {
    if (!violation?.isActive) return

    // Auto-dismiss countdown (shorter for more violations)
    const countdownTime = violation.severity === 'fatal' ? 15 : violation.severity === 'critical' ? 10 : 8
    setCountdown(countdownTime)

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Pulse animation control
    const pulseTimer = setInterval(() => {
      setPulseAnimation(prev => !prev)
    }, violation.severity === 'fatal' ? 400 : 600)

    return () => {
      clearInterval(timer)
      clearInterval(pulseTimer)
    }
  }, [violation, onDismiss])

  if (!violation?.isActive) return null

  const getSeverityConfig = () => {
    switch (violation.severity) {
      case 'fatal':
        return {
          bgGradient: 'from-red-600/30 via-red-800/20 to-red-900/30',
          cardBg: 'bg-gray-900/95',
          borderColor: 'border-red-500/60',
          accentColor: 'bg-red-600',
          textColor: 'text-white',
          titleColor: 'text-red-400',
          statusColor: 'text-red-300',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: Skull,
          iconColor: 'text-red-400',
          statusText: 'CRITICAL SECURITY VIOLATION',
          riskLevel: 'HIGH RISK'
        }
      case 'critical':
        return {
          bgGradient: 'from-orange-600/25 via-orange-700/15 to-red-800/25',
          cardBg: 'bg-gray-900/95',
          borderColor: 'border-orange-500/60',
          accentColor: 'bg-orange-600',
          textColor: 'text-white',
          titleColor: 'text-orange-400',
          statusColor: 'text-orange-300',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          icon: Zap,
          iconColor: 'text-orange-400',
          statusText: 'SECURITY BREACH DETECTED',
          riskLevel: 'MEDIUM RISK'
        }
      default:
        return {
          bgGradient: 'from-yellow-600/20 via-yellow-700/10 to-orange-800/20',
          cardBg: 'bg-gray-900/90',
          borderColor: 'border-yellow-500/60',
          accentColor: 'bg-yellow-600',
          textColor: 'text-white',
          titleColor: 'text-yellow-400',
          statusColor: 'text-yellow-300',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: AlertTriangle,
          iconColor: 'text-yellow-400',
          statusText: 'SECURITY MONITORING ALERT',
          riskLevel: 'LOW RISK'
        }
    }
  }

  const config = getSeverityConfig()
  const IconComponent = config.icon

  const getViolationTypeTitle = () => {
    const titles = {
      tab_switch: 'Tab Switching Detected',
      focus_loss: 'Window Focus Lost',
      fullscreen_exit: 'Fullscreen Mode Exited',
      alt_tab: 'Application Switching Detected',
      context_menu: 'Unauthorized Menu Access',
      developer_tools: 'Developer Tools Detected',
      copy_paste: 'Copy/Paste Operation Blocked'
    }
    return titles[violation.type as keyof typeof titles] || 'Security Violation Detected'
  }

  const getProfessionalMessage = () => {
    const messages = {
      tab_switch: "Your browser tab activity is being monitored for exam integrity. Switching tabs during the assessment is not permitted and may affect your evaluation.",
      focus_loss: "The examination window has lost focus. Please ensure your attention remains on the assessment interface throughout the duration of the exam.",
      fullscreen_exit: "Fullscreen mode is required for this examination. Exiting fullscreen compromises the secure testing environment.",
      alt_tab: "Application switching has been detected. The examination requires your full attention and use of external applications is prohibited.",
      developer_tools: "Developer tools access is strictly prohibited during the examination. This action has been logged for review.",
      copy_paste: "Copy and paste operations are disabled to maintain exam integrity. All content must be your original work."
    }
    return messages[violation.type as keyof typeof messages] || "A security protocol has been triggered. Please maintain compliance with examination guidelines."
  }

  const getConsequences = () => {
    if (violation.count >= 3) {
      return [
        "Third violation recorded - Exam termination protocol initiated",
        "Assessment coordinator has been notified",
        "Incident report will be submitted to academic review board",
        "Your exam session will be automatically terminated"
      ]
    } else if (violation.count >= 2) {
      return [
        "Second violation detected - Enhanced monitoring activated",
        "Continuous behavioral analysis now in effect",
        "One additional violation will result in exam termination",
        "This incident is being documented for review"
      ]
    } else {
      return [
        "First violation logged - Monitoring systems activated",
        "Your examination behavior is now under enhanced surveillance",
        "Future violations will result in escalated consequences",
        "Please maintain focus and compliance with exam protocols"
      ]
    }
  }

  return (
    <div className={`fixed inset-0 z-[9999] bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm flex items-center justify-center`}>
      {/* Professional Warning Card */}
      <div className={`relative max-w-2xl mx-8 ${config.cardBg} backdrop-blur-xl border ${config.borderColor} rounded-2xl shadow-2xl ${pulseAnimation ? 'scale-[1.02]' : 'scale-100'} transition-all duration-500`}>
        
        {/* Top Accent Bar */}
        <div className={`h-2 ${config.accentColor} rounded-t-2xl`}></div>
        
        {/* Header Section */}
        <div className="p-8 pb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${config.accentColor} rounded-xl flex items-center justify-center ${pulseAnimation ? 'animate-pulse' : ''}`}>
                <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className={`text-2xl font-bold ${config.titleColor}`}>
                    Security Alert
                  </h2>
                  <span className={`px-3 py-1 text-xs font-semibold ${config.accentColor} text-white rounded-full`}>
                    VIOLATION #{violation.count}
                  </span>
                </div>
                <p className={`text-lg ${config.statusColor} font-medium`}>
                  {config.statusText}
                </p>
              </div>
            </div>
            
            {/* Countdown */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${config.titleColor} ${pulseAnimation ? 'animate-pulse' : ''}`}>
                {countdown}
              </div>
              <div className="text-sm text-gray-400">seconds</div>
            </div>
          </div>

          {/* Violation Details */}
          <div className="space-y-6">
            <div className="bg-black/30 rounded-xl p-6 border border-gray-700/50">
              <h3 className={`text-lg font-semibold ${config.titleColor} mb-3`}>
                {getViolationTypeTitle()}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {getProfessionalMessage()}
              </p>
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Monitoring Status</span>
                </div>
                <p className="text-white text-sm">Active Surveillance</p>
              </div>
              
              <div className="bg-black/30 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Risk Level</span>
                </div>
                <p className="text-white text-sm">{config.riskLevel}</p>
              </div>
            </div>

            {/* Consequences */}
            <div className="bg-black/30 rounded-xl p-6 border border-gray-700/50">
              <h4 className="text-lg font-semibold text-gray-300 mb-4">Immediate Actions Taken:</h4>
              <div className="space-y-2">
                {getConsequences().map((consequence, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full ${config.accentColor} mt-2 flex-shrink-0`}></div>
                    <span className="text-gray-300 text-sm">{consequence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Details */}
            <div className="bg-black/30 rounded-xl p-6 border border-gray-700/50">
              <h4 className="text-lg font-semibold text-gray-300 mb-4">Incident Details:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Candidate ID:</span>
                  <span className="text-white ml-2 font-mono">{candidateId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Assessment:</span>
                  <span className="text-white ml-2">{assessmentTitle || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Violation Type:</span>
                  <span className="text-white ml-2 font-mono">{violation.type.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Timestamp:</span>
                  <span className="text-white ml-2 font-mono">{violation.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-400">Severity:</span>
                  <span className={`ml-2 font-semibold ${config.titleColor}`}>{violation.severity.toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Violations:</span>
                  <span className="text-white ml-2 font-semibold">{violation.count}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={onDismiss}
              className={`px-8 py-4 ${config.buttonColor} text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg`}
            >
              Acknowledge & Continue ({countdown}s)
            </button>
          </div>

          {/* Footer Notice */}
          <div className="text-center mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
            <p className="text-gray-300 text-sm">
              This incident has been logged and will be reviewed by the examination board.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Continued violations may result in exam termination and academic review.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
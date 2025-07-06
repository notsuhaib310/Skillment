"use client"

import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, Eye, Skull, Zap, Ban } from 'lucide-react'

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
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!violation?.isActive) return

    // Auto-dismiss countdown (shorter for more violations)
    const countdownTime = violation.severity === 'fatal' ? 15 : violation.severity === 'critical' ? 10 : 5
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
    }, violation.severity === 'fatal' ? 300 : 500)

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
          bgColor: 'bg-gradient-to-br from-red-900/98 via-black/95 to-red-900/98',
          borderColor: 'border-red-500',
          textColor: 'text-red-100',
          titleColor: 'text-red-400',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: Skull,
          iconColor: 'text-red-500',
          warningText: 'EXAM TERMINATION IMMINENT',
          severity: 'FATAL VIOLATION'
        }
      case 'critical':
        return {
          bgColor: 'bg-gradient-to-br from-orange-900/95 via-black/90 to-red-900/95',
          borderColor: 'border-orange-500',
          textColor: 'text-orange-100',
          titleColor: 'text-orange-400',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          icon: Zap,
          iconColor: 'text-orange-500',
          warningText: 'CRITICAL SECURITY BREACH',
          severity: 'CRITICAL VIOLATION'
        }
      default:
        return {
          bgColor: 'bg-gradient-to-br from-yellow-900/90 via-black/85 to-orange-900/90',
          borderColor: 'border-yellow-500',
          textColor: 'text-yellow-100',
          titleColor: 'text-yellow-400',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          warningText: 'SECURITY WARNING',
          severity: 'WARNING'
        }
    }
  }

  const config = getSeverityConfig()
  const IconComponent = config.icon

  const getViolationTypeTitle = () => {
    const titles = {
      tab_switch: '🚨 TAB SWITCHING DETECTED',
      focus_loss: '⚠️ WINDOW FOCUS LOST',
      fullscreen_exit: '🔒 FULLSCREEN VIOLATION',
      alt_tab: '🚫 APPLICATION SWITCHING',
      context_menu: '🖱️ UNAUTHORIZED ACCESS',
      developer_tools: '🛠️ DEVELOPER TOOLS',
      copy_paste: '📋 COPY/PASTE VIOLATION'
    }
    return titles[violation.type as keyof typeof titles] || '⚠️ SECURITY VIOLATION'
  }

  const getIntimidatingMessage = () => {
    const messages = {
      tab_switch: [
        "You have been caught switching tabs during the exam.",
        "This behavior is being recorded and will be reported to exam authorities.",
        "Further violations will result in immediate exam termination.",
        "Your IP address, device information, and timestamp have been logged."
      ],
      focus_loss: [
        "Your attention has been diverted from the exam window.",
        "All focus changes are being monitored and recorded.",
        "Suspicious behavior patterns are being analyzed.",
        "Maintain focus on the exam window at all times."
      ],
      fullscreen_exit: [
        "Exiting fullscreen mode is strictly prohibited.",
        "This violation has been recorded with timestamp evidence.",
        "Exam integrity monitoring systems have been alerted.",
        "Return to fullscreen mode immediately to continue."
      ],
      alt_tab: [
        "Application switching has been detected and blocked.",
        "This is considered a serious attempt to cheat.",
        "Your actions are being logged for review by exam proctors.",
        "Continued violations will result in disqualification."
      ],
      developer_tools: [
        "Developer tools usage is strictly forbidden.",
        "This constitutes a critical security violation.",
        "Exam will be terminated if tools remain open.",
        "All code inspection attempts are being recorded."
      ],
      copy_paste: [
        "Copy/paste operations are disabled for exam integrity.",
        "Attempting to bypass security measures is prohibited.",
        "This behavior suggests intent to cheat.",
        "All clipboard activities are being monitored."
      ]
    }
    return messages[violation.type as keyof typeof messages] || [
      "A security violation has been detected.",
      "Your actions are being monitored and recorded.",
      "Comply with exam rules to continue.",
      "Further violations may result in disqualification."
    ]
  }

  const getSeverityEffects = () => {
    if (violation.count >= 3) {
      return [
        "⚠️ THIRD VIOLATION DETECTED",
        "🚨 EXAM TERMINATION PROTOCOL ACTIVATED",
        "📝 VIOLATION REPORT BEING GENERATED",
        "🏛️ ACADEMIC MISCONDUCT COMMITTEE NOTIFIED"
      ]
    } else if (violation.count >= 2) {
      return [
        "⚠️ SECOND VIOLATION DETECTED",
        "🔍 ENHANCED MONITORING ACTIVATED",
        "📊 BEHAVIORAL ANALYSIS INITIATED",
        "⏰ ONE MORE VIOLATION = TERMINATION"
      ]
    } else {
      return [
        "🔍 FIRST VIOLATION RECORDED",
        "📹 CONTINUOUS MONITORING ACTIVE",
        "📋 INCIDENT LOGGED FOR REVIEW",
        "⚠️ FUTURE VIOLATIONS WILL ESCALATE"
      ]
    }
  }

  return (
    <div className={`fixed inset-0 z-[9999] ${config.bgColor} backdrop-blur-xl flex items-center justify-center`}>
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-pulse ${pulseAnimation ? 'opacity-100' : 'opacity-50'}`}></div>
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-red-500 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-2 h-full bg-red-500 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-2 h-full bg-red-500 animate-pulse"></div>
      </div>

      {/* Main Violation Card */}
      <div className={`relative max-w-4xl mx-8 p-8 border-4 ${config.borderColor} rounded-3xl shadow-2xl ${pulseAnimation ? 'scale-105' : 'scale-100'} transition-transform duration-300`}>
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 ${config.iconColor} mx-auto mb-4 ${pulseAnimation ? 'animate-bounce' : ''}`}>
            <IconComponent className="w-full h-full" />
          </div>
          
          <div className={`text-sm font-bold ${config.titleColor} mb-2 tracking-wider`}>
            {config.severity} #{violation.count}
          </div>
          
          <h1 className={`text-4xl font-bold ${config.titleColor} mb-2`}>
            {getViolationTypeTitle()}
          </h1>
          
          <div className={`text-lg font-semibold ${config.textColor} mb-4`}>
            {config.warningText}
          </div>
          
          <div className={`text-6xl font-bold ${config.titleColor} ${pulseAnimation ? 'animate-pulse' : ''}`}>
            {countdown}
          </div>
          <div className={`text-sm ${config.textColor}`}>
            seconds until auto-dismiss
          </div>
        </div>

        {/* Violation Details */}
        <div className={`${config.textColor} space-y-6`}>
          <div className="bg-black/50 p-6 rounded-2xl border border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-4">📋 VIOLATION DETAILS:</h3>
            <div className="space-y-2">
              {getIntimidatingMessage().map((msg, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/50 p-6 rounded-2xl border border-orange-500/30">
            <h3 className="text-xl font-bold text-orange-400 mb-4">🚨 CONSEQUENCES:</h3>
            <div className="space-y-2">
              {getSeverityEffects().map((effect, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-orange-400 font-bold">•</span>
                  <span>{effect}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-black/50 p-6 rounded-2xl border border-gray-500/30">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="text-lg font-bold text-gray-400 mb-4 hover:text-white transition-colors"
            >
              🔍 TECHNICAL DETAILS {showDetails ? '▼' : '▶'}
            </button>
            {showDetails && (
              <div className="space-y-2 text-sm font-mono">
                <div><span className="text-gray-400">Candidate ID:</span> {candidateId || 'UNKNOWN'}</div>
                <div><span className="text-gray-400">Assessment:</span> {assessmentTitle || 'UNKNOWN'}</div>
                <div><span className="text-gray-400">Violation Type:</span> {violation.type.toUpperCase()}</div>
                <div><span className="text-gray-400">Timestamp:</span> {violation.timestamp}</div>
                <div><span className="text-gray-400">Severity Level:</span> {violation.severity.toUpperCase()}</div>
                <div><span className="text-gray-400">Total Violations:</span> {violation.count}</div>
                <div><span className="text-gray-400">User Agent:</span> {navigator.userAgent.substring(0, 50)}...</div>
                <div><span className="text-gray-400">IP Tracking:</span> ACTIVE</div>
                <div><span className="text-gray-400">Screen Recording:</span> {violation.severity === 'fatal' ? 'INITIATED' : 'STANDBY'}</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={onDismiss}
            className={`px-8 py-4 ${config.buttonColor} text-white font-bold rounded-2xl transition-colors text-lg shadow-lg`}
          >
            I UNDERSTAND - RETURN TO EXAM ({countdown}s)
          </button>
        </div>

        {/* Bottom Warning */}
        <div className="text-center mt-6 p-4 bg-red-900/30 rounded-2xl border border-red-500/50">
          <p className="text-red-300 font-bold">
            ⚠️ THIS INCIDENT HAS BEEN PERMANENTLY RECORDED ⚠️
          </p>
          <p className="text-red-400 text-sm mt-2">
            Exam proctors and academic authorities have been notified of this violation
          </p>
        </div>
      </div>
    </div>
  )
} 
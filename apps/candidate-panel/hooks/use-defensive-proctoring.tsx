import { useState, useEffect, useCallback } from 'react';

interface DefensiveProctoringOptions {
  onViolation?: (violation: string) => void;
  onCriticalViolation?: (violation: string) => void;
  candidateId?: string;
  assessmentTitle?: string;
}

interface ViolationState {
  isActive: boolean;
  type: 'tab_switch' | 'focus_loss' | 'fullscreen_exit' | 'alt_tab' | 'context_menu' | 'developer_tools' | 'copy_paste';
  message: string;
  severity: 'warning' | 'critical' | 'fatal';
  count: number;
  timestamp: string;
}

export function useDefensiveProctoring(options: DefensiveProctoringOptions = {}) {
  const [violationState, setViolationState] = useState<ViolationState | null>(null);
  const [violationCount, setViolationCount] = useState(0);
  const [isExamActive, setIsExamActive] = useState(true);
  const [lastViolationType, setLastViolationType] = useState<string | null>(null);

  const createViolation = useCallback((
    type: ViolationState['type'], 
    message: string, 
    severity: ViolationState['severity'] = 'warning'
  ) => {
    const newCount = violationCount + 1;
    setViolationCount(newCount);
    setLastViolationType(type);

    const violation: ViolationState = {
      isActive: true,
      type,
      message,
      severity: newCount >= 3 ? 'fatal' : newCount >= 2 ? 'critical' : severity,
      count: newCount,
      timestamp: new Date().toLocaleString()
    };

    setViolationState(violation);

    // Log violation
    console.warn(`🚨 VIOLATION DETECTED [${newCount}]: ${type} - ${message}`);
    
    if (options.onViolation) {
      options.onViolation(`${type}: ${message}`);
    }

    if (violation.severity === 'critical' || violation.severity === 'fatal') {
      if (options.onCriticalViolation) {
        options.onCriticalViolation(`${type}: ${message}`);
      }
    }

    return violation;
  }, [violationCount, options]);

  const dismissViolation = useCallback(() => {
    setViolationState(null);
  }, []);

  const getViolationConfig = useCallback((type: ViolationState['type'], count: number) => {
    const configs = {
      tab_switch: {
        title: '🚨 TAB SWITCHING DETECTED',
        message: `You have switched to another tab or window. This is a SERIOUS VIOLATION of exam rules.`,
        bgColor: 'bg-red-900/95',
        borderColor: 'border-red-500',
        textColor: 'text-red-100',
        buttonColor: 'bg-red-600 hover:bg-red-700'
      },
      focus_loss: {
        title: '⚠️ FOCUS LOSS DETECTED',
        message: `Your browser window has lost focus. This behavior is being monitored and recorded.`,
        bgColor: 'bg-orange-900/95',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-100',
        buttonColor: 'bg-orange-600 hover:bg-orange-700'
      },
      fullscreen_exit: {
        title: '🔒 FULLSCREEN EXIT VIOLATION',
        message: `You have exited fullscreen mode. This is STRICTLY PROHIBITED during the exam.`,
        bgColor: 'bg-red-900/95',
        borderColor: 'border-red-500',
        textColor: 'text-red-100',
        buttonColor: 'bg-red-600 hover:bg-red-700'
      },
      alt_tab: {
        title: '🚫 ALT+TAB DETECTED',
        message: `Application switching detected. This is considered CHEATING and will result in exam termination.`,
        bgColor: 'bg-red-900/95',
        borderColor: 'border-red-500',
        textColor: 'text-red-100',
        buttonColor: 'bg-red-600 hover:bg-red-700'
      },
      context_menu: {
        title: '🖱️ RIGHT-CLICK BLOCKED',
        message: `Right-click menu access is disabled. Do not attempt to access browser functions.`,
        bgColor: 'bg-yellow-900/95',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-100',
        buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
      },
      developer_tools: {
        title: '🛠️ DEVELOPER TOOLS DETECTED',
        message: `Developer tools usage detected. This is a CRITICAL VIOLATION and exam will be terminated.`,
        bgColor: 'bg-red-900/95',
        borderColor: 'border-red-500',
        textColor: 'text-red-100',
        buttonColor: 'bg-red-600 hover:bg-red-700'
      },
      copy_paste: {
        title: '📋 COPY/PASTE BLOCKED',
        message: `Copy/paste operations are disabled. Attempting to cheat will result in immediate disqualification.`,
        bgColor: 'bg-purple-900/95',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-100',
        buttonColor: 'bg-purple-600 hover:bg-purple-700'
      }
    };

    return configs[type];
  }, []);

  useEffect(() => {
    if (!isExamActive) return;

    // Enhanced focus/blur detection
    const handleWindowBlur = () => {
      createViolation('focus_loss', 'Window focus lost - suspected application switching');
    };

    const handleWindowFocus = () => {
      if (lastViolationType === 'focus_loss' && violationState) {
        // User came back from focus loss
        createViolation('focus_loss', 'Returned to exam window after focus loss');
      }
    };

    // Enhanced visibility change detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        createViolation('tab_switch', 'Tab became hidden - tab switching detected', 'critical');
      } else {
        // User returned to tab
        if (lastViolationType === 'tab_switch') {
          createViolation('tab_switch', 'Returned to exam tab after switching', 'warning');
        }
      }
    };

    // Fullscreen monitoring
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        createViolation('fullscreen_exit', 'Fullscreen mode exited - this is prohibited', 'critical');
      }
    };

    // Enhanced keyboard monitoring
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Alt+Tab combinations
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        createViolation('alt_tab', 'Alt+Tab key combination detected', 'critical');
        return false;
      }

      // Detect other dangerous combinations
      if (e.altKey && (e.key === 'F4' || e.key === 'Tab')) {
        e.preventDefault();
        createViolation('alt_tab', `Alt+${e.key} combination blocked`, 'critical');
        return false;
      }

      // F12, Ctrl+Shift+I (Developer Tools)
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        createViolation('developer_tools', 'Developer tools access attempt detected', 'fatal');
        return false;
      }

      // Copy/Paste detection
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        createViolation('copy_paste', `${e.key.toUpperCase()} operation blocked`, 'warning');
        return false;
      }

      // Windows key
      if (e.metaKey || e.key === 'Meta') {
        e.preventDefault();
        createViolation('alt_tab', 'Windows/Cmd key blocked', 'warning');
        return false;
      }
    };

    // Right-click detection
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      createViolation('context_menu', 'Right-click menu access attempted');
      return false;
    };

    // Mouse leave detection (for multi-monitor setups)
    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse left the window boundaries
      if (e.clientY <= 0 || e.clientX <= 0 || 
          e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        createViolation('focus_loss', 'Mouse cursor left the exam window area');
      }
    };

    // Add all event listeners
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Developer tools detection using resize
    let devtools = false;
    const checkDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true;
          createViolation('developer_tools', 'Developer tools window detected', 'fatal');
        }
      } else {
        devtools = false;
      }
    };

    const devToolsInterval = setInterval(checkDevTools, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(devToolsInterval);
    };
  }, [isExamActive, createViolation, lastViolationType, violationState]);

  return {
    violationState,
    violationCount,
    dismissViolation,
    getViolationConfig,
    setExamActive: setIsExamActive,
    isExamActive
  };
} 
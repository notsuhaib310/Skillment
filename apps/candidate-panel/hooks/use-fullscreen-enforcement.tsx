import { useEffect } from 'react';

interface UseFullscreenEnforcementOptions {
  /** Whether to enforce fullscreen on component mount */
  enforceOnMount?: boolean;
  /** Whether to block escape key */
  blockEscapeKey?: boolean;
  /** Whether to monitor visibility changes */
  monitorVisibility?: boolean;
  /** Custom retry delay in milliseconds */
  retryDelay?: number;
}

export function useFullscreenEnforcement(options: UseFullscreenEnforcementOptions = {}) {
  const {
    enforceOnMount = true,
    blockEscapeKey = true,
    monitorVisibility = true,
    retryDelay = 100
  } = options;

  useEffect(() => {
    const enforceFullscreen = () => {
      if (!document.fullscreenElement) {
        // Instantly force back to fullscreen without any warnings
        document.documentElement.requestFullscreen().catch((error) => {
          console.log('Fullscreen enforcement failed:', error);
          // Retry after a short delay
          setTimeout(() => {
            document.documentElement.requestFullscreen().catch(() => {
              // If fullscreen completely fails, we still don't show warnings
              console.log('Fullscreen enforcement retry failed');
            });
          }, retryDelay);
        });
      }
    };

    // Force fullscreen on component mount
    if (enforceOnMount) {
      enforceFullscreen();
    }

    // Monitor fullscreen changes and instantly re-enter
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        // Use requestAnimationFrame for immediate execution
        requestAnimationFrame(() => {
          enforceFullscreen();
        });
      }
    };

    // Also monitor visibility changes (tab switches)
    const handleVisibilityChange = () => {
      if (!document.hidden && monitorVisibility) {
        // When tab becomes visible again, ensure fullscreen
        setTimeout(enforceFullscreen, 50);
      }
    };

    // Block Escape key to prevent fullscreen exit
    const handleKeyDown = (e: KeyboardEvent) => {
      if (blockEscapeKey && (e.key === 'Escape' || e.key === 'F11')) {
        e.preventDefault();
        e.stopPropagation();
        // No alerts - just silently block the key
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    if (monitorVisibility) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    if (blockEscapeKey) {
      document.addEventListener('keydown', handleKeyDown, true);
    }

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (monitorVisibility) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (blockEscapeKey) {
        document.removeEventListener('keydown', handleKeyDown, true);
      }
    };
  }, [enforceOnMount, blockEscapeKey, monitorVisibility, retryDelay]);

  return {
    enforceFullscreen: () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((error) => {
          console.log('Manual fullscreen enforcement failed:', error);
        });
      }
    },
    exitFullscreen: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((error) => {
          console.log('Fullscreen exit failed:', error);
        });
      }
    },
    isFullscreen: () => !!document.fullscreenElement
  };
} 
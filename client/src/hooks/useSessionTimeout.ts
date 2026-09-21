import { useState, useEffect, useRef, useCallback } from 'react';

export interface SessionTimeoutConfig {
  /**
   * Inactivity timeout in seconds before showing the warning dialog.
   * Default: 14 minutes (840 seconds). Industry standard: 15 min total.
   */
  warningTimeoutSeconds?: number;
  /**
   * Countdown duration in seconds for the warning dialog before forcing logout.
   * Default: 60 seconds.
   */
  countdownSeconds?: number;
  /**
   * Absolute maximum session duration in seconds (e.g., 8 hours = 28,800 seconds).
   * Forces re-authentication even if active.
   */
  maxSessionSeconds?: number;
  /**
   * Callback fired when session expires due to inactivity or max session limit.
   */
  onSessionExpired: (reason: 'INACTIVITY' | 'MAX_SESSION_REACHED' | 'MANUAL_LOGOUT' | 'REMOTE_LOGOUT') => void;
  /**
   * Enable/disable timeout monitoring (e.g. only active when session exists).
   */
  enabled: boolean;
}

export function useSessionTimeout({
  warningTimeoutSeconds = 14 * 60, // 14 mins default
  countdownSeconds = 60, // 1 min countdown
  maxSessionSeconds = 8 * 60 * 60, // 8 hours absolute max
  onSessionExpired,
  enabled,
}: SessionTimeoutConfig) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const [remainingCountdown, setRemainingCountdown] = useState(countdownSeconds);

  const lastActivityRef = useRef<number>(Date.now());
  const sessionStartRef = useRef<number>(Date.now());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync across tabs via BroadcastChannel
  useEffect(() => {
    if (!enabled) return;

    try {
      channelRef.current = new BroadcastChannel('finstaq_session_channel');
      channelRef.current.onmessage = (event) => {
        if (event.data?.type === 'ACTIVITY_HEARTBEAT') {
          lastActivityRef.current = Math.max(lastActivityRef.current, event.data.timestamp);
          setIsWarningOpen(false);
        } else if (event.data?.type === 'FORCE_LOGOUT') {
          onSessionExpired('REMOTE_LOGOUT');
        }
      };
    } catch (_err) {
      // Fallback for browsers without BroadcastChannel
    }

    return () => {
      channelRef.current?.close();
    };
  }, [enabled, onSessionExpired]);

  // Reset inactivity on user interaction
  const recordActivity = useCallback(() => {
    if (!enabled) return;
    const now = Date.now();
    lastActivityRef.current = now;

    // Only dismiss warning and broadcast if warning was open or on debounced activity
    if (isWarningOpen) {
      setIsWarningOpen(false);
      setRemainingCountdown(countdownSeconds);
    }

    // Broadcast activity heartbeat to other open tabs
    channelRef.current?.postMessage({
      type: 'ACTIVITY_HEARTBEAT',
      timestamp: now,
    });
  }, [enabled, isWarningOpen, countdownSeconds]);

  // Extend session handler (when user clicks "Keep Me Signed In")
  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
    setRemainingCountdown(countdownSeconds);
    channelRef.current?.postMessage({
      type: 'ACTIVITY_HEARTBEAT',
      timestamp: Date.now(),
    });
  }, [countdownSeconds]);

  // Setup user activity event listeners (debounced)
  useEffect(() => {
    if (!enabled) return;

    lastActivityRef.current = Date.now();
    sessionStartRef.current = Date.now();

    let throttleTimer: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          recordActivity();
          throttleTimer = null;
        }, 1000); // Debounce to once per second
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [enabled, recordActivity]);

  // Main ticker timer to evaluate inactivity and countdown
  useEffect(() => {
    if (!enabled) return;

    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const inactiveDurationSeconds = (now - lastActivityRef.current) / 1000;
      const totalSessionDurationSeconds = (now - sessionStartRef.current) / 1000;

      // 1. Check absolute max session limit (e.g. 8 hours)
      if (totalSessionDurationSeconds >= maxSessionSeconds) {
        clearInterval(checkIntervalRef.current!);
        onSessionExpired('MAX_SESSION_REACHED');
        return;
      }

      // 2. Check if reached warning threshold (14 mins)
      if (inactiveDurationSeconds >= warningTimeoutSeconds) {
        const secondsLeft = Math.max(
          0,
          Math.ceil(warningTimeoutSeconds + countdownSeconds - inactiveDurationSeconds)
        );

        if (!isWarningOpen) {
          setIsWarningOpen(true);
        }
        setRemainingCountdown(secondsLeft);

        // 3. Check if countdown expired (0 seconds) -> hard logout
        if (secondsLeft <= 0) {
          clearInterval(checkIntervalRef.current!);
          setIsWarningOpen(false);
          channelRef.current?.postMessage({ type: 'FORCE_LOGOUT' });
          onSessionExpired('INACTIVITY');
        }
      } else {
        if (isWarningOpen) {
          setIsWarningOpen(false);
        }
      }
    }, 1000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [enabled, warningTimeoutSeconds, countdownSeconds, maxSessionSeconds, isWarningOpen, onSessionExpired]);

  return {
    isWarningOpen,
    remainingCountdown,
    extendSession,
  };
}

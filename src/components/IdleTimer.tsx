import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useLogout } from "react-admin";

/** 閒置逾時時間（毫秒），建置報告建議 15–30 分鐘，此處使用 20 分鐘 */
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll", "click", "touchstart"] as const;

/**
 * 全局閒置計時器：監聽 mousemove / keydown 等活動，
 * 逾時未活動則自動登出並重導向登入頁（符合建置報告 §3 閒置自動登出）。
 * 使用 useLogout 與 AppBar 登出行為一致，由 react-admin 統一處理導向。
 */
export const IdleTimer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const logout = useLogout();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doLogout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    logout();
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      doLogout();
    }, IDLE_TIMEOUT_MS);
  }, [doLogout]);

  useEffect(() => {
    resetTimer();

    const onActivity = () => {
      resetTimer();
    };

    ACTIVITY_EVENTS.forEach((ev) => {
      window.addEventListener(ev, onActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => {
        window.removeEventListener(ev, onActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [resetTimer]);

  return <>{children}</>;
};

IdleTimer.displayName = "IdleTimer";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { forceLogoutAndRedirect } from "@/providers/authProvider";

/** 閒置逾時時間（毫秒），建置報告建議 15–30 分鐘，此處使用 20 分鐘 */
const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

/** 登出前提示倒數（毫秒） */
const WARNING_MS = 60 * 1000;

/** token 判斷的緩衝，避免剛好過期邊界時抖動（毫秒） */
const TOKEN_EXP_BUFFER_MS = 10_000;

/** 週期檢查閒置狀態（背景分頁 timer throttle 時可補強） */
const CHECK_INTERVAL_MS = 5_000;

/** 活動事件寫入/廣播節流（mousemove 等高頻事件） */
const ACTIVITY_THROTTLE_MS = 1_000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "scroll",
  "click",
  "touchstart",
] as const;

const AUTH_CHANNEL = "auth_events";
const LS_LAST_ACTIVE_AT = "idle_last_active_at";
const LS_FORCE_LOGOUT_AT = "idle_force_logout_at";

type AuthBroadcastMessage =
  | { type: "active"; at: number }
  | { type: "logout"; at: number };

/**
 * 全局閒置計時器：監聽 mousemove / keydown 等活動，
 * 逾時未活動則自動登出並重導向登入頁（符合建置報告 §3 閒置自動登出）。
 * 使用 useLogout 與 AppBar 登出行為一致，由 react-admin 統一處理導向。
 */
export const IdleTimer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningSecondsLeft, setWarningSecondsLeft] = useState<number>(0);
  const warningOpenRef = useRef(false);
  const lastActiveAtRef = useRef<number>(Date.now());
  const lastActivityWriteAtRef = useRef<number>(0);
  const isLoggingOutRef = useRef(false);

  const channel = useMemo(() => {
    if (typeof window === "undefined") return null;
    if (typeof BroadcastChannel === "undefined") return null;
    try {
      return new BroadcastChannel(AUTH_CHANNEL);
    } catch {
      return null;
    }
  }, []);

  const getStoredLastActiveAt = useCallback((): number => {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(LS_LAST_ACTIVE_AT) : null;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) && n > 0 ? n : Date.now();
  }, []);

  const getEffectiveTimeoutMs = useCallback((now: number): number => {
    // 若未登入（無 token），不啟用閒置登出（回傳 Infinity）
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return Number.POSITIVE_INFINITY;

    const idle = IDLE_TIMEOUT_MS;
    const tokenExpiresAtRaw =
      typeof localStorage !== "undefined" ? localStorage.getItem("tokenExpiresAt") : null;
    if (!tokenExpiresAtRaw) return idle;

    const tokenExpiresAtMs = Number(tokenExpiresAtRaw);
    if (!Number.isFinite(tokenExpiresAtMs) || tokenExpiresAtMs <= 0) return idle;

    const remaining = tokenExpiresAtMs - now - TOKEN_EXP_BUFFER_MS;
    if (remaining <= 0) return 0;
    return Math.min(idle, remaining);
  }, []);

  const broadcast = useCallback(
    (msg: AuthBroadcastMessage) => {
      if (!channel) return;
      try {
        // 若 channel 已被關閉，postMessage 會丟出 InvalidStateError；此時直接忽略即可
        channel.postMessage(msg);
      } catch {
        // ignore InvalidStateError or other BroadcastChannel errors
      }
    },
    [channel]
  );

  const doLogout = useCallback(
    (opts?: { broadcast?: boolean }) => {
      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;
      warningOpenRef.current = false;
      setWarningOpen(false);
      if (opts?.broadcast !== false) {
        const at = Date.now();
        try {
          localStorage.setItem(LS_FORCE_LOGOUT_AT, String(at));
        } catch {
          // ignore
        }
        broadcast({ type: "logout", at });
      }
      // 直接清除登入狀態並導向登入頁，避免在過期瞬間由 react-admin 顯示預設錯誤畫面
      forceLogoutAndRedirect();
    },
    [broadcast]
  );

  const setWarningOpenBoth = useCallback((next: boolean) => {
    warningOpenRef.current = next;
    setWarningOpen(next);
  }, []);

  const setLastActiveAt = useCallback(
    (at: number, opts?: { broadcast?: boolean; forceWrite?: boolean }) => {
      lastActiveAtRef.current = at;
      const now = Date.now();
      const shouldWrite =
        opts?.forceWrite ||
        now - lastActivityWriteAtRef.current >= ACTIVITY_THROTTLE_MS;
      if (!shouldWrite) return;
      lastActivityWriteAtRef.current = now;

      try {
        localStorage.setItem(LS_LAST_ACTIVE_AT, String(at));
      } catch {
        // ignore
      }

      if (opts?.broadcast !== false) {
        broadcast({ type: "active", at });
      }
    },
    [broadcast]
  );

  const checkIdle = useCallback(
    (source?: "interval" | "focus" | "visibility") => {
      if (isLoggingOutRef.current) return;
      const now = Date.now();
      const effectiveTimeout = getEffectiveTimeoutMs(now);
      if (!Number.isFinite(effectiveTimeout)) {
        // 未登入或不需啟用
        if (warningOpenRef.current) setWarningOpenBoth(false);
        return;
      }

      const lastActiveAt = lastActiveAtRef.current || getStoredLastActiveAt();
      const deadline = lastActiveAt + effectiveTimeout;
      const remaining = deadline - now;

      if (remaining <= 0) {
        doLogout();
        return;
      }

      // 背景分頁回到前景時，可能發生剩餘秒數瞬間跳變；以 remaining 重新計算 UI 倒數
      if (remaining <= WARNING_MS) {
        const secondsLeft = Math.max(1, Math.ceil(remaining / 1000));
        setWarningSecondsLeft(secondsLeft);
        if (!warningOpenRef.current) setWarningOpenBoth(true);
      } else if (warningOpenRef.current) {
        setWarningOpenBoth(false);
      }

      // 若從 focus/visibility 觸發，順手同步一次 lastActiveAt（避免本分頁冷啟動時 ref 落後）
      if (source && (source === "focus" || source === "visibility")) {
        const stored = getStoredLastActiveAt();
        if (stored !== lastActiveAtRef.current) lastActiveAtRef.current = stored;
      }
    },
    [doLogout, getEffectiveTimeoutMs, getStoredLastActiveAt, setWarningOpenBoth]
  );

  useEffect(() => {
    // 初始化：以 localStorage 為准（多分頁共享）；若無則寫入一次
    const initial = getStoredLastActiveAt();
    lastActiveAtRef.current = initial;
    setLastActiveAt(initial, { broadcast: false, forceWrite: true });

    const onActivity = () => {
      if (isLoggingOutRef.current) return;
      const at = Date.now();
      setLastActiveAt(at);
      // 活動後立刻檢查，避免剛好落在 warning 區間仍顯示提示
      checkIdle();
    };

    ACTIVITY_EVENTS.forEach((ev) => {
      window.addEventListener(ev, onActivity, { passive: true });
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkIdle("visibility");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });

    const onFocus = () => {
      checkIdle("focus");
    };
    window.addEventListener("focus", onFocus, { passive: true });

    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_LAST_ACTIVE_AT && e.newValue) {
        const at = Number(e.newValue);
        if (Number.isFinite(at) && at > 0) {
          lastActiveAtRef.current = at;
          // 其他分頁活躍時，關閉本分頁 warning（避免用戶誤解）
          if (warningOpenRef.current) setWarningOpenBoth(false);
        }
      }
      if (e.key === LS_FORCE_LOGOUT_AT && e.newValue) {
        // 其他分頁要求登出
        doLogout({ broadcast: false });
      }
    };
    window.addEventListener("storage", onStorage);

    const onMessage = (ev: MessageEvent) => {
      const data = ev.data as Partial<AuthBroadcastMessage> | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "active" && typeof data.at === "number") {
        lastActiveAtRef.current = data.at;
        if (warningOpenRef.current) setWarningOpenBoth(false);
      }
      if (data.type === "logout") {
        doLogout({ broadcast: false });
      }
    };
    channel?.addEventListener("message", onMessage);

    // 週期檢查：確保背景分頁/計時器 throttle 時也能在回到前景前後快速修正狀態
    const interval = window.setInterval(() => checkIdle("interval"), CHECK_INTERVAL_MS);

    // 首次檢查（避免 token 已過期但仍停留在頁面上）
    checkIdle("interval");

    return () => {
      ACTIVITY_EVENTS.forEach((ev) => {
        window.removeEventListener(ev, onActivity);
      });
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onMessage);
      window.clearInterval(interval);
      channel?.close();
    };
  }, [channel, checkIdle, doLogout, getStoredLastActiveAt, setLastActiveAt]);

  // 提示視窗開啟時，每秒更新倒數顯示
  useEffect(() => {
    if (!warningOpen) return;
    const t = window.setInterval(() => checkIdle("interval"), 1000);
    return () => window.clearInterval(t);
  }, [checkIdle, warningOpen]);

  return (
    <>
      {children}
      <Dialog
        open={warningOpen}
        onClose={() => {
          // 允許使用者關閉，但不等於延長；關閉後仍會在下一次 checkIdle 再次彈出
          setWarningOpenBoth(false);
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>即將自動登出</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            因閒置過久，系統將於 <strong>{warningSecondsLeft}</strong> 秒後自動登出。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            若你仍在使用，請點「繼續登入」以延長使用時間。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => {
              doLogout();
            }}
          >
            立即登出
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const at = Date.now();
              setLastActiveAt(at, { forceWrite: true });
              setWarningOpenBoth(false);
              checkIdle();
            }}
          >
            繼續登入
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

IdleTimer.displayName = "IdleTimer";

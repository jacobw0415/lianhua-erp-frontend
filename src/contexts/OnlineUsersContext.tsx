/**
 * 使用者上線狀態（WebSocket）全域 Context
 *
 * - 在 App 層級掛載，登入成功拿到 Token 時即觸發 connect()（聆聽 auth:login），不等待頁面渲染。
 * - 在 onConnect 回呼中主動請求一次最新在線列表（GET /api/users/online）。
 * - 登出（auth:logout）或 F5 時斷線；路由切換時連線持續存在。
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import SockJS from "sockjs-client";
import { Client, ReconnectionTimeMode } from "@stomp/stompjs";

import { getApiUrl, getWsUrl } from "@/config/apiUrl";
import type { OnlineUserDto, UserOnlineEventDto } from "@/types/onlineUsers";
import type { WsConnectionStatus } from "@/types/onlineUsers";

function getAuthHeaders(): Headers {
  const headers = new Headers();
  headers.set("Accept", "application/json");
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  const tokenType =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("tokenType") || "Bearer"
      : "Bearer";
  if (token) {
    headers.set("Authorization", `${tokenType} ${token}`);
  }
  return headers;
}

interface OnlineUsersApiResponse {
  status?: number;
  message?: string;
  data?: OnlineUserDto[];
  timestamp?: string;
}

async function fetchOnlineUsers(): Promise<OnlineUserDto[]> {
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/users/online`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET /api/users/online 失敗: ${res.status} ${text}`);
  }
  const json = (await res.json()) as OnlineUsersApiResponse;
  if (!Array.isArray(json?.data)) return [];
  return json.data;
}

export interface OnlineUsersContextValue {
  onlineUsers: OnlineUserDto[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  /** WebSocket 連線狀態，可用於顯示綠／黃／紅燈或提示文案 */
  connectionStatus: WsConnectionStatus;
}

const OnlineUsersContext = createContext<OnlineUsersContextValue | null>(null);

const EMPTY_VALUE: OnlineUsersContextValue = {
  onlineUsers: [],
  loading: false,
  error: null,
  refresh: async () => {},
  connectionStatus: "idle",
};

export interface OnlineUsersProviderProps {
  children: ReactNode;
}

/**
 * 在 App 層級掛載。登入成功時 authProvider 會 dispatch('auth:login')，此時立即建立 WebSocket，
 * 不等待 Layout/頁面渲染。onConnect 時主動請求一次最新在線列表。
 */
export function OnlineUsersProvider({ children }: OnlineUsersProviderProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>("idle");
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem("token"));
  const clientRef = useRef<Client | null>(null);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setOnlineUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await fetchOnlineUsers();
      setOnlineUsers(list);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setOnlineUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 聆聽登入／登出，取得 Token 當下就觸發連線
  useEffect(() => {
    const onLogin = () => setHasToken(true);
    const onLogout = () => setHasToken(false);
    window.addEventListener("auth:login", onLogin);
    window.addEventListener("auth:logout", onLogout);
    return () => {
      window.removeEventListener("auth:login", onLogin);
      window.removeEventListener("auth:logout", onLogout);
    };
  }, []);

  // hasToken 為 true 時立即建立 WebSocket；onConnect 時再請求最新在線列表
  useEffect(() => {
    if (!hasToken) {
      setOnlineUsers([]);
      setLoading(false);
      setError(null);
      setConnectionStatus("idle");
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch {
          // ignore
        }
        clientRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    let mounted = true;
    setLoading(true);
    setError(null);
    setConnectionStatus("connecting");

    // 僅透過 CONNECT header 傳遞 Token，不放入 URL 以降低被記錄的風險
    const baseWsUrl = getWsUrl();
    const client = new Client({
      webSocketFactory: () => new SockJS(baseWsUrl) as unknown as WebSocket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      // 指數退避重連：首次 2 秒，之後加倍，上限 60 秒，避免伺服器異常時密集重連
      reconnectDelay: 2000,
      maxReconnectDelay: 60 * 1000,
      reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
      // Heartbeat 協助及早發現死連線（單位 ms）
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        if (!mounted || !clientRef.current) return;
        setConnectionStatus("connected");
        setError(null); // 重連成功後清除先前錯誤
        clientRef.current.subscribe("/topic/online-users", (msg) => {
          if (!mounted) return;
          try {
            const event = JSON.parse(msg.body) as UserOnlineEventDto;
            setOnlineUsers((prev) => {
              if (event.eventType === "ONLINE") {
                const exists = prev.some((u) => u.id === event.userId);
                if (exists) {
                  return prev.map((u) =>
                    u.id === event.userId
                      ? {
                          ...u,
                          username: event.username,
                          fullName: event.fullName,
                          onlineAt: event.at,
                        }
                      : u
                  );
                }
                return [
                  ...prev,
                  {
                    id: event.userId,
                    username: event.username,
                    fullName: event.fullName,
                    onlineAt: event.at,
                  },
                ].sort(
                  (a, b) =>
                    new Date(a.onlineAt).getTime() -
                    new Date(b.onlineAt).getTime()
                );
              }
              if (event.eventType === "OFFLINE") {
                return prev.filter((u) => u.id !== event.userId);
              }
              return prev;
            });
          } catch (e) {
            console.error("[OnlineUsers] 解析 WebSocket 訊息失敗", e);
          }
        });
        // 連線成功後主動請求一次最新在線列表（含當前使用者）
        refresh();
      },
      onWebSocketClose: () => {
        if (mounted) setConnectionStatus("reconnecting");
      },
      onStompError: (frame) => {
        if (mounted) {
          setConnectionStatus("error");
          setError(
            new Error(frame.headers?.message || "WebSocket 連線錯誤")
          );
        }
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      mounted = false;
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch {
          // ignore
        }
        clientRef.current = null;
      }
    };
  }, [hasToken, refresh]);

  const value: OnlineUsersContextValue = {
    onlineUsers,
    loading,
    error,
    refresh,
    connectionStatus,
  };

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export function useOnlineUsers(): OnlineUsersContextValue {
  const ctx = useContext(OnlineUsersContext);
  return ctx ?? EMPTY_VALUE;
}

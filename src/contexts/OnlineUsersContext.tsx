/**
 * 使用者上線狀態（WebSocket）全域 Context
 * * 終極修正版：
 * 1. 解決手機刷新導致的「狀態覆蓋」問題。
 * 2. 強化異步清理與全域單例。
 * 3. 增加 Console 診斷，方便追蹤事件到達順序。
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
import type { OnlineUserDto, UserOnlineEventDto, WsConnectionStatus } from "@/types/onlineUsers";

// --- 【全域單例】 ---
let globalClient: Client | null = null;

const OnlineUsersContext = createContext<any>(null);

export function OnlineUsersProvider({ children }: { children: ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserDto[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>("idle");
  const [hasToken, setHasToken] = useState(() => {
    if (typeof localStorage !== 'undefined') return !!localStorage.getItem("token");
    return false;
  });
  
  const refreshRef = useRef<(() => Promise<void>) | null>(null);

  // 獲取最新清單
  const refresh = useCallback(async () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const res = await fetch(`${getApiUrl()}/users/online`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json?.data)) {
        setOnlineUsers(json.data);
        console.log("[WS] API 清單已同步", json.data.length, "人在線");
      }
    } catch (e) {
      console.error("[WS] Refresh Error", e);
    }
  }, []);

  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  // 1. 強效登出與登入事件監聽
  useEffect(() => {
    const onLogout = async () => {
      console.log("[WS] 偵測到登出，清理連線與狀態");
      setHasToken(false);
      setOnlineUsers([]);
      setConnectionStatus("idle");
      if (globalClient) {
        const clientToKill = globalClient;
        globalClient = null;
        clientToKill.deactivate().catch(() => {});
      }
    };
    const onLogin = () => setHasToken(true);

    window.addEventListener("auth:logout", onLogout);
    window.addEventListener("auth:login", onLogin);
    return () => {
      window.removeEventListener("auth:logout", onLogout);
      window.removeEventListener("auth:login", onLogin);
    };
  }, []);

  // 2. WebSocket 生命周期 (對抗手機刷新與 ECONNRESET)
  useEffect(() => {
    let isMounted = true;

    const startConnection = async () => {
      try {
        if (globalClient) {
          await globalClient.deactivate().catch(() => {});
          globalClient = null;
        }

        if (!hasToken || !isMounted) return;

        const token = localStorage.getItem("token");
        const wsUrl = getWsUrl();
        if (!token || !wsUrl) return;

        setConnectionStatus("connecting");

        const client = new Client({
          webSocketFactory: () => new SockJS(`${wsUrl}?t=${Date.now()}`) as any,
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 8000,
          heartbeatIncoming: 20000,
          heartbeatOutgoing: 20000,
          onConnect: () => {
            if (!isMounted) { client.deactivate(); return; }
            setConnectionStatus("connected");

            client.subscribe("/topic/online-users", (msg) => {
              if (!isMounted) return;
              try {
                const event = JSON.parse(msg.body) as UserOnlineEventDto;
                const uidStr = String(event.userId);
                
                setOnlineUsers((prev) => {
                  // 強制過濾：無論什麼事件，先移除舊的該 ID 資料
                  const filtered = prev.filter(u => String(u.id) !== uidStr);
                  
                  if (event.eventType === "ONLINE") {
                    console.log(`[WS] 收到上線通知: ${event.username}`);
                    return [...filtered, 
                      { id: event.userId, username: event.username, fullName: event.fullName, onlineAt: event.at }
                    ].sort((a, b) => new Date(a.onlineAt).getTime() - new Date(b.onlineAt).getTime());
                  }
                  
                  console.log(`[WS] 收到離線通知: ID ${event.userId}`);
                  return filtered;
                });
              } catch (e) { console.error("[WS] Parse Error", e); }
            });

            // 【關鍵修正】稍微延遲 refresh，防止 API 回傳的舊資料蓋掉剛剛收到的離線廣播
            setTimeout(() => {
              if (isMounted && hasToken) refreshRef.current?.();
            }, 1000); 
          },
          onWebSocketClose: () => {
            if (isMounted && hasToken) setConnectionStatus("reconnecting");
          },
          onStompError: () => {
            if (isMounted) setConnectionStatus("error");
          }
        });

        globalClient = client;
        client.activate();
      } catch (err) {
        if (isMounted) setConnectionStatus("error");
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (globalClient) {
        globalClient.deactivate().catch(() => {});
        globalClient = null;
      }
    };
  }, [hasToken]);

  return (
    <OnlineUsersContext.Provider value={{ onlineUsers, loading: false, error: null, refresh, connectionStatus }}>
      {children}
    </OnlineUsersContext.Provider>
  );
}

export const useOnlineUsers = () => {
    const context = useContext(OnlineUsersContext);
    return context || { onlineUsers: [], loading: false, error: null, refresh: async () => {}, connectionStatus: "idle" };
};
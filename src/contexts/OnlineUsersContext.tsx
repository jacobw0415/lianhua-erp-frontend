/**
 * 使用者上線狀態（WebSocket）全域 Context
 * 修正版：
 * 1. 增加 MFA 狀態判斷，防止在驗證期間發送無效請求。
 * 2. 延遲登入後的初始連線，避開後端 Session 鎖定競爭 (409 修正)。
 * 3. 強化清理邏輯，確保 token 切換時連線確實重建。
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
import { Client } from "@stomp/stompjs";
import { getApiUrl, getWsUrl } from "@/config/apiUrl";
import type { OnlineUserDto, UserOnlineEventDto, WsConnectionStatus } from "@/types/onlineUsers";

// 全域單例
let globalClient: Client | null = null;

const OnlineUsersContext = createContext<any>(null);

export function OnlineUsersProvider({ children }: { children: ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserDto[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<WsConnectionStatus>("idle");
  
  //  修正 1：初始化時檢查是否處於 MFA 待驗證階段
  const [hasToken, setHasToken] = useState(() => {
    if (typeof localStorage === 'undefined') return false;
    const token = !!localStorage.getItem("token");
    const isMfaPending = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem("mfa_pending_token");
    // 只有當有 Token 且「不是」在 MFA 驗證中，才啟動自動連線
    return token && !isMfaPending;
  });
  
  const refreshRef = useRef<(() => Promise<void>) | null>(null);

  const refresh = useCallback(async () => {
    //  修正 2：如果正在 MFA 階段，不執行 refresh
    const isMfaPending = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem("mfa_pending_token");
    if (isMfaPending) return;

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

  // 監聽登入/登出事件
  useEffect(() => {
    const onLogout = async () => {
      console.log("[WS] 偵測到登出，清理連線");
      setHasToken(false);
      setOnlineUsers([]);
      setConnectionStatus("idle");
      if (globalClient) {
        const clientToKill = globalClient;
        globalClient = null;
        clientToKill.deactivate().catch(() => {});
      }
    };

    const onLogin = () => {
      //  修正 3：收到登入事件後，延遲 500ms 再啟動連線
      // 這能確保 MfaVerifyPage 的導頁優先完成，且後端 Session 已解鎖
      setTimeout(() => {
        console.log("[WS] 偵測到登入成功，準備建立連線...");
        setHasToken(true);
      }, 500); 
    };

    window.addEventListener("auth:logout", onLogout);
    window.addEventListener("auth:login", onLogin);
    return () => {
      window.removeEventListener("auth:logout", onLogout);
      window.removeEventListener("auth:login", onLogin);
    };
  }, []);

  // WebSocket 生命周期
  useEffect(() => {
    let isMounted = true;

    const startConnection = async () => {
      try {
        if (globalClient) {
          await globalClient.deactivate().catch(() => {});
          globalClient = null;
        }

        // 🌟 修正 4：雙重檢查，MFA 階段不連線
        const isMfaPending = typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem("mfa_pending_token");
        if (!hasToken || !isMounted || isMfaPending) return;

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
                  const filtered = prev.filter(u => String(u.id) !== uidStr);
                  if (event.eventType === "ONLINE") {
                    return [...filtered, 
                      { id: event.userId, username: event.username, fullName: event.fullName, onlineAt: event.at }
                    ].sort((a, b) => new Date(a.onlineAt).getTime() - new Date(b.onlineAt).getTime());
                  }
                  return filtered;
                });
              } catch (e) { console.error("[WS] Parse Error", e); }
            });

            // 🌟 修正 5：連線成功後，稍微延遲 API Refresh
            setTimeout(() => {
              if (isMounted && hasToken) refreshRef.current?.();
            }, 1500); 
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
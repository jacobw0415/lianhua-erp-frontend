import type { AuthProvider } from "react-admin";

import { getApiUrl } from "@/config/apiUrl";
import { clearAppCache } from "@/utils/appCache";
import { clearProfileCache } from "@/utils/profileCache";

/** 應用基底路徑 */
const BASE_PATH = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "";

/** SSE 事件來源 */
let sessionEventSource: EventSource | null = null;

function closeSessionEventSource(): void {
  try {
    sessionEventSource?.close();
  } catch {
    // ignore
  } finally {
    sessionEventSource = null;
  }
}

function startSessionEventSource(token: string): void {
  if (typeof window === "undefined" || typeof EventSource === "undefined") return;
  if (!token) return;

  const apiUrl = getApiUrl();
  closeSessionEventSource();

  const url = `${apiUrl}/session/stream?token=${encodeURIComponent(token)}`;
  const es = new EventSource(url);

  es.addEventListener("INIT", () => {
    if (import.meta.env.DEV) {
      console.log("[SSE] session stream connected");
    }
  });

  es.addEventListener("FORCE_LOGOUT", () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("login_expired", "1");
      sessionStorage.setItem("login_expired_reason", "force_logout");
    }
    closeSessionEventSource();
    forceLogoutAndRedirect();
  });

  es.onerror = () => {
    closeSessionEventSource();
  };

  sessionEventSource = es;
}

function ensureSessionEventSourceStarted(): void {
  if (sessionEventSource) return;
  if (typeof localStorage === "undefined") return;
  const token = localStorage.getItem("token");
  if (!token) return;
  startSessionEventSource(token);
}

const AUTH_STORAGE_KEYS = [
  "token",
  "tokenType",
  "refreshToken",
  "tokenExpiresAt",
  "username",
  "role",
  "userId",
  "authRoles",
] as const;

/** 集中清除前端登入狀態 */
function clearAuthStorage(): void {
  // 1. 【核心新增】優先通知 WebSocket 斷開連線，避免 Token 清除後產生 401 錯誤
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }

  // 2. 清除本地存儲
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("mfaEnabled");
  try {
    localStorage.removeItem("idle_last_active_at");
    localStorage.removeItem("idle_force_logout_at");
  } catch {
    // ignore
  }
}

export function forceLogoutAndRedirect(): void {
  closeSessionEventSource();
  clearAppCache();
  clearAuthStorage();
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("login_expired", "1");
    if (!sessionStorage.getItem("login_expired_reason")) {
      sessionStorage.setItem("login_expired_reason", "expired");
    }
    sessionStorage.removeItem("redirectPath");
  }
  redirectToLogin();
}

function getJwtExp(token: string): number | undefined {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return undefined;
    const payload = parts[1];
    if (!payload) return undefined;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const obj = JSON.parse(decoded) as { exp?: number };
    return typeof obj.exp === "number" ? obj.exp : undefined;
  } catch {
    return undefined;
  }
}

function hasValidToken(): boolean {
  if (typeof localStorage === "undefined") return false;
  const token = localStorage.getItem("token");
  if (!token) return false;

  const expiresAtRaw = localStorage.getItem("tokenExpiresAt");
  if (expiresAtRaw) {
    const expiresAtMs = Number(expiresAtRaw);
    if (Number.isFinite(expiresAtMs) && expiresAtMs > 0) {
      if (Date.now() >= expiresAtMs - 10_000) {
        clearAuthStorage();
        return false;
      }
    }
  }

  const exp = getJwtExp(token);
  if (exp === undefined) return true;
  if (Date.now() / 1000 >= exp - 10) {
    clearAuthStorage();
    return false;
  }
  return true;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const basePath = BASE_PATH.replace(/\/$/, "") || "";
  const path = `${basePath}/login`;

  if (window.history && typeof window.history.pushState === "function") {
    window.history.pushState(null, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    return;
  }

  const base = window.location.origin;
  if (base) window.location.href = `${base}${path}`;
}

// --- 輔助介面 ---
interface LoginResponseContainer {
  id?: unknown;
  token?: unknown;
  accessToken?: unknown;
  access_token?: unknown;
  refreshToken?: unknown;
  refresh_token?: unknown;
  type?: unknown;
  tokenType?: unknown;
  token_type?: unknown;
  username?: unknown;
  userName?: unknown;
  account?: unknown;
  email?: unknown;
  fullName?: unknown;
  role?: unknown;
  roles?: unknown[];
  authorities?: unknown[];
  roleNames?: unknown[];
  user?: LoginResponseContainer;
  result?: LoginResponseContainer;
  data?: LoginResponseContainer;
  expiresIn?: unknown;
}

// --- 工具方法 ---
function getString(value: unknown): string | undefined {
  if (value == null) return undefined;
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
}

function getTokenFromContainer(c: LoginResponseContainer): string | undefined {
  return getString(c.token) ?? getString(c.accessToken) ?? getString(c.access_token);
}

function getRefreshTokenFromContainer(c: LoginResponseContainer): string | undefined {
  return getString(c.refreshToken) ?? getString(c.refresh_token);
}

// --- 核心應用邏輯 ---
export function applyLoginSuccessFromContainer(
  container: LoginResponseContainer,
  usernameForDisplay?: string,
  mfaEnabled?: boolean
): void {
  clearProfileCache();
  const token = getTokenFromContainer(container);
  if (!token) throw new Error("後端未回傳 token");

  localStorage.setItem("token", token);
  localStorage.setItem("tokenType", getString(container.tokenType) ?? "Bearer");
  const refreshToken = getRefreshTokenFromContainer(container);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
  
  const displayName = getString(container.username) ?? getString(container.userName) ?? usernameForDisplay ?? "";
  if (displayName) localStorage.setItem("username", displayName);
  
  const userId = getString(container.id);
  if (userId) localStorage.setItem("userId", userId);

  const rawRoles = Array.isArray(container.roles) ? container.roles : [];
  localStorage.setItem("authRoles", JSON.stringify(rawRoles.length > 0 ? rawRoles : ["ROLE_USER"]));

  const expiresIn = Number(container.expiresIn);
  if (Number.isFinite(expiresIn) && expiresIn > 0) {
    localStorage.setItem("tokenExpiresAt", String(Date.now() + expiresIn * 1000));
  }
  if (mfaEnabled) localStorage.setItem("mfaEnabled", "true");
}

export async function refreshSessionToken(): Promise<boolean> {
  const refreshToken =
    typeof localStorage !== "undefined" ? localStorage.getItem("refreshToken") : null;
  if (!refreshToken) return false;

  const apiUrl = getApiUrl();
  try {
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || !json) return false;
    const payload =
      (json as { data?: LoginResponseContainer }).data ??
      (json as LoginResponseContainer);
    applyLoginSuccessFromContainer(payload);
    return true;
  } catch {
    return false;
  }
}

export function applyLoginSuccessWithSse(
  container: LoginResponseContainer,
  usernameForDisplay?: string,
  mfaEnabled?: boolean
): void {
  applyLoginSuccessFromContainer(container, usernameForDisplay, mfaEnabled);
  const token = getTokenFromContainer(container);
  if (token) {
    startSessionEventSource(token);
    // 【核心新增】通知 WebSocket Provider：資料已備齊，可以上線了
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("auth:login"));
      }, 0);
    }
  }
}

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "帳號或密碼錯誤");
    }

    const json = await response.json();
    // 檢查是否有 MFA
    const data = json.data || json;
    if (data.mfaRequired) {
        sessionStorage.setItem("mfa_pending_token", data.pendingToken);
        throw { message: "MFA_REQUIRED", code: "MFA_REQUIRED" };
    }

    applyLoginSuccessWithSse(data, username);
  },

  logout: async () => {
    const apiUrl = getApiUrl();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `${localStorage.getItem("tokenType") || "Bearer"} ${token}`,
          },
        });
      } catch {
        console.warn("Logout API failed, but clearing storage anyway.");
      }
    }
    closeSessionEventSource();
    clearAppCache();
    clearAuthStorage();
  },

  checkAuth: () => {
    if (!hasValidToken()) return Promise.reject();
    ensureSessionEventSourceStarted();
    return Promise.resolve();
  },

  getPermissions: () => {
    const stored = localStorage.getItem("authRoles");
    return Promise.resolve(stored ? JSON.parse(stored) : ["ROLE_USER"]);
  },

  checkError: (error) => {
    if (error?.status === 401) {
      forceLogoutAndRedirect();
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const username = localStorage.getItem("username");
    if (!username) {
      return Promise.reject();
    }
    const id: string = (localStorage.getItem("userId") ?? username) as string;
    return Promise.resolve({ id, fullName: username });
  },
};
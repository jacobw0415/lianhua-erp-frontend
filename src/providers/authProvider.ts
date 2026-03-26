import type { AuthProvider } from "react-admin";
import { getApiUrl } from "@/config/apiUrl";
import { clearAppCache } from "@/utils/appCache";
import { clearProfileCache } from "@/utils/profileCache";

/** 應用基底路徑 */
const BASE_PATH = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "";

/** SSE 事件來源 */
let sessionEventSource: EventSource | null = null;
let loginRedirectInProgress = false;

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

export const AUTH_LOGOUT_IN_PROGRESS_KEY = "auth_logout_in_progress";

export function beginLogoutSession(): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(AUTH_LOGOUT_IN_PROGRESS_KEY, "1");
    }
  } catch {
    // ignore
  }
}

export function clearLogoutSessionFlag(): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(AUTH_LOGOUT_IN_PROGRESS_KEY);
    }
  } catch {
    // ignore
  }
}

export function isLogoutInProgress(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(AUTH_LOGOUT_IN_PROGRESS_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearStaleAuthTokensForMfaPendingLogin(options?: {
  closeSessionStream?: boolean;
}): void {
  if (typeof localStorage === "undefined") return;
  const closeSse = options?.closeSessionStream !== false;
  if (closeSse) closeSessionEventSource();
  clearProfileCache();
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("mfaEnabled");
  try {
    localStorage.removeItem("idle_last_active_at");
    localStorage.removeItem("idle_force_logout_at");
  } catch {
    // ignore
  }
}

function clearAuthStorage(): void {
  beginLogoutSession();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:logout"));
  }
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
  if (loginRedirectInProgress) return;
  loginRedirectInProgress = true;
  const basePath = BASE_PATH.replace(/\/$/, "") || "";
  const path = `${basePath}/login`;
  const base = window.location.origin;
  if (base) window.location.replace(`${base}${path}`);
}

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
  expiresIn?: unknown;
  roles?: unknown[];
  mfaRequired?: boolean;
  pendingToken?: string;
}

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

export function unwrapAuthLoginPayload(json: unknown): LoginResponseContainer | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;

  const hasTokenLikeField = (obj: Record<string, unknown>): boolean => {
    return Boolean(
      getString(obj.token) ?? getString(obj.accessToken) ?? getString(obj.access_token)
    );
  };

  const visited = new Set<object>();
  const queue: Record<string, unknown>[] = [json as Record<string, unknown>];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (visited.has(cur)) continue;
    visited.add(cur);

    if (hasTokenLikeField(cur)) {
      return cur as LoginResponseContainer;
    }

    for (const key of ["data", "result", "user"] as const) {
      const next = cur[key];
      if (next && typeof next === "object" && !Array.isArray(next)) {
        queue.push(next as Record<string, unknown>);
      }
    }
  }

  return json as LoginResponseContainer;
}

function extractMfaPendingFromLoginResponse(json: unknown): {
  mfaRequired: boolean;
  pendingToken?: string;
} {
  if (!json || typeof json !== "object") {
    return { mfaRequired: false, pendingToken: undefined };
  }
  const root = json as Record<string, unknown>;
  const candidates: Record<string, unknown>[] = [root];
  for (const key of ["data", "result"] as const) {
    const v = root[key];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      candidates.push(v as Record<string, unknown>);
    }
  }
  let mfaRequired = false;
  let pendingToken: string | undefined;
  for (const c of candidates) {
    if (Boolean(c.mfaRequired ?? c.mfa_required)) mfaRequired = true;
    const pt = getString(c.pendingToken) ?? getString(c.pending_token);
    if (pt) pendingToken = pt;
  }
  return { mfaRequired, pendingToken };
}

/**
 * 將登入資訊寫入 Storage
 */
export function applyLoginSuccessFromContainer(
  container: LoginResponseContainer,
  usernameForDisplay?: string,
  mfaEnabled?: boolean
): void {
  clearLogoutSessionFlag();
  clearProfileCache();
  
  const token = getTokenFromContainer(container);
  if (!token) throw new Error("後端未回傳 token");

  // 1. 優先寫入權限，確保 React-Admin getPermissions 抓到最新值
  const rawRoles = Array.isArray(container.roles) ? container.roles : [];
  const finalRoles = rawRoles.length > 0 ? rawRoles : ["ROLE_USER"];
  localStorage.setItem("authRoles", JSON.stringify(finalRoles));

  // 2. 寫入 Token 與標記
  localStorage.setItem("token", token);
  localStorage.setItem("tokenType", getString(container.tokenType) ?? "Bearer");
  
  const refreshToken = getRefreshTokenFromContainer(container);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  // 3. 寫入使用者資訊
  const displayName = getString(container.username) ?? getString(container.userName) ?? usernameForDisplay ?? "";
  if (displayName) localStorage.setItem("username", displayName);

  const userId = getString(container.id);
  if (userId) localStorage.setItem("userId", userId);

  // 4. 處理有效期限
  const expiresIn = Number(container.expiresIn);
  if (Number.isFinite(expiresIn) && expiresIn > 0) {
    localStorage.setItem("tokenExpiresAt", String(Date.now() + expiresIn * 1000));
  } else {
    localStorage.removeItem("tokenExpiresAt");
  }
  
  if (mfaEnabled) localStorage.setItem("mfaEnabled", "true");
}

/**
 * 補回 IdleTimer 需要的 refreshSessionToken
 */
export async function refreshSessionToken(): Promise<boolean> {
  const refreshToken = typeof localStorage !== "undefined" ? localStorage.getItem("refreshToken") : null;
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
    const payload = unwrapAuthLoginPayload(json);
    if (!payload) return false;
    applyLoginSuccessFromContainer(payload);
    return true;
  } catch (err) {
    console.error("Refresh token failed:", err);
    return false;
  }
}

/**
 * 成功登入後的處理（包含延遲啟動 SSE）
 */
export function applyLoginSuccessWithSse(
  container: LoginResponseContainer,
  usernameForDisplay?: string,
  mfaEnabled?: boolean
): void {
  // 同步執行資料寫入
  applyLoginSuccessFromContainer(container, usernameForDisplay, mfaEnabled);
  
  const token = getTokenFromContainer(container);
  if (token) {
    // 🌟 關鍵修正：延遲 300ms 啟動 SSE 與事件通知
    // 給予頁面跳轉與後端事務 (Transaction) 完成的緩衝時間
    setTimeout(() => {
      startSessionEventSource(token);
      
      if (typeof window !== "undefined") {
        // 通知全域 Context 更新（例如 OnlineUsersContext）
        window.dispatchEvent(new CustomEvent("auth:login"));
      }
    }, 300);
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

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(json.message || "帳號或密碼錯誤");
    }

    const data = unwrapAuthLoginPayload(json) ?? (json as LoginResponseContainer);
    const { mfaRequired, pendingToken } = extractMfaPendingFromLoginResponse(json);

    if (mfaRequired) {
      if (!pendingToken) {
        throw new Error("後端未回傳 MFA pending token，請聯絡系統管理員");
      }
      clearStaleAuthTokensForMfaPendingLogin();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("mfa_pending_token", pendingToken);
        sessionStorage.setItem("mfa_username", username);
      }
      // 必須 reject 才能讓 LoginPage 進入 catch 塊
      return Promise.reject({ message: "MFA_REQUIRED", code: "MFA_REQUIRED" });
    }

    applyLoginSuccessWithSse(data, username);
    return Promise.resolve();
  },

  logout: async () => {
    beginLogoutSession();
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
        console.warn("Logout API failed.");
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
    const roles = stored ? JSON.parse(stored) : ["ROLE_USER"];
    if (import.meta.env.DEV) {
      console.log("[AuthProvider] getPermissions called:", roles);
    }
    return Promise.resolve(roles);
  },

  checkError: (error: any) => {
    const status = error?.status ?? error?.body?.status;
    if (status === 401) {
      const hasToken = typeof localStorage !== "undefined" && Boolean(localStorage.getItem("token"));
      const hasMfaPending = typeof sessionStorage !== "undefined" && Boolean(sessionStorage.getItem("mfa_pending_token"));

      // MFA 驗證期間不應觸發全域登出
      if (!hasToken && hasMfaPending) {
        return Promise.reject();
      }

      forceLogoutAndRedirect();
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const username = localStorage.getItem("username");
    if (!username) return Promise.reject();
    const id = localStorage.getItem("userId") ?? username;
    return Promise.resolve({ id, fullName: username });
  },
};
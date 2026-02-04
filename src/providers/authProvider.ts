import type { AuthProvider } from "react-admin";

import { clearAppCache } from "@/utils/appCache";

const apiUrl: string =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/** 應用基底路徑（Vite 的 import.meta.env.BASE_URL，部署子路徑時為 /erp 等） */
const BASE_PATH = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "";

/* ========================================================
 * 常數與儲存鍵
 * ======================================================== */
const AUTH_STORAGE_KEYS = ["token", "tokenType", "username", "role"] as const;

/** 集中清除前端登入狀態，供 logout 與 checkError(401) 共用 */
function clearAuthStorage(): void {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

/**
 * 解析 JWT payload（不驗簽），取得 exp（秒）。非 JWT 或解析失敗回傳 undefined。
 */
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

/** 是否有有效 token（供 checkAuth / check 共用）；JWT 過期則視為無效並清除，先導向登入頁 */
function hasValidToken(): boolean {
  if (typeof localStorage === "undefined") return false;
  const token = localStorage.getItem("token");
  if (!token) return false;

  const exp = getJwtExp(token);
  if (exp === undefined) return true; // 非 JWT 或無 exp，交給後端判斷
  // exp 為秒，留 10 秒緩衝
  if (Date.now() / 1000 >= exp - 10) {
    clearAuthStorage();
    return false;
  }
  return true;
}

/** 強制導向登入頁（401 時使用，避免過期會話持續操作）；支援子路徑部署 */
function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const base = window.location.origin;
  const basePath = BASE_PATH.replace(/\/$/, "") || "";
  const path = `${basePath}/login`;
  if (base) window.location.href = `${base}${path}`;
}

/* ========================================================
 * 型別定義
 * ======================================================== */
type LoginParams = {
  username: string;
  password: string;
};

type LoginSuccessResponseWrapped = {
  success: true;
  data: LoginResponseContainer;
};

type LoginSuccessResponseFlat = LoginResponseContainer;

type LoginErrorResponse = {
  success: false;
  message?: string;
  code?: number;
};

/** 登入成功後 data/body 可能出現的欄位（兼容多種後端格式） */
interface LoginResponseContainer {
  token?: unknown;
  accessToken?: unknown;
  access_token?: unknown;
  type?: unknown;
  tokenType?: unknown;
  token_type?: unknown;
  username?: unknown;
  userName?: unknown;
  account?: unknown;
  email?: unknown;
  role?: unknown;
  roles?: unknown[];
  authorities?: unknown[];
}

function getString(value: unknown | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
}

function getTokenFromContainer(c: LoginResponseContainer): string | undefined {
  return getString(c.token) ?? getString(c.accessToken) ?? getString(c.access_token);
}

function getTypeFromContainer(c: LoginResponseContainer): string {
  return (
    getString(c.type) ??
    getString(c.tokenType) ??
    getString(c.token_type) ??
    "Bearer"
  );
}

function getUsernameFromContainer(c: LoginResponseContainer): string {
  return (
    getString(c.username) ??
    getString(c.userName) ??
    getString(c.account) ??
    getString(c.email) ??
    ""
  );
}

function getRoleFromContainer(c: LoginResponseContainer): string | undefined {
  const role = getString(c.role);
  if (role) return role;
  if (Array.isArray(c.roles) && c.roles[0] != null)
    return getString(c.roles[0]);
  if (Array.isArray(c.authorities) && c.authorities[0] != null)
    return getString(c.authorities[0]);
  return undefined;
}

/* ========================================================
 * AuthProvider 實作
 * ======================================================== */
export const authProvider: AuthProvider = {
  login: async ({ username, password }: LoginParams) => {
    const request = new Request(`${apiUrl}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });

    let response: Response;
    try {
      response = await fetch(request);
    } catch {
      throw new Error("無法連線，請檢查網路後再試");
    }

    if (response.status < 200 || response.status >= 300) {
      let message = "帳號或密碼錯誤";
      try {
        const body = (await response.json()) as LoginErrorResponse;
        if (body?.message) message = body.message;
      } catch {
        // ignore JSON parse error
      }
      throw new Error(message);
    }

    const json = (await response.json().catch(() => null)) as
      | LoginSuccessResponseWrapped
      | LoginSuccessResponseFlat
      | (Record<string, unknown> & { data?: Record<string, unknown> })
      | null;

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("🔐 Login response raw:", json);
    }

    let container: LoginResponseContainer | null = null;
    if (json && typeof json === "object") {
      if ("success" in json && "data" in json && json.data) {
        container = json.data as LoginResponseContainer;
      } else if ("data" in json && json.data) {
        container = json.data as LoginResponseContainer;
      } else {
        container = json as unknown as LoginResponseContainer;
      }
    }

    if (!container) {
      throw new Error("登入回應格式錯誤，請聯絡系統管理員");
    }

    const token = getTokenFromContainer(container);
    if (!token) {
      throw new Error("登入回應格式錯誤，請聯絡系統管理員");
    }

    const type = getTypeFromContainer(container);
    const usernameFromPayload = getUsernameFromContainer(container);
    const roleFromPayload = getRoleFromContainer(container);
    /** 後端未回傳使用者名稱時，以表單輸入的帳號為後備，確保 getIdentity 有值 */
    const displayName = usernameFromPayload || username;

    localStorage.setItem("token", token);
    localStorage.setItem("tokenType", type);
    if (displayName) localStorage.setItem("username", displayName);
    if (roleFromPayload) localStorage.setItem("role", roleFromPayload);
  },

  logout: async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/auth/logout`, {
          method: "POST",
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `${localStorage.getItem("tokenType") || "Bearer"} ${token}`,
          }),
        });
        // 後端 4xx/5xx 不影響前端：仍清除本地，僅在開發時提示後端需修復
        if (!res.ok && import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn(
            `[auth] 後端登出 API 回傳 ${res.status}，請檢查後端 POST /api/auth/logout 是否正常。前端仍會清除登入狀態。`
          );
        }
      } catch {
        // 網路錯誤等：後端登出失敗仍清除前端，避免卡在已登入狀態
      }
    }
    // 先清快取，避免儀表板等 useQuery 在導向登入頁前繼續 refetch 導致一排 HttpError2
    clearAppCache();
    clearAuthStorage();
  },

  checkAuth: () =>
    hasValidToken() ? Promise.resolve() : Promise.reject(),

  /** RBAC：無 role 時回傳 ROLE_USER 作為安全預設，避免選單全部顯示 */
  getPermissions: () => {
    const role = localStorage.getItem("role");
    return Promise.resolve(role || "ROLE_USER");
  },

  /**
   * 401：未授權／token 無效 → 清除會話並導向登入。
   * 403：已登入但無此資源權限 → 僅 reject，不清 token、不導向登入。
   */
  checkError: (error: unknown) => {
    const status = (error as { status?: number })?.status;
    if (status === 401) {
      clearAppCache();
      clearAuthStorage();
      redirectToLogin();
      return Promise.reject();
    }
    if (status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },

  check: () =>
    hasValidToken() ? Promise.resolve() : Promise.reject(),

  getIdentity: () => {
    const username = localStorage.getItem("username");
    if (!username) return Promise.reject();
    return Promise.resolve({ id: username, fullName: username });
  },
};

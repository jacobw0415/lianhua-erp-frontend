import type { AuthProvider } from "react-admin";

import { getApiUrl } from "@/config/apiUrl";
import { clearAppCache } from "@/utils/appCache";
import { clearProfileCache } from "@/utils/profileCache";

/** 應用基底路徑（Vite 的 import.meta.env.BASE_URL，部署子路徑時為 /erp 等） */
const BASE_PATH = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "";

/* ========================================================
 * 常數與儲存鍵
 * ======================================================== */
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

/** 集中清除前端登入狀態，供 logout 與 checkError(401) 共用 */
function clearAuthStorage(): void {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem("mfaEnabled"); // 登出時清除 MFA 提示，避免下一使用者看到錯誤狀態
  // 同步清除閒置計時相關儲存，避免新登入會話沿用舊的最後活動時間導致立刻被 IdleTimer 登出
  try {
    localStorage.removeItem("idle_last_active_at");
    localStorage.removeItem("idle_force_logout_at");
  } catch {
    // ignore
  }
}

/**
 * 強制清除登入狀態並導向登入頁，供 IdleTimer 自動登出與 401 錯誤共用。
 * 透過直接 redirect，避免在過期瞬間由 react-admin 顯示預設錯誤畫面。
 */
export function forceLogoutAndRedirect(): void {
  clearAppCache();
  clearAuthStorage();
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("login_expired", "1");
    // 清除可能被用來「登入後導向」的儲存，避免下一位使用者（如 ROLE_USER）被導到無權限頁
    sessionStorage.removeItem("redirectPath");
  }
  redirectToLogin();
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

/** 是否有有效 token（供 checkAuth / check 共用）；若已過期則視為無效並清除。 */
function hasValidToken(): boolean {
  if (typeof localStorage === "undefined") return false;
  const token = localStorage.getItem("token");
  if (!token) return false;

  // 優先依據後端回傳的 expiresIn（tokenExpiresAt）判斷過期時間
  const expiresAtRaw = localStorage.getItem("tokenExpiresAt");
  if (expiresAtRaw) {
    const expiresAtMs = Number(expiresAtRaw);
    if (Number.isFinite(expiresAtMs) && expiresAtMs > 0) {
      // 留 10 秒緩衝
      if (Date.now() >= expiresAtMs - 10_000) {
        clearAuthStorage();
        return false;
      }
    }
  }

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
  id?: unknown;
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
  fullName?: unknown;
  role?: unknown;
  roles?: unknown[];
  authorities?: unknown[];
  roleNames?: unknown[];
  user?: LoginResponseContainer;
  result?: LoginResponseContainer;
  data?: LoginResponseContainer;
}

/** 後端標準 JwtResponse（登入成功或 refresh 成功時） */
interface JwtResponse {
  token: string;
  refreshToken: string;
  expiresIn: number; // 秒
  type?: string;
  id?: number | string;
  username?: string;
  roles?: unknown[];
  roleNames?: unknown[];
}

/** 後端標準 MFA 待驗證回應（登入第一階段） */
interface MfaPendingResponse {
  mfaRequired: true;
  pendingToken: string;
}

type LoginSuccess = JwtResponse | MfaPendingResponse;

function getString(value: unknown | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
}

function getTokenFromContainer(c: LoginResponseContainer): string | undefined {
  const direct =
    getString(c.token) ?? getString(c.accessToken) ?? getString(c.access_token);
  if (direct) return direct;
  const nested = c.user ?? c.result ?? c.data;
  if (nested && typeof nested === "object")
    return getTokenFromContainer(nested as LoginResponseContainer);
  return undefined;
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
  if (Array.isArray(c.roles) && c.roles[0] != null) {
    const r = normalizeRoleItem(c.roles[0]);
    if (r) return r;
  }
  if (Array.isArray(c.authorities) && c.authorities[0] != null) {
    const r = normalizeRoleItem(c.authorities[0]);
    if (r) return r;
  }
  const nested = c.user ?? c.result ?? c.data;
  if (nested && typeof nested === "object")
    return getRoleFromContainer(nested as LoginResponseContainer);
  return undefined;
}

/** 從登入回應取出使用者 id（與後端 GET /users/:id 之 id 一致），供前端判斷是否為「編輯自己」 */
function getUserIdFromContainer(c: LoginResponseContainer): string | undefined {
  if (c.id !== undefined && c.id !== null) return String(c.id);
  const nested = c.user ?? c.result ?? c.data;
  if (nested && typeof nested === "object")
    return getUserIdFromContainer(nested as LoginResponseContainer);
  return undefined;
}

/**
 * 將單一權限項目轉成字串（支援後端回傳字串或 { authority: "ROLE_xxx" } 物件，常見於 Spring Security）
 */
function normalizeRoleItem(r: unknown): string {
  if (r == null) return "";
  if (typeof r === "string") return r.trim();
  if (typeof r === "object" && r !== null && "authority" in r) {
    const a = (r as { authority?: unknown }).authority;
    return a != null ? String(a).trim() : "";
  }
  return String(r).trim();
}

/** 從登入回應取出 roles + authorities + roleNames（完整權限：ROLE_ADMIN, ROLE_SUPER_ADMIN, admin:manage …），供 RBAC 與 hasAuthority */
function getRolesFromContainer(c: LoginResponseContainer): string[] {
  // 從當前層與巢狀層收集所有可能的 roles/authorities/roleNames，避免因後端放在 data.user.roles 等而漏讀
  const collect = (obj: LoginResponseContainer | null | undefined): unknown[] => {
    if (!obj || typeof obj !== "object") return [];
    const roles = Array.isArray(obj.roles) ? obj.roles : [];
    const auth = Array.isArray(obj.authorities) ? obj.authorities : [];
    const names = Array.isArray(obj.roleNames) ? obj.roleNames : [];
    const fromNested = [
      (obj as { user?: LoginResponseContainer }).user,
      (obj as { result?: LoginResponseContainer }).result,
      (obj as { data?: LoginResponseContainer }).data,
    ]
      .filter((n): n is LoginResponseContainer => n != null && typeof n === "object")
      .flatMap(collect);
    return [...roles, ...auth, ...names, ...fromNested];
  };

  const raw = collect(c);
  if (raw.length > 0) {
    const normalized = raw.map(normalizeRoleItem).filter(Boolean);
    if (normalized.length > 0) {
      // 去重，避免巢狀收集導致重複（且 hasStoredAuthority 等判斷更一致）
      return [...new Set(normalized)];
    }
  }

  const role = getRoleFromContainer(c);
  if (role) return [role];
  const nested = c.user ?? c.result ?? c.data;
  if (nested && typeof nested === "object")
    return getRolesFromContainer(nested as LoginResponseContainer);
  return [];
}

/**
 * 從多種後端格式取出含 token 的物件（data / result / user / 頂層），
 * 亦支援直接回傳 JwtResponse。
 */
function getEffectiveContainer(
  raw:
    | LoginSuccessResponseWrapped
    | LoginSuccessResponseFlat
    | (Record<string, unknown> & { data?: Record<string, unknown> })
    | LoginSuccess
    | null
): LoginResponseContainer | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const candidates: LoginResponseContainer[] = [
    raw as LoginResponseContainer,
    obj.data as LoginResponseContainer,
    obj.result as LoginResponseContainer,
    obj.user as LoginResponseContainer,
    (obj.data as Record<string, unknown>)?.user as LoginResponseContainer,
    (obj.data as Record<string, unknown>)?.result as LoginResponseContainer,
  ].filter(
    (c): c is LoginResponseContainer => c != null && typeof c === "object"
  );
  for (const c of candidates) {
    if (getTokenFromContainer(c)) return c;
  }
  return raw as LoginResponseContainer;
}

/**
 * 將登入／refresh／MFA 第二階段成功回應寫入 localStorage，集中維護：
 * - token / tokenType
 * - refreshToken / tokenExpiresAt
 * - username / role / userId / authRoles
 * @param mfaEnabled - 若為 true（例如剛完成 MFA 驗證登入），會寫入提示供個人資料頁顯示「MFA 已啟用」
 */
export function applyLoginSuccessFromContainer(
  container: LoginResponseContainer,
  usernameForDisplay?: string,
  mfaEnabled?: boolean
): void {
  clearProfileCache(); // 登入成功後清除個人資料快取，避免沿用上一帳號或舊的 mfaEnabled 狀態
  const token = getTokenFromContainer(container);
  if (!token) {
    throw new Error(
      "登入回應格式錯誤：後端未回傳 token / accessToken，請確認 API 回傳格式（開發時請看主控台 🔐 Login response raw）"
    );
  }

  const type = getTypeFromContainer(container);
  const usernameFromPayload = getUsernameFromContainer(container);
  const roleFromPayload = getRoleFromContainer(container);
  const userIdFromPayload = getUserIdFromContainer(container);
  const rolesFromPayload = getRolesFromContainer(container);

  /** 後端未回傳使用者名稱時，以表單輸入的帳號為後備，確保 getIdentity 有值 */
  const displayName = usernameFromPayload || usernameForDisplay || "";

  localStorage.setItem("token", token);
  localStorage.setItem("tokenType", type);
  if (displayName) localStorage.setItem("username", displayName);
  if (roleFromPayload) localStorage.setItem("role", roleFromPayload);
  if (userIdFromPayload) localStorage.setItem("userId", userIdFromPayload);

  // 一律覆寫 authRoles，避免沿用上一使用者（如管理員）的權限導致 ROLE_USER 仍看到編輯/刪除按鈕
  const rolesToStore =
    rolesFromPayload.length > 0
      ? rolesFromPayload
      : roleFromPayload
        ? [roleFromPayload]
        : ["ROLE_USER"];
  localStorage.setItem("authRoles", JSON.stringify(rolesToStore));

  // Refresh Token 與過期時間（秒數 → 絕對時間戳，留 10 秒緩衝）
  const refreshToken = getString(
    (container as { refreshToken?: unknown }).refreshToken
  );
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }

  const expiresInRaw = (container as { expiresIn?: unknown }).expiresIn;
  if (
    typeof expiresInRaw === "number" &&
    Number.isFinite(expiresInRaw) &&
    expiresInRaw > 0
  ) {
    const expiresAt = Date.now() + expiresInRaw * 1000;
    localStorage.setItem("tokenExpiresAt", String(expiresAt));
  } else {
    localStorage.removeItem("tokenExpiresAt");
  }

  if (mfaEnabled) {
    localStorage.setItem("mfaEnabled", "true");
  }
}

/* ========================================================
 * AuthProvider 實作
 * ======================================================== */
export const authProvider: AuthProvider = {
  login: async ({ username, password }: LoginParams) => {
    const apiUrl = getApiUrl();
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
      // 500 系列錯誤：統一顯示泛用訊息，不依賴後端 message
      if (response.status >= 500) {
        throw new Error("系統發生錯誤，請稍後再試或聯絡系統管理員");
      }

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
      | LoginSuccess
      | null;

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("🔐 Login response raw:", json);
    }

    // 先處理後端新登入流程：若 mfaRequired === true，代表需進入 MFA 第二階段（不寫入 token）。
    const topLevel = json as
      | (LoginSuccess & Record<string, unknown>)
      | (Record<string, unknown> & { data?: unknown })
      | null;

    const dataLevel =
      topLevel &&
      typeof topLevel === "object" &&
      "data" in topLevel &&
      (topLevel as { data?: unknown }).data &&
      typeof (topLevel as { data?: unknown }).data === "object"
        ? ((topLevel as { data?: unknown }).data as LoginSuccess &
            Record<string, unknown>)
        : null;

    const mfaContainer =
      (dataLevel &&
        (dataLevel as { mfaRequired?: unknown }).mfaRequired === true &&
        dataLevel) ||
      (topLevel &&
        (topLevel as { mfaRequired?: unknown }).mfaRequired === true &&
        (topLevel as LoginSuccess & Record<string, unknown>)) ||
      null;

    if (mfaContainer && (mfaContainer as { mfaRequired: true }).mfaRequired) {
      const pendingToken = getString(
        (mfaContainer as { pendingToken?: unknown }).pendingToken
      );
      if (!pendingToken) {
        throw new Error(
          "登入回應格式錯誤：缺少 MFA pendingToken，請聯絡系統管理員"
        );
      }

      // MFA 登入第一階段：不寫入 token，僅暫存 pendingToken 供 MFA 驗證頁使用
      clearAuthStorage();
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem("mfa_pending_token", pendingToken);
        if (username) {
          // 供 MFA 頁面顯示「正在為誰驗證」等提示
          sessionStorage.setItem("mfa_username", username);
        }
      }

      const mfaError = new Error("MFA_REQUIRED") as Error & {
        code?: string;
      };
      mfaError.code = "MFA_REQUIRED";
      throw mfaError;
    }

    const container = getEffectiveContainer(json);
    if (!container) {
      throw new Error("登入回應格式錯誤，請聯絡系統管理員");
    }

    applyLoginSuccessFromContainer(container, username);
  },

  logout: async () => {
    const apiUrl = getApiUrl();
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

  /** RBAC：回傳完整 roles 陣列（ROLE_* + 細部權限如 user:edit），供 hasAuthority / 選單過濾；無則 fallback 單一 role */
  getPermissions: () => {
    try {
      const stored = localStorage.getItem("authRoles");
      if (stored) {
        const parsed = JSON.parse(stored) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0)
          return Promise.resolve(parsed as string[]);
      }
    } catch {
      // ignore
    }
    const role = localStorage.getItem("role");
    return Promise.resolve(role ? [role] : ["ROLE_USER"]);
  },

  /**
   * 401：未授權／token 無效 → 清除會話並導向登入，並設標記供登入頁顯示「登入逾期或已登出」。
   * 403：已登入但無此資源權限 → 僅 reject，不清 token、不導向登入。
   */
  checkError: (error: unknown) => {
    const status = (error as { status?: number })?.status;
    if (status === 401) {
      forceLogoutAndRedirect();
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
    /** 優先使用後端回傳的使用者 id，供使用者管理「是否編輯自己」等判斷；無則 fallback 為 username */
    const id = localStorage.getItem("userId") || username;
    return Promise.resolve({ id, fullName: username });
  },
};

import type { RaRecord } from "react-admin";
import i18n from "@/i18n/i18n";

export type ParsedAuditDetails = {
  handler?: string;
  durationMs?: number;
  httpStatus?: number | string;
  requestId?: string;
  ctx?: Record<string, unknown>;
};

export const ACTION_LABELS: Record<string, string> = {
  CREATE: "建立",
  UPDATE: "更新",
  DELETE: "刪除",
  PATCH: "部分更新",
  EXPORT: "匯出",
  LOGIN: "登入",
  LOGOUT: "登出",
  VOID: "作廢",
};

const ACTION_LABELS_EN: Record<string, string> = {
  CREATE: "Create",
  UPDATE: "Update",
  DELETE: "Delete",
  PATCH: "Partial update",
  EXPORT: "Export",
  LOGIN: "Login",
  LOGOUT: "Logout",
  VOID: "Void",
};

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  AUTH: "身分驗證",
  EMPLOYEES: "員工",
  USERS: "使用者",
  ROLES: "角色",
  PERMISSIONS: "權限",
  NOTIFICATIONS: "通知",
  GLOBAL_SEARCH: "全域搜尋",
  DASHBOARD: "儀表板",
  SUPPLIERS: "廠商名單",
  PRODUCTS: "產品",
  PRODUCT_CATEGORIES: "產品分類",
  EXPENSES: "費用",
  EXPENSE_CATEGORIES: "費用類別",
  ORDERS: "訂單",
  ORDER_CUSTOMERS: "訂單客戶",
  ORDER_ITEMS: "訂單明細",
  PURCHASES: "進貨列表",
  PURCHASE_ITEMS: "採購明細",
  PAYMENTS: "付款紀錄",
  RECEIPTS: "收款紀錄",
  SALES: "銷售紀錄",
  AP: "應付帳款",
  AR: "應收帳款",
  REPORTS: "財務報表",
  ADMIN: "系統活動",
};

const RESOURCE_TYPE_LABELS_EN: Record<string, string> = {
  AUTH: "Authentication",
  EMPLOYEES: "Employees",
  USERS: "Users",
  ROLES: "Roles",
  PERMISSIONS: "Permissions",
  NOTIFICATIONS: "Notifications",
  GLOBAL_SEARCH: "Global search",
  DASHBOARD: "Dashboard",
  SUPPLIERS: "Suppliers",
  PRODUCTS: "Products",
  PRODUCT_CATEGORIES: "Product categories",
  EXPENSES: "Expenses",
  EXPENSE_CATEGORIES: "Expense categories",
  ORDERS: "Orders",
  ORDER_CUSTOMERS: "Order customers",
  ORDER_ITEMS: "Order items",
  PURCHASES: "Purchases",
  PURCHASE_ITEMS: "Purchase items",
  PAYMENTS: "Payments",
  RECEIPTS: "Receipts",
  SALES: "Sales",
  AP: "Accounts payable",
  AR: "Accounts receivable",
  REPORTS: "Financial reports",
  ADMIN: "System activity",
};

function normalizeCode(code: unknown): string {
  return code == null ? "" : String(code).trim().toUpperCase();
}

export function getActionLabel(actionCode: unknown): string {
  const k = normalizeCode(actionCode);
  const isEn = i18n.language === "en";
  return (isEn ? ACTION_LABELS_EN : ACTION_LABELS)[k] ?? (k ? k : "—");
}

export function getResourceTypeLabel(resourceTypeCode: unknown): string {
  const k = normalizeCode(resourceTypeCode);
  const isEn = i18n.language === "en";
  return (isEn ? RESOURCE_TYPE_LABELS_EN : RESOURCE_TYPE_LABELS)[k] ?? (k ? k : "—");
}

const HTTP_METHOD_ZH: Record<string, string> = {
  GET: "讀取",
  POST: "建立",
  PUT: "更新",
  PATCH: "部分更新",
  DELETE: "刪除",
  HEAD: "檢查",
  OPTIONS: "選項",
};

const HTTP_METHOD_EN: Record<string, string> = {
  GET: "Read",
  POST: "Create",
  PUT: "Update",
  PATCH: "Partial update",
  DELETE: "Delete",
  HEAD: "Check",
  OPTIONS: "Options",
};

/**
 * HTTP 方法中文語意（列表／摘要用）；無資料時為「—」。
 */
export function getHttpMethodLabel(httpMethod: unknown): string {
  const m =
    httpMethod == null || httpMethod === ""
      ? ""
      : String(httpMethod).trim().toUpperCase();
  if (!m) return "—";
  const isEn = i18n.language === "en";
  return (isEn ? HTTP_METHOD_EN : HTTP_METHOD_ZH)[m] ?? m;
}

/**
 * 明細 Chip：請求方式：讀取（GET）；未知方法僅顯示代碼。
 */
export function getHttpMethodChipLabel(httpMethod: unknown): string {
  const m =
    httpMethod == null || httpMethod === ""
      ? ""
      : String(httpMethod).trim().toUpperCase();
  const isEn = i18n.language === "en";
  const prefix = isEn ? "Request method: " : "請求方式：";
  if (!m) return `${prefix}—`;

  const display = getHttpMethodLabel(m);
  if (display === "—") return `${prefix}—`;

  if (display === m) return `${prefix}${m}`;
  return isEn
    ? `${prefix}${display} (${m})`
    : `${prefix}${display}（${m}）`;
}

/**
 * 列表欄位：讀取（GET）；無資料為「—」。
 */
export function getHttpMethodListDisplay(httpMethod: unknown): string {
  const m =
    httpMethod == null || httpMethod === ""
      ? ""
      : String(httpMethod).trim().toUpperCase();
  if (!m) return "—";
  const isEn = i18n.language === "en";
  const display = getHttpMethodLabel(m);
  if (display === "—") return "—";
  if (display === m) return m;
  return isEn ? `${display} (${m})` : `${display}（${m}）`;
}

export function safeParseDetails(details: unknown): ParsedAuditDetails | null {
  if (details == null || details === "") return null;

  if (typeof details === "object") {
    return details as ParsedAuditDetails;
  }

  if (typeof details !== "string") {
    const s = String(details);
    if (!s.trim()) return null;
    try {
      const parsed = JSON.parse(s) as ParsedAuditDetails;
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }

  try {
    const parsed = JSON.parse(details) as ParsedAuditDetails;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function formatDuration(durationMs: unknown): string {
  if (durationMs == null || durationMs === "") return "—";
  const n = typeof durationMs === "number" ? durationMs : Number(String(durationMs));
  if (!Number.isFinite(n)) return "—";
  if (n < 1000) return `${Math.round(n)} 毫秒`;
  const seconds = n / 1000;
  return `${seconds.toFixed(n < 10_000 ? 2 : 1)} 秒`;
}

export function getStatusColor(
  httpStatus: unknown
): "success" | "warning" | "error" | "info" | "default" {
  const n = httpStatus == null || httpStatus === "" ? undefined : Number(String(httpStatus));
  if (n == null || !Number.isFinite(n)) return "default";
  if (n >= 200 && n < 300) return "success";
  if (n >= 300 && n < 400) return "info";
  if (n >= 400 && n < 500) return "warning";
  return "error";
}

export function getHttpStatusTooltip(httpStatus: unknown): string {
  const n =
    httpStatus == null || httpStatus === ""
      ? undefined
      : Number(String(httpStatus));
  if (n == null || !Number.isFinite(n)) return "未記錄回應狀態碼";

  if (n >= 200 && n < 300) return `${n}：成功（200-299）`;
  if (n >= 300 && n < 400) return `${n}：重新導向/導流（300-399）`;
  if (n >= 400 && n < 500) return `${n}：請求錯誤（400-499）`;
  if (n >= 500 && n < 600) return `${n}：伺服器錯誤（500-599）`;
  return `${n}：未知狀態`;
}

export function getHttpStatusChipLabel(httpStatus: unknown): string {
  const n =
    httpStatus == null || httpStatus === ""
      ? undefined
      : Number(String(httpStatus));
  if (n == null || !Number.isFinite(n)) return "未記錄";
  if (n >= 200 && n < 300) return `成功（${n}）`;
  if (n >= 300 && n < 400) return `重導/導流（${n}）`;
  if (n >= 400 && n < 500) return `請求失敗（${n}）`;
  if (n >= 500 && n < 600) return `伺服器錯誤（${n}）`;
  return `未知（${n}）`;
}

export function getHttpStatusResultText(httpStatus: unknown): string {
  const n =
    httpStatus == null || httpStatus === ""
      ? undefined
      : Number(String(httpStatus));
  if (n == null || !Number.isFinite(n)) return "結果：未記錄";
  if (n >= 200 && n < 300) return "結果：成功";
  if (n >= 300 && n < 400) return "結果：已重導/導流";
  if (n >= 400 && n < 500) return "結果：請求失敗";
  if (n >= 500 && n < 600) return "結果：伺服器錯誤";
  return `結果：未知（${n}）`;
}

export function maskIp(ip: unknown): string {
  if (ip == null || ip === "") return "—";
  const s = String(ip).trim();
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) {
    const parts = s.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.${parts[3]}`;
  }
  // IPv6 or others: show prefix only
  if (s.length > 8) return `${s.slice(0, 4)}****${s.slice(-2)}`;
  return `${s[0]}***${s[s.length - 1] ?? ""}`;
}

export function maskSensitiveQueryString(queryString: unknown, maxLen = 180): string {
  if (queryString == null || queryString === "") return "—";
  const raw = String(queryString);
  const shouldMask = /(token|password|secret|authorization|api[_-]?key|access[_-]?token|bearer)/i.test(raw);
  if (!shouldMask) return raw.length > maxLen ? `${raw.slice(0, maxLen)}…` : raw;

  const parts = raw.split("&").map((p) => {
    const [k, ...rest] = p.split("=");
    const key = k ?? "";
    const value = rest.join("=") ?? "";
    const keyUpper = key.toUpperCase();
    if (/(TOKEN|PASSWORD|SECRET|AUTHORIZATION|API[-_]?KEY|ACCESS[-_]?TOKEN|BEARER)/i.test(keyUpper)) {
      return `${key}=***`;
    }
    return rest.length ? `${key}=${value}` : p;
  });

  const masked = parts.join("&");
  return masked.length > maxLen ? `${masked.slice(0, maxLen)}…` : masked;
}

export function formatDetailsPretty(details: unknown): string {
  if (details == null || details === "") return "";
  if (typeof details === "object") return JSON.stringify(details, null, 2);
  try {
    const s = String(details);
    return JSON.stringify(JSON.parse(s), null, 2);
  } catch {
    return String(details);
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatOccurredAtUTC(v: unknown): string {
  if (v == null || v === "") return "—";
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) return String(v);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
}

export function summarizeCtx(ctx: unknown): string {
  if (!ctx || typeof ctx !== "object") return "";
  const entries = Object.entries(ctx as Record<string, unknown>).slice(0, 3);
  if (!entries.length) return "";
  return entries
    .map(([k, v]) => {
      const vs = v == null ? "" : typeof v === "string" ? v : JSON.stringify(v);
      const trimmed = vs.length > 26 ? `${vs.slice(0, 26)}…` : vs;
      return `${k}=${trimmed || "—"}`;
    })
    .filter(Boolean)
    .join(", ");
}

export function getOperatorDisplay(record: RaRecord, parsed: ParsedAuditDetails | null): string {
  const ctx = parsed?.ctx ?? {};
  const candidates: Array<unknown> = [
    (ctx as Record<string, unknown>).operatorAccount,
    (ctx as Record<string, unknown>).operatorUsername,
    (ctx as Record<string, unknown>).username,
    (ctx as Record<string, unknown>).userName,
    (ctx as Record<string, unknown>).operatorName,
    (ctx as Record<string, unknown>).fullName,
    (ctx as Record<string, unknown>).name,
    (record as Record<string, unknown>).operatorUsername,
    (record as Record<string, unknown>).operatorName,
    (record as Record<string, unknown>).operatorFullName,
    (record as Record<string, unknown>).username,
    (record as Record<string, unknown>).fullName,
  ];

  for (const c of candidates) {
    if (c == null) continue;
    const s = String(c).trim();
    if (s) return s;
  }

  if (record.operatorId != null) return `User #${String(record.operatorId)}`;
  return "—";
}


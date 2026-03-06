import { EDIT_PERMISSION_BY_RESOURCE } from "@/constants/permissionConfig";

/** 後端 RBAC：具此權限或角色者可管理其他管理員（編輯/刪除/角色選項） */
const ADMIN_MANAGE_AUTHORITIES = ["admin:manage", "ROLE_SUPER_ADMIN"];

/**
 * 直接從 localStorage.authRoles 讀取權限陣列，供按鈕顯示邏輯使用。
 * 登入時由 authProvider 寫入，不依賴 React Admin usePermissions 快取，確保依角色正確隱藏按鈕。
 */
export function getStoredAuthRoles(): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const stored = localStorage.getItem("authRoles");
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed)
      ? (parsed as string[]).map((r) => String(r).trim())
      : [];
  } catch {
    return [];
  }
}

export function hasStoredAuthority(roles: string[], authority: string): boolean {
  if (!authority || !Array.isArray(roles)) return false;
  const want = authority.trim();
  return roles.some((r) => String(r).trim() === want);
}

/**
 * 當前使用者是否具「管理員」角色（ROLE_ADMIN 或 ROLE_SUPER_ADMIN）。
 * 用於：篩選列、狀態切換、匯出按鈕等需與「系統管理員」同等權限的判斷；超級管理員應一併視為管理員。
 * @param roles - 若不傳則使用 getStoredAuthRoles()
 */
export function hasRoleAdmin(roles?: string[]): boolean {
  const r = roles ?? getStoredAuthRoles();
  return r.some((x) => x === "ROLE_ADMIN" || x === "ROLE_SUPER_ADMIN");
}

/**
 * 當前使用者是否具「管理其他管理員」權限（ROLE_SUPER_ADMIN 或 admin:manage）。
 * 用於：使用者列表僅超級管理員可顯示編輯/刪除管理員列、建立/編輯使用者時是否顯示管理員角色選項。
 */
export function canManageAdmin(): boolean {
  const roles = getStoredAuthRoles();
  return ADMIN_MANAGE_AUTHORITIES.some((a) => hasStoredAuthority(roles, a));
}

/** 將單一角色項轉成字串（支援字串或 { authority: "ROLE_xxx" }，與 authProvider 一致） */
function normalizeRecordRoleItem(r: unknown): string {
  if (r == null) return "";
  if (typeof r === "string") return r.trim();
  if (typeof r === "object" && r !== null && "authority" in r) {
    const a = (r as { authority?: unknown }).authority;
    return a != null ? String(a).trim() : "";
  }
  return String(r).trim();
}

/**
 * 判斷某筆使用者資料是否為管理員（ROLE_ADMIN 或 ROLE_SUPER_ADMIN）。
 * @param record - 列表/編輯中的使用者，可有 roles 或 roleNames（後端可能回傳字串或 { authority: "ROLE_xxx" }）
 */
export function isUserRecordAdmin(record: { roles?: unknown; roleNames?: unknown } | null): boolean {
  if (!record) return false;
  const rawList = Array.isArray(record.roles)
    ? record.roles
    : Array.isArray(record.roleNames)
      ? record.roleNames
      : typeof record.roles === "string"
        ? [record.roles]
        : typeof record.roleNames === "string"
          ? [record.roleNames]
          : [];
  const list = rawList.map(normalizeRecordRoleItem).filter(Boolean);
  return list.some(
    (r) => r === "ROLE_ADMIN" || r === "ROLE_SUPER_ADMIN"
  );
}

/**
 * 目前使用者是否對該資源有「編輯」權限（ROLE_ADMIN / ROLE_SUPER_ADMIN 或對應 :edit）。
 * 用於列表點擊列時是否導向編輯頁；無權限時應不導向編輯。
 * 使用者資源的「能否編輯某一行」需在列表依目標是否為管理員 + canManageAdmin() 判斷。
 */
export function canEditResource(resource: string | undefined): boolean {
  const roles = getStoredAuthRoles();
  const isUsers =
    resource === "users" || resource === "user" || resource == null;
  if (isUsers) return hasRoleAdmin(roles) || hasStoredAuthority(roles, "user:edit");
  if (!resource) return hasRoleAdmin(roles);

  const requiredEdit = EDIT_PERMISSION_BY_RESOURCE[resource];
  return (
    hasRoleAdmin(roles) ||
    (requiredEdit ? hasStoredAuthority(roles, requiredEdit) : false)
  );
}

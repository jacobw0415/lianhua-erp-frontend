import { EDIT_PERMISSION_BY_RESOURCE } from "@/constants/permissionConfig";

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
 * 目前使用者是否對該資源有「編輯」權限（ROLE_ADMIN 或對應 :edit）。
 * 用於列表點擊列時是否導向編輯頁；無權限時應不導向編輯。
 */
export function canEditResource(resource: string | undefined): boolean {
  const roles = getStoredAuthRoles();
  const hasRoleAdmin = roles.some((r) => r === "ROLE_ADMIN");
  const isUsers =
    resource === "users" || resource === "user" || resource == null;
  if (isUsers) return hasRoleAdmin;
  if (!resource) return hasRoleAdmin;

  const requiredEdit = EDIT_PERMISSION_BY_RESOURCE[resource];
  return (
    hasRoleAdmin ||
    (requiredEdit ? hasStoredAuthority(roles, requiredEdit) : false)
  );
}

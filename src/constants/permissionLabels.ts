/**
 * 權限代碼 → 中文顯示名稱對照（角色與權限列表／編輯用）
 * 後端若新增權限，在此補上對應中文即可。
 */
export const permissionLabels: Record<string, string> = {
  // 採購
  "purchase:view": "採購檢視",
  "purchase:void": "採購作廢",
  "purchase:write": "採購維護",
  // 銷貨
  "sale:view": "銷貨檢視",
  "sale:void": "銷貨作廢",
  "sale:write": "銷貨維護",
  // 使用者／角色（與 RoleEdit 權限矩陣對齊）
  USER_READ: "使用者檢視",
  USER_WRITE: "使用者維護",
  ROLE_READ: "角色檢視",
  ROLE_WRITE: "角色維護",
};

/**
 * 取得權限的中文顯示名稱；未對應時回傳原代碼
 */
export function getPermissionLabel(code: string): string {
  if (!code || typeof code !== "string") return "-";
  const trimmed = code.trim();
  return permissionLabels[trimmed] ?? trimmed;
}

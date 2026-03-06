export const USER_ROLE_CHOICES = [
  { id: "ROLE_SUPER_ADMIN", name: "超級管理員" },
  { id: "ROLE_ADMIN", name: "系統管理員" },
  { id: "ROLE_USER", name: "一般使用者" },
];

/** 角色代碼 → 中文顯示名稱（個人資料、選單等處顯示用） */
export const ROLE_LABELS: Record<string, string> = {
  ROLE_SUPER_ADMIN: "超級管理員",
  ROLE_ADMIN: "系統管理員",
  ROLE_USER: "一般使用者",
  ADMIN: "系統管理員",
  USER: "一般使用者",
};

export function getRoleDisplayName(code: string): string {
  if (!code || typeof code !== "string") return "";
  return ROLE_LABELS[code.trim()] ?? code;
}

/** 管理員角色（僅具 admin:manage / ROLE_SUPER_ADMIN 者可指派） */
const ADMIN_ROLE_IDS = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"];

/**
 * 依當前使用者是否可管理管理員，回傳表單可選的角色選項。
 * 無 admin:manage 時只回傳 ROLE_USER，避免一般管理員誤選管理員角色。
 */
export function getRoleChoicesForUserForm(canManageAdmin: boolean): { id: string; name: string }[] {
  if (canManageAdmin) return [...USER_ROLE_CHOICES];
  return USER_ROLE_CHOICES.filter((c) => !ADMIN_ROLE_IDS.includes(c.id));
}


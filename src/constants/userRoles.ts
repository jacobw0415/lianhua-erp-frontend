export const USER_ROLE_CHOICES = [
  { id: "ROLE_ADMIN", name: "系統管理員" },
  { id: "ROLE_USER", name: "一般使用者" },
];

/** 角色代碼 → 中文顯示名稱（個人資料、選單等處顯示用） */
export const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "系統管理員",
  ROLE_USER: "一般使用者",
  ADMIN: "系統管理員",
  USER: "一般使用者",
};

export function getRoleDisplayName(code: string): string {
  if (!code || typeof code !== "string") return "";
  return ROLE_LABELS[code.trim()] ?? code;
}


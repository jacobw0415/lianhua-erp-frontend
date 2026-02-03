/**
 * 成本結構區塊存取權限：僅限 OWNER 與 MANAGER 角色。
 * 規格：Lianhua ERP v3.0 儀表板介接規格 - 模組分組與權限定義。
 *
 * 未接權限時：預設 true（開發用）。接上 useAuth / getIdentity 後改為讀取 user.role。
 */
const COST_STRUCTURE_ROLES = ['OWNER', 'MANAGER'] as const;
const STORAGE_KEY = 'lianhua_user_role';

export function useCanViewCostStructure(): boolean {
  try {
    const role = localStorage.getItem(STORAGE_KEY);
    if (role == null) return true;
    return COST_STRUCTURE_ROLES.includes(role.toUpperCase() as (typeof COST_STRUCTURE_ROLES)[number]);
  } catch {
    return true;
  }
}

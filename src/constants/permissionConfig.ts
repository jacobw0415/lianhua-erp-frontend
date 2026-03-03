/** 
 * 資源名稱 ↔ 權限代碼 對照表
 * 用於前端 RBAC（按鈕顯示、rowClick、狀態切換等），需與後端 @PreAuthorize 一致。
 */

/** 編輯權限（影響：列表編輯按鈕、點擊列進入編輯、狀態切換等） */
export const EDIT_PERMISSION_BY_RESOURCE: Record<string, string> = {
  users: "user:edit",
  orders: "order:edit",
  products: "product:edit",
  purchases: "purchase:edit",
  sales: "sale:edit",
  employees: "employee:edit",
  suppliers: "supplier:edit",
  order_customers: "order_customer:edit",
  product_categories: "product_category:edit",
  expense_categories: "expense_category:edit",
};

/** 刪除權限（影響：列表刪除按鈕） */
export const DELETE_PERMISSION_BY_RESOURCE: Record<string, string> = {
  users: "user:delete",
  orders: "order:delete",
  products: "product:delete",
  purchases: "purchase:delete",
  sales: "sale:delete",
  employees: "employee:delete",
  suppliers: "supplier:delete",
  order_customers: "order_customer:delete",
  product_categories: "product_category:delete",
  expense_categories: "expense_category:delete",
};

/** 新增權限（影響：列表上方「新增資料」按鈕） */
export const CREATE_PERMISSION_BY_RESOURCE: Record<string, string> = {
  suppliers: "supplier:create",
  purchases: "purchase:create",
  payments: "payment:create",
  product_categories: "product_category:create",
  products: "product:create",
  sales: "sale:create",
  order_customers: "order_customer:create",
  orders: "order:create",
  receipts: "receipt:create",
  expense_categories: "expense_category:create",
  expenses: "expense:create",
  employees: "employee:create",
  users: "user:create",
};

/**
 * 匯出權限（影響：列表上方「匯出」按鈕）
 * - 目前預設僅 ROLE_ADMIN 可匯出，如需開放給特定角色，請在此對應 xxx:export 權限，
 *   並由後端在 roles 中回傳相同代碼。
 */
export const EXPORT_PERMISSION_BY_RESOURCE: Record<string, string> = {
  // 例如：
  // suppliers: "supplier:export",
};


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
  // 員工 CRUD 與啟用/停用使用 user:edit
  employees: "user:edit",
  suppliers: "supplier:edit",
  // 客戶 CRUD 使用 order:edit
  order_customers: "order:edit",
  // 商品/費用分類 CRUD 使用對應主模組的 edit 權限
  product_categories: "product:edit",
  expense_categories: "expense:edit",
};

/** 刪除權限（影響：列表刪除按鈕） */
export const DELETE_PERMISSION_BY_RESOURCE: Record<string, string> = {
  users: "user:delete",
  orders: "order:delete",
  products: "product:delete",
  purchases: "purchase:delete",
  sales: "sale:delete",
  // 員工刪除使用 user:edit（後端未拆出 employee:delete）
  employees: "user:edit",
  suppliers: "supplier:delete",
  // 客戶刪除使用 order:edit
  order_customers: "order:edit",
  // 商品/費用分類刪除使用對應主模組的 edit
  product_categories: "product:edit",
  expense_categories: "expense:edit",
};

/** 新增權限（影響：列表上方「新增資料」按鈕） */
export const CREATE_PERMISSION_BY_RESOURCE: Record<string, string> = {
  suppliers: "supplier:create",
  purchases: "purchase:create",
  payments: "payment:create",
  // 商品/費用分類新增使用主模組 edit 權限
  product_categories: "product:edit",
  products: "product:create",
  sales: "sale:create",
  // 客戶新增/修改/刪除使用 order:edit
  order_customers: "order:edit",
  orders: "order:create",
  receipts: "receipt:create",
  expense_categories: "expense:edit",
  expenses: "expense:create",
  // 員工新增/修改/刪除統一使用 user:edit
  employees: "user:edit",
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


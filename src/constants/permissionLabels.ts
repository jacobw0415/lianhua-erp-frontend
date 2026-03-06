/**
 * 權限代碼 → 中文顯示名稱對照（角色與權限列表／編輯用）
 * 後端若新增權限，在此補上對應中文即可。
 */
export const permissionLabels: Record<string, string> = {
  // 角色本身
  ROLE_SUPER_ADMIN: "超級管理員",
  ROLE_ADMIN: "系統管理員",
  ROLE_USER: "一般使用者",

  // 管理員管理（僅超級管理員）
  "admin:manage": "管理其他管理員",

  // 採購 (purchase)
  "purchase:view": "採購檢視",
  "purchase:edit": "採購編輯",
  "purchase:void": "採購作廢",
  "purchase:create": "採購新增",
  "purchase:delete": "採購刪除",
  "purchase:write": "採購維護",

  // 銷貨 (sale)
  "sale:view": "銷貨檢視",
  "sale:edit": "銷貨編輯",
  "sale:void": "銷貨作廢",
  "sale:create": "銷貨新增",
  "sale:delete": "銷貨刪除",
  "sale:write": "銷貨維護",

  // 使用者 (user)
  "user:view": "使用者檢視",
  "user:edit": "使用者編輯",
  "user:create": "使用者新增",
  "user:delete": "使用者刪除",
  USER_READ: "使用者檢視",
  USER_WRITE: "使用者維護",

  // 角色 (role)
  "role:view": "角色檢視",
  "role:edit": "角色編輯",
  ROLE_READ: "角色檢視",
  ROLE_WRITE: "角色維護",

  // 商品 (product)
  "product:view": "商品檢視",
  "product:edit": "商品編輯",
  "product:create": "商品新增",
  "product:delete": "商品刪除",

  // 商品分類 (product_category)
  "product_category:view": "商品分類檢視",
  "product_category:edit": "商品分類編輯",
  "product_category:create": "商品分類新增",
  "product_category:delete": "商品分類刪除",

  // 供應商 (supplier)
  "supplier:view": "供應商檢視",
  "supplier:edit": "供應商編輯",
  "supplier:create": "供應商新增",
  "supplier:delete": "供應商刪除",

  // 客戶 (order_customer)
  "order_customer:view": "客戶檢視",
  "order_customer:edit": "客戶編輯",
  "order_customer:create": "客戶新增",
  "order_customer:delete": "客戶刪除",

  // 訂單 (order)
  "order:view": "訂單檢視",
  "order:edit": "訂單編輯",
  "order:create": "訂單新增",
  "order:delete": "訂單刪除",

  // 支出 / 費用 (expense)
  "expense:view": "支出檢視",
  "expense:edit": "支出編輯",
  "expense:create": "支出新增",
  "expense:delete": "支出刪除",
  "expense:void": "支出作廢",

  // 費用分類 (expense_category)
  "expense_category:view": "費用分類檢視",
  "expense_category:edit": "費用分類編輯",
  "expense_category:create": "費用分類新增",
  "expense_category:delete": "費用分類刪除",

  // 員工 (employee)
  "employee:view": "員工檢視",
  "employee:edit": "員工編輯",
  "employee:create": "員工新增",
  "employee:delete": "員工刪除",

  // 付款單 (payment)
  "payment:view": "付款檢視",
  "payment:create": "付款新增",
  "payment:edit": "付款編輯",
  "payment:delete": "付款刪除",
  "payment:void": "付款作廢",

  // 收款單 (receipt)
  "receipt:view": "收款檢視",
  "receipt:create": "收款新增",
  "receipt:edit": "收款編輯",
  "receipt:delete": "收款刪除",
  "receipt:void": "收款作廢",

  // 應付 / 應收 / 帳款總覽
  "ap:view": "應付帳款檢視",
  "ar:view": "應收帳款檢視",

  // 儀表板與報表
  "dashboard:view": "儀表板檢視",
  "report:view": "報表檢視",

  // 通知中心
  "notification:view": "通知檢視",
};

/**
 * 取得權限的中文顯示名稱；未對應時回傳原代碼
 */
export function getPermissionLabel(code: string): string {
  if (!code || typeof code !== "string") return "-";
  const trimmed = code.trim();
  return permissionLabels[trimmed] ?? trimmed;
}

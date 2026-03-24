/**
 * 後端匯出欄位參數策略：
 * - true: 送出 `columns=...`
 * - false: 不送出 `columns`
 */
const backendSendColumnsPolicy: Record<string, boolean> = {
  // 新版 API 規格未要求 columns query
  ar: false,
  purchases: false,
  receipts: false,
  suppliers: false,
};

/** 取得 resource 的 columns 傳送策略（未設定時預設 true） */
export function shouldSendBackendExportColumns(resource: string): boolean {
  if (!resource) return true;
  return backendSendColumnsPolicy[resource] ?? true;
}


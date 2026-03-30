/**
 * 集中管理瀏覽器主控台輸出：
 * - `logger.*`：僅開發環境，避免正式環境 F12 被除錯訊息洗版。
 * - `logError`：正式環境仍會記錄，供未預期錯誤或日後接上監控（Sentry 等）。
 */
const isDev = import.meta.env.DEV;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  /** 已在使用者介面提示的錯誤、或預期中的失敗（僅開發環境詳記） */
  devError: (...args: unknown[]) => {
    if (isDev) console.error(...args);
  },
};

/** 邊界捕捉、認證刷新失敗、解析異常等：維運仍須可追溯 */
export function logError(...args: unknown[]): void {
  console.error(...args);
}

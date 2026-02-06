/**
 * 後端 API 基底網址。
 * - 開發模式：一律使用「同源 /api」，由 Vite devServer 代理到後端，無 CORS 問題
 *   （不受 .env 的 VITE_API_URL 影響，本機與區網 10.18.2.103:5173 皆可登入）。
 * - 正式環境：使用 VITE_API_URL，未設定則 fallback http://localhost:8080/api。
 */
export function getApiUrl(): string {
  if (import.meta.env.DEV && typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:8080/api";
}

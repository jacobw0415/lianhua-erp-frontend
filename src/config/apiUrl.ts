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

/**
 * 後端 WebSocket 端點（STOMP over SockJS）。
 * - 後端實際端點為 /ws（非 /api/ws），SecurityConfig 也放行 /ws/**。
 * - 前端一律使用同源相對路徑 /ws，由 Vite devServer 或反向代理轉發至後端。
 * - SockJS 期待的是 http(s) URL，因此這裡回傳的是相對 HTTP 路徑，而非 ws://。
 */
export function getWsUrl(): string {
  return "/ws";
}

/**
 * 登出時清除 React Query 快取，避免儀表板等查詢在 token 清除後仍 refetch 導致一排 HttpError2。
 * QueryClient 由已登入時的 Layout 內元件註冊，authProvider 登出／401 時呼叫 clearAppCache()。
 */
import type { QueryClient } from "@tanstack/react-query";

let queryClientRef: QueryClient | null = null;

export function setQueryClientRef(client: QueryClient | null): void {
  queryClientRef = client;
}

export function clearAppCache(): void {
  if (queryClientRef) {
    try {
      queryClientRef.clear();
    } catch {
      // ignore
    }
  }
}

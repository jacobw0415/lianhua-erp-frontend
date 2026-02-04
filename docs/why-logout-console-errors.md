# 為什麼登出後會刷出一排 F12 錯誤（HttpError2 / useDashboardAnalytics）

## 一、現象

- 登出後畫面已跳到登入頁，但主控台出現**一長串** `API ERROR: HttpError2` / `HttpError2`。
- 堆疊指向：`useApiErrorHandler.ts`、`dataProvider.ts` 的 `httpClientSafe`、以及 `useDashboardAnalytics.ts` 的 `queryFn`（多個行號）。

## 二、原因說明

### 1. 登出時 token 先被清掉，但畫面和查詢還沒卸載

- 登出流程：`authProvider.logout()` → 呼叫後端登出 → **clearAuthStorage()**（清掉 token）→ react-admin 再導向 `/login`。
- 在 **clearAuthStorage() 之後、導向登入頁並卸載儀表板之前**，儀表板（Dashboard）仍短暫掛在畫面上。
- 這段時間內，**React Query 的 useDashboardAnalytics / useDashboardStats 等查詢仍存在**，可能因：
  - 定時 refetch（`refetchInterval`）、
  - 視窗重新取得焦點（`refetchOnWindowFocus`）、  
  或  
  - 查詢狀態更新觸發的再次請求，  
  而再次去打 API。

### 2. 請求已無有效 token，後端回 401/403

- 此時 localStorage 的 token 已被清除，**dataProvider 送出的請求沒有合法 token**（或帶到已失效的 token）。
- 後端回 **401 Unauthorized** 或 **403 Forbidden**。
- `fetchUtils.fetchJson` / `httpClientSafe` 收到錯誤回應後拋出 **HttpError2**（或類似封裝）。

### 3. 每個失敗請求都被全域錯誤處理抓到並印出

- 這些錯誤由 **useApiErrorHandler** / **ErrorHandlerContext** 的 **handleApiError** 統一處理。
- 處理時會 **console.error("🔥 API ERROR:", error)**，所以主控台會出現一大排 `API ERROR: HttpError2`。
- 因為儀表板有多個圖表／統計（break-even、liquidity、product-pareto、supplier-concentration…），**每個查詢各失敗一次**，就對應多筆錯誤。

### 4. 小結

- **不是**登入頁自己在打 API，而是 **登出瞬間「儀表板還掛著 + 查詢還在跑」**。
- token 已清、請求失敗 → 每個失敗都被當成 API 錯誤印出來 → 就變成「登出後刷出一排 F12 錯誤」。

## 三、解法：登出時一併清除快取（React Query）

- 在 **logout**（以及收到 **401 要導向登入**）時，**先清除 React Query 的快取**（例如 `queryClient.clear()`）。
- 效果：
  1. 已排程的 refetch、背景查詢會被清掉，**不再用已清掉的 token 去打 API**。
  2. 登入頁顯示後，不會再有一堆儀表板查詢在背景失敗。
  3. 下次登入會重新拉資料，不會用到上一位使用者的快取，較符合安全與預期。

因此：**登出後應加入清除自動快取**（React Query cache + 必要時其他前端快取），才能從根本避免「登出後刷出一排 F12 錯誤」。

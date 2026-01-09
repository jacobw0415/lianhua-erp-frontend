import { useMemo } from "react";
import { useDataProvider } from "react-admin";
// 確保您已安裝 @tanstack/react-query
import { useQuery } from "@tanstack/react-query";

/* =========================================================
 * 型別定義
 * ========================================================= */

/**
 * 對應後端 APSummaryReportDto
 */
export interface APSummaryReportDto {
  accountingPeriod: string; // 會計期間
  totalPayable: number;     // 總應付帳款
  totalPaid: number;        // 已付帳款
  totalOutstanding: number; // 未付餘額
}

export interface APSummaryQueryParams {
  periods?: string[]; // 多月份查詢
  period?: string;    // 單一月份
  endDate?: string;   // 截止日期
}

/* =========================================================
 * 常數設定
 * ========================================================= */

const MAX_PERIODS = 12;   // 限制一次最多查 12 個月
const STALE_TIME = 5 * 60 * 1000; // 5 分鐘內視為資料新鮮 (不重新 fetch)

/* =========================================================
 * Hook: useAPSummaryReport
 * ========================================================= */

export const useAPSummaryReport = (params: APSummaryQueryParams = {}) => {
  const dataProvider = useDataProvider();

  // 1. 建立唯一的 Query Key
  // 當這些參數改變時，React Query 會自動觸發重新查詢
  const queryKey = useMemo(() => {
    const normalizedPeriods =
      params.periods && params.periods.length > 0
        ? [...new Set(params.periods.map((p) => p?.trim()).filter(Boolean))].sort()
        : [];

    const normalizedPeriod = params.period?.trim() || undefined;
    const normalizedEndDate = params.endDate?.trim() || undefined;

    // 只有當有參數時才回傳有效的 key，否則回傳 empty 標記
    if (normalizedPeriods.length === 0 && !normalizedPeriod) {
        return ['apSummary', 'empty'];
    }

    return ['apSummary', { periods: normalizedPeriods, period: normalizedPeriod, endDate: normalizedEndDate }];
  }, [params.period, params.endDate, params.periods]);

  // 2. 使用 React Query
  const queryInfo = useQuery({
    queryKey: queryKey,
    
    // 查詢函數 (fetcher)
    queryFn: async () => {
      // 若 Key 是 empty，直接回傳空陣列
      if (queryKey[1] === 'empty') return [];

      const queryParams: Record<string, string | string[]> = {};

      // --- 驗證邏輯 (保留原有的業務邏輯) ---
      if (params.periods && params.periods.length > 0) {
        const uniquePeriods = [...new Set(params.periods.map((p) => p?.trim()))].filter(Boolean);
        
        if (uniquePeriods.length > MAX_PERIODS) {
          throw new Error(`一次最多查詢 ${MAX_PERIODS} 個月份，請縮小範圍`);
        }

        const periodRegex = /^\d{4}-\d{2}$/;
        uniquePeriods.forEach((p) => {
          if (!periodRegex.test(p)) throw new Error(`月份格式錯誤：${p}`);
        });
        queryParams.periods = uniquePeriods;

      } else if (params.period) {
        const trimmedPeriod = params.period.trim();
        const periodRegex = /^\d{4}-\d{2}$/;
        if (!periodRegex.test(trimmedPeriod)) throw new Error(`月份格式錯誤：${trimmedPeriod}`);
        
        queryParams.period = trimmedPeriod;

        if (params.endDate) {
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(params.endDate)) throw new Error(`截止日期格式錯誤`);
          queryParams.endDate = params.endDate;
        }
      }

      // --- 發送請求 ---
      // API 路徑: reports/ap_summary
      const resourcePath = "reports/ap_summary";
      const response = await dataProvider.get(resourcePath, {
        meta: queryParams,
      });

      // --- 格式化回傳 ---
      let reportData: APSummaryReportDto[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reportData = response.data as APSummaryReportDto[];
        } else if (typeof response.data === "object") {
          reportData = [response.data as APSummaryReportDto];
        }
      }
      return reportData;
    },

    // ★ 關鍵設定：資料快取時間
    staleTime: STALE_TIME, 

    // ★ 關鍵設定：防抖動 (Anti-flicker)
    // 當參數改變導致重新抓取時，保留上一份資料在畫面上，直到新資料回來
    // 這樣 loading 狀態雖然是 true (isFetching)，但 data 會有值，不會顯示骨架屏
    placeholderData: (previousData) => previousData, 

    // 錯誤重試次數
    retry: 1,
    
    // 只有當參數有效時才啟動查詢
    enabled: queryKey[1] !== 'empty',
  });

  return {
    data: queryInfo.data || [],
    // 當有快取資料時，即使正在背景更新，isLoading 也會是 false (這就是我們要的效果)
    // 只有在「完全沒有資料」且「正在載入」時才為 true
    loading: queryInfo.isLoading && !queryInfo.data, 
    // 提供一個更精確的 fetching 狀態給 UI (例如顯示頂部細進度條)
    isFetching: queryInfo.isFetching,
    error: queryInfo.error as Error | null,
    refresh: queryInfo.refetch,
    lastUpdated: queryInfo.dataUpdatedAt ? new Date(queryInfo.dataUpdatedAt) : null,
  };
};
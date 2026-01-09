import { useMemo } from "react";
import { useDataProvider } from "react-admin";
// 確保您已安裝 @tanstack/react-query
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface BalanceSheetReportDto {
  accountingPeriod: string;
  accountsReceivable: number;
  cash: number;
  accountsPayable: number;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
}

export interface BalanceSheetQueryParams {
  periods?: string[]; // 多月份（優先）
  period?: string;    // YYYY-MM（優先）
  endDate?: string;   // yyyy-MM-dd（次選）
}

/* =========================================================
 * 常數設定
 * ========================================================= */

const MAX_PERIODS = 12; // 限制最多查詢 12 個月份
const STALE_TIME = 5 * 60 * 1000; // 5 分鐘內視為資料新鮮

/* =========================================================
 * Hook: useBalanceSheetReport
 * ========================================================= */

export const useBalanceSheetReport = (params: BalanceSheetQueryParams) => {
  const dataProvider = useDataProvider();

  // 1. 建立唯一的 Query Key
  const queryKey = useMemo(() => {
    const normalizedPeriods =
      params.periods && params.periods.length > 0
        ? [...new Set(params.periods.map((p) => p?.trim()).filter(Boolean))].sort()
        : [];

    const normalizedPeriod = params.period?.trim() || undefined;
    const normalizedEndDate = params.endDate?.trim() || undefined;

    // 只有當有參數時才回傳有效的 key，否則回傳 empty 標記
    if (normalizedPeriods.length === 0 && !normalizedPeriod && !normalizedEndDate) {
        return ['balanceSheet', 'empty'];
    }

    return ['balanceSheet', { periods: normalizedPeriods, period: normalizedPeriod, endDate: normalizedEndDate }];
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
        // 多月份模式
        const uniquePeriods = [...new Set(params.periods.map((p) => p?.trim()))].filter(Boolean);
        
        if (uniquePeriods.length > MAX_PERIODS) {
          throw new Error(`一次最多查詢 ${MAX_PERIODS} 個月份，請縮小範圍`);
        }

        const periodRegex = /^\d{4}-\d{2}$/;
        uniquePeriods.forEach((p) => {
           if (!periodRegex.test(p)) throw new Error(`月份格式錯誤：${p}`);
           const [year, month] = p.split("-").map(Number);
           if (year < 1900 || year > 2100 || month < 1 || month > 12) {
             throw new Error(`月份超出有效範圍：${p}`);
           }
        });

        // 後端支援 periods（陣列或 CSV），同時傳遞以提升兼容性
        queryParams.periods = uniquePeriods;
        queryParams.periodsCsv = uniquePeriods.join(",");

      } else if (params.period) {
        // 單一月份模式
        const trimmedPeriod = params.period.trim();
        const periodRegex = /^\d{4}-\d{2}$/;
        if (!periodRegex.test(trimmedPeriod)) throw new Error(`月份格式錯誤：${trimmedPeriod}`);

        const [year, month] = trimmedPeriod.split("-").map(Number);
        if (year < 1900 || year > 2100 || month < 1 || month > 12) {
            throw new Error(`月份超出有效範圍：${trimmedPeriod}`);
        }
        
        queryParams.period = trimmedPeriod;

      } else if (params.endDate) {
        // 截止日期模式
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.endDate)) throw new Error(`日期格式錯誤：${params.endDate}`);
        
        const date = dayjs(params.endDate);
        if (!date.isValid()) throw new Error(`日期無效：${params.endDate}`);

        queryParams.endDate = params.endDate;
      }

      // --- 發送請求 ---
      // API 路徑: reports/balance_sheet
      const resourcePath = "reports/balance_sheet";
      const response = await dataProvider.get(resourcePath, {
        meta: queryParams,
      });

      // --- 格式化回傳 ---
      let reportData: BalanceSheetReportDto[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reportData = response.data as BalanceSheetReportDto[];
        } else if (typeof response.data === "object") {
          reportData = [response.data as BalanceSheetReportDto];
        }
      }
      return reportData;
    },

    // ★ 關鍵設定：資料快取時間
    staleTime: STALE_TIME, 

    // ★ 關鍵設定：防抖動 (Anti-flicker)
    placeholderData: (previousData) => previousData, 

    // 錯誤重試次數
    retry: 1,
    
    // 只有當參數有效時才啟動查詢
    enabled: queryKey[1] !== 'empty',
  });

  return {
    data: queryInfo.data || [],
    // 只有在「完全沒有資料」且「正在載入」時才為 true (顯示骨架屏)
    loading: queryInfo.isLoading && !queryInfo.data, 
    // 提供更精確的 fetching 狀態
    isFetching: queryInfo.isFetching,
    error: queryInfo.error as Error | null,
    refresh: queryInfo.refetch,
    lastUpdated: queryInfo.dataUpdatedAt ? new Date(queryInfo.dataUpdatedAt) : null,
  };
};
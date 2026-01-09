import { useMemo } from "react";
import { useDataProvider } from "react-admin";
// 確保您已安裝 @tanstack/react-query
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface CashFlowReportDto {
  accountingPeriod: string;
  totalSales: number;
  totalReceipts: number;
  totalPayments: number;
  totalExpenses: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
}

export interface CashFlowQueryParams {
  period?: string;    // YYYY-MM
  startDate?: string; // yyyy-MM-dd
  endDate?: string;   // yyyy-MM-dd
}

/* =========================================================
 * 常數設定
 * ========================================================= */

const STALE_TIME = 5 * 60 * 1000; // 5 分鐘內視為資料新鮮 (不重新 fetch)

/* =========================================================
 * Hook: useCashFlowReport
 * ========================================================= */

export const useCashFlowReport = (params: CashFlowQueryParams = {}) => {
  const dataProvider = useDataProvider();

  // 1. 建立唯一的 Query Key
  // 當這些參數改變時，React Query 會自動觸發重新查詢
  const queryKey = useMemo(() => {
    const normalizedPeriod = params.period?.trim() || undefined;
    const normalizedStartDate = params.startDate?.trim() || undefined;
    const normalizedEndDate = params.endDate?.trim() || undefined;

    // 只有當有參數時才回傳有效的 key，否則回傳 empty 標記
    if (!normalizedPeriod && (!normalizedStartDate || !normalizedEndDate)) {
        return ['cashFlow', 'empty'];
    }

    return ['cashFlow', { period: normalizedPeriod, startDate: normalizedStartDate, endDate: normalizedEndDate }];
  }, [params.period, params.startDate, params.endDate]);

  // 2. 使用 React Query
  const queryInfo = useQuery({
    queryKey: queryKey,
    
    // 查詢函數 (fetcher)
    queryFn: async () => {
      // 若 Key 是 empty，直接回傳空陣列
      if (queryKey[1] === 'empty') return [];

      const queryParams: Record<string, string> = {};

      // --- 參數驗證邏輯 (保留原有的嚴謹驗證) ---
      if (params.period) {
        // 驗證月份格式 (YYYY-MM)
        const periodRegex = /^\d{4}-\d{2}$/;
        if (periodRegex.test(params.period)) {
           // 進一步驗證月份是否有效（1-12月）
           const [year, month] = params.period.split("-").map(Number);
           if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
             queryParams.period = params.period;
           } else {
             throw new Error(`月份超出有效範圍：${params.period}`);
           }
        } else {
           throw new Error(`月份格式錯誤：${params.period}`);
        }
      } else if (params.startDate && params.endDate) {
        // 驗證日期格式 (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (dateRegex.test(params.startDate) && dateRegex.test(params.endDate)) {
           const start = dayjs(params.startDate);
           const end = dayjs(params.endDate);
           if (!start.isValid() || !end.isValid()) {
             throw new Error(`日期無效：請檢查日期是否正確`);
           }
           if (end.isBefore(start)) {
             throw new Error(`日期順序錯誤：結束日期不能早於起始日期`);
           }
           queryParams.startDate = params.startDate;
           queryParams.endDate = params.endDate;
        } else {
           throw new Error(`日期格式錯誤：應為 YYYY-MM-DD 格式`);
        }
      } else {
         throw new Error("查詢參數不完整：必須提供月份或日期範圍");
      }

      // --- 發送請求 ---
      // API 路徑: reports/cash_flow
      const resourcePath = "reports/cash_flow_reports";
      const response = await dataProvider.get(resourcePath, {
        meta: queryParams,
      });

      // --- 格式化回傳 ---
      let reportData: CashFlowReportDto[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reportData = response.data as CashFlowReportDto[];
        } else if (typeof response.data === "object") {
          // 兼容 { data: [...] } 或單一物件格式
          if ('data' in response.data && Array.isArray((response.data as any).data)) {
              reportData = (response.data as any).data;
          } else {
              reportData = [response.data as CashFlowReportDto];
          }
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
    // 只有在「完全沒有資料」且「正在載入」時才為 true (顯示骨架屏)
    loading: queryInfo.isLoading && !queryInfo.data, 
    // 提供更精確的 fetching 狀態
    isFetching: queryInfo.isFetching,
    error: queryInfo.error as Error | null,
    refresh: queryInfo.refetch,
    lastUpdated: queryInfo.dataUpdatedAt ? new Date(queryInfo.dataUpdatedAt) : null,
  };
};
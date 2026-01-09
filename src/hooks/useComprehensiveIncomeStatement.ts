import { useMemo } from "react";
import { useDataProvider } from "react-admin";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface ExpenseCategoryDetail {
  categoryId: number;
  categoryName: string;
  accountCode: string;
  isSalary: boolean;
  amount: number;
}

export interface ComprehensiveIncomeStatementDto {
  accountingPeriod: string;
  retailSales: number;
  orderSales: number;
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  expenseDetails?: ExpenseCategoryDetail[];
  totalOperatingExpenses: number;
  operatingProfit: number;
  otherIncome: number;
  otherExpenses: number;
  netProfit: number;
  otherComprehensiveIncome: number;
  comprehensiveIncome: number;
}

export interface ComprehensiveIncomeStatementQueryParams {
  periods?: string[]; // 多月份（優先）
  period?: string;    // YYYY-MM（次選）
  startDate?: string; // yyyy-MM-dd（第三選）
  endDate?: string;   // yyyy-MM-dd（第三選，需與 startDate 一起使用）
}

/* =========================================================
 * 常數設定
 * ========================================================= */

const MAX_PERIODS = 12; // 限制最多查詢 12 個月份
const STALE_TIME = 5 * 60 * 1000; // 5 分鐘緩存

/* =========================================================
 * Hook: useComprehensiveIncomeStatement
 * ========================================================= */

export const useComprehensiveIncomeStatement = (
  params: ComprehensiveIncomeStatementQueryParams = {}
) => {
  const dataProvider = useDataProvider();

  // 1. 建立唯一的 Query Key
  const queryKey = useMemo(() => {
    const normalizedPeriods =
      params.periods && params.periods.length > 0
        ? [...new Set(params.periods.map((p) => p?.trim()).filter(Boolean))].sort()
        : [];

    const normalizedPeriod = params.period?.trim() || undefined;
    const normalizedStartDate = params.startDate?.trim() || undefined;
    const normalizedEndDate = params.endDate?.trim() || undefined;

    // 只有當有參數時才回傳有效的 key，否則回傳 empty 標記
    if (normalizedPeriods.length === 0 && !normalizedPeriod && (!normalizedStartDate || !normalizedEndDate)) {
        return ['comprehensiveIncome', 'empty'];
    }

    return [
      'comprehensiveIncome', 
      { 
        periods: normalizedPeriods, 
        period: normalizedPeriod, 
        startDate: normalizedStartDate, 
        endDate: normalizedEndDate 
      }
    ];
  }, [params.period, params.startDate, params.endDate, params.periods]);

  // 2. 使用 React Query
  const queryInfo = useQuery({
    queryKey: queryKey,
    
    // 查詢函數 (fetcher)
    queryFn: async () => {
      // 若 Key 是 empty，直接回傳空陣列
      if (queryKey[1] === 'empty') return [];

      const queryParams: Record<string, string | string[]> = {};

      // --- 驗證邏輯 (保留原有的業務邏輯與優先順序) ---
      
      if (params.periods && params.periods.length > 0) {
        // 1. 多月份模式 (優先)
        const uniquePeriods = [...new Set(params.periods.map((p) => p?.trim()))].filter(Boolean);
        
        if (uniquePeriods.length === 0) throw new Error("請至少提供一個有效的月份");
        if (uniquePeriods.length > MAX_PERIODS) throw new Error(`一次最多查詢 ${MAX_PERIODS} 個月份，請縮小範圍`);

        const periodRegex = /^\d{4}-\d{2}$/;
        uniquePeriods.forEach((p) => {
          if (!periodRegex.test(p)) throw new Error(`月份格式錯誤：${p}`);
          const [year, month] = p.split("-").map(Number);
          if (year < 1900 || year > 2100 || month < 1 || month > 12) {
             throw new Error(`月份超出有效範圍：${p}`);
          }
        });

        queryParams.periods = uniquePeriods;

      } else if (params.period) {
        // 2. 單一月份模式 (次選)
        const trimmedPeriod = params.period.trim();
        if (!trimmedPeriod) throw new Error("請提供有效的月份");

        const periodRegex = /^\d{4}-\d{2}$/;
        if (!periodRegex.test(trimmedPeriod)) throw new Error(`月份格式錯誤：${trimmedPeriod}`);

        const [year, month] = trimmedPeriod.split("-").map(Number);
        if (year < 1900 || year > 2100 || month < 1 || month > 12) {
             throw new Error(`月份超出有效範圍：${trimmedPeriod}`);
        }

        queryParams.period = trimmedPeriod;

      } else if (params.startDate && params.endDate) {
        // 3. 日期範圍模式 (末選)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.startDate) || !dateRegex.test(params.endDate)) {
          throw new Error(`日期格式錯誤：應為 yyyy-MM-dd 格式`);
        }

        const start = dayjs(params.startDate);
        const end = dayjs(params.endDate);
        if (!start.isValid() || !end.isValid()) throw new Error(`日期無效：請檢查日期是否正確`);
        if (end.isBefore(start)) throw new Error(`日期順序錯誤：結束日期不能早於起始日期`);

        queryParams.startDate = params.startDate;
        queryParams.endDate = params.endDate;

      } else {
        // 理論上不會執行到這裡，因為 queryKey 已經過濾了空參數，但做為保險
        return [];
      }

      // --- 發送請求 ---
      // API 路徑: reports/comprehensive_income_statement
      const resourcePath = "reports/comprehensive_income_statement";
      const response = await dataProvider.get(resourcePath, {
        meta: queryParams,
      });

      // --- 格式化回傳 ---
      let reportData: ComprehensiveIncomeStatementDto[] = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          reportData = response.data as ComprehensiveIncomeStatementDto[];
        } else if (typeof response.data === "object") {
           // 兼容 { data: [...] } 或單一物件格式
           if ('data' in response.data && Array.isArray((response.data as any).data)) {
               reportData = (response.data as any).data;
           } else {
               reportData = [response.data as ComprehensiveIncomeStatementDto];
           }
        }
      }
      return reportData;
    },

    // ★ 關鍵設定：資料快取時間
    staleTime: STALE_TIME, 

    // ★ 關鍵設定：防抖動 (Anti-flicker)
    // 當切換月份時，保留舊資料直到新資料載入完成
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
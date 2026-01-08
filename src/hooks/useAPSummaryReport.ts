import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDataProvider } from "react-admin";


/* =========================================================
 * 型別定義
 * ========================================================= */

/**
 * 對應後端 APSummaryReportDto
 * 欄位必須與 Java DTO 完全一致
 */
export interface APSummaryReportDto {
  accountingPeriod: string; // 會計期間 (YYYY-MM 或 YYYY-MM-DD)
  totalPayable: number;     // 總應付帳款 (進貨總額)
  totalPaid: number;        // 已付帳款 (PAID)
  totalOutstanding: number; // 未付餘額 (UNPAID/負債)
}

export interface APSummaryQueryParams {
  periods?: string[]; // 多月份查詢 (用於趨勢圖)
  period?: string;    // 單一月份 (YYYY-MM)
  endDate?: string;   // 截止日期 (YYYY-MM-DD)，選填，若有填則計算至該日
}

interface CacheEntry {
  data: APSummaryReportDto[];
  timestamp: number;
  params: string;
}

const CACHE_KEY_PREFIX = "ap_summary_report_cache_";
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 秒
const MAX_PERIODS = 12;   // 限制一次最多查 12 個月

/* =========================================================
 * 工具函數
 * ========================================================= */

// 生成緩存鍵
const getCacheKey = (params: APSummaryQueryParams): string => {
  // 優先使用 periods (多月份)
  if (params.periods && params.periods.length > 0) {
    const sorted = [...new Set(params.periods)].sort();
    return `${CACHE_KEY_PREFIX}periods:${sorted.join(",")}`;
  }
  // 其次 period + endDate
  if (params.period) {
    const suffix = params.endDate ? `_end:${params.endDate}` : "";
    return `${CACHE_KEY_PREFIX}period:${params.period}${suffix}`;
  }
  return `${CACHE_KEY_PREFIX}empty`;
};

// 從緩存讀取數據
const getCachedData = (
  params: APSummaryQueryParams
): APSummaryReportDto[] | null => {
  try {
    const cacheKey = getCacheKey(params);
    const cached = localStorage.getItem(cacheKey);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    // 檢查緩存是否過期
    if (now - entry.timestamp > CACHE_DURATION) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("讀取 AP Summary 緩存失敗：", error);
    return null;
  }
};

// 保存數據到緩存
const setCachedData = (
  params: APSummaryQueryParams,
  data: APSummaryReportDto[]
): void => {
  try {
    const cacheKey = getCacheKey(params);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      params: JSON.stringify(params),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn("保存 AP Summary 緩存失敗：", error);
  }
};

// 延遲函數
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================
 * Hook: useAPSummaryReport
 * ========================================================= */

export const useAPSummaryReport = (
  params: APSummaryQueryParams = {}
) => {
  const dataProvider = useDataProvider();
  const dataProviderRef = useRef(dataProvider);
  const [data, setData] = useState<APSummaryReportDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 更新 ref 以保持 dataProvider 最新
  useEffect(() => {
    dataProviderRef.current = dataProvider;
  }, [dataProvider]);

  // 構建查詢參數的依賴鍵 (用於 useEffect)
  const paramsKey = useMemo(() => {
    const normalizedPeriods =
      params.periods && params.periods.length > 0
        ? [...new Set(params.periods.map((p) => p?.trim()).filter(Boolean))].sort()
        : [];

    const normalizedPeriod = params.period?.trim() || undefined;
    const normalizedEndDate = params.endDate?.trim() || undefined;

    return JSON.stringify({
      periods: normalizedPeriods,
      period: normalizedPeriod,
      endDate: normalizedEndDate,
    });
  }, [params.period, params.endDate, params.periods]);

  const fetchData = useCallback(
    async (skipCache = false, retryCount = 0): Promise<void> => {
      // 取消之前的請求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        // 1. 檢查緩存
        if (!skipCache) {
          const cachedData = getCachedData(params);
          if (cachedData) {
            setData(cachedData);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }
        }

        const dp = dataProviderRef.current;
        const queryParams: Record<string, string | string[]> = {};

        // 2. 參數驗證與組裝
        if (params.periods && params.periods.length > 0) {
          // --- 多月份模式 ---
          const uniquePeriods = [...new Set(params.periods.map((p) => p?.trim()))].filter(Boolean);
          
          if (uniquePeriods.length > MAX_PERIODS) {
            throw new Error(`一次最多查詢 ${MAX_PERIODS} 個月份，請縮小範圍`);
          }

          const periodRegex = /^\d{4}-\d{2}$/;
          uniquePeriods.forEach((p) => {
            if (!periodRegex.test(p)) {
              throw new Error(`月份格式錯誤：${p}，應為 YYYY-MM`);
            }
          });

          queryParams.periods = uniquePeriods;

        } else if (params.period) {
          // --- 單一月份模式 (+ 可選 endDate) ---
          const trimmedPeriod = params.period.trim();
          const periodRegex = /^\d{4}-\d{2}$/;
          
          if (!periodRegex.test(trimmedPeriod)) {
             throw new Error(`月份格式錯誤：${trimmedPeriod}，應為 YYYY-MM`);
          }
          
          queryParams.period = trimmedPeriod;

          if (params.endDate) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(params.endDate)) {
              throw new Error(`截止日期格式錯誤：應為 yyyy-MM-dd`);
            }
            queryParams.endDate = params.endDate;
          }

        } else {
          // 無參數時清空
          setData([]);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }

        // 3. 發送請求
        // API 路徑: reports/ap_summary
        const resourcePath = "reports/ap_summary"; 

        const response = await dp.get(resourcePath, {
          meta: queryParams,
        });

        // 4. 數據處理 (確保轉為 Array)
        let reportData: APSummaryReportDto[] = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            reportData = response.data as APSummaryReportDto[];
          } else if (typeof response.data === "object") {
            reportData = [response.data as APSummaryReportDto];
          }
        }

        setData(reportData);
        setLastUpdated(new Date());

        // 寫入緩存
        if (reportData.length > 0) {
          setCachedData(params, reportData);
        }

      } catch (err) {
        // 取消請求不報錯
        if (abortControllerRef.current?.signal.aborted) return;

        // 重試邏輯
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          console.warn(`載入 AP 報表失敗，重試中 (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);
          await delay(RETRY_DELAY * (retryCount + 1));
          return fetchData(skipCache, retryCount + 1);
        }

        // 錯誤處理
        console.error("❌ 載入 AP 報表失敗：", err);
        const errorMessage = err instanceof Error ? err.message.toLowerCase() : "Unknown Error";

        // 404 視為無數據
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          setData([]);
          setLoading(false);
          return;
        }

        let finalError: Error;
        if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
          finalError = new Error("網路連線失敗");
        } else if (errorMessage.includes("401")) {
          finalError = new Error("請重新登入");
        } else if (errorMessage.includes("500")) {
          finalError = new Error("伺服器發生錯誤");
        } else {
          const cleanMessage = err instanceof Error ? err.message.replace(/^.*?:\s*/, "") : "載入失敗";
          finalError = new Error(`載入失敗：${cleanMessage}`);
        }

        setError(finalError);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // 監聽參數變更
  useEffect(() => {
    const hasPeriod = !!params.period?.trim();
    const hasPeriods = params.periods && params.periods.length > 0;

    if (hasPeriod || hasPeriods) {
      fetchData();
    } else {
      setData([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, refresh, lastUpdated };
};
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDataProvider } from "react-admin";
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
  period?: string; // YYYY-MM（優先）
  endDate?: string; // yyyy-MM-dd（次選）
}

interface CacheEntry {
  data: BalanceSheetReportDto[];
  timestamp: number;
  params: string;
}

const CACHE_KEY_PREFIX = "balance_sheet_report_cache_";
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 秒
const MAX_PERIODS = 12; // 限制最多查詢 12 個月份，避免過多請求

/* =========================================================
 * 工具函數
 * ========================================================= */

// 生成緩存鍵
const getCacheKey = (params: BalanceSheetQueryParams): string => {
  // 優先使用 periods（多月份），其次 period，最後 endDate
  if (params.periods && params.periods.length > 0) {
    const sorted = [...new Set(params.periods)].sort();
    return `${CACHE_KEY_PREFIX}${sorted.join(",")}`;
  }
  const key = params.period || params.endDate || "";
  return `${CACHE_KEY_PREFIX}${key}`;
};

// 從緩存讀取數據
const getCachedData = (params: BalanceSheetQueryParams): BalanceSheetReportDto[] | null => {
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
    console.warn("讀取緩存失敗：", error);
    return null;
  }
};

// 保存數據到緩存
const setCachedData = (params: BalanceSheetQueryParams, data: BalanceSheetReportDto[]): void => {
  try {
    const cacheKey = getCacheKey(params);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      params: JSON.stringify(params),
    };
    localStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    console.warn("保存緩存失敗：", error);
  }
};

// 延遲函數
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* =========================================================
 * Hook
 * ========================================================= */

export const useBalanceSheetReport = (params: BalanceSheetQueryParams) => {
  const dataProvider = useDataProvider();
  const dataProviderRef = useRef(dataProvider);
  const [data, setData] = useState<BalanceSheetReportDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 更新 ref 以保持 dataProvider 最新
  useEffect(() => {
    dataProviderRef.current = dataProvider;
  }, [dataProvider]);

  // 構建查詢參數的字符串表示（用於緩存鍵和依賴）
  const paramsKey = useMemo(() => {
    // 標準化 periods（去除重複並排序）
    const normalizedPeriods =
      params.periods && params.periods.length > 0
        ? [...new Set(params.periods.map((p) => p?.trim()).filter(Boolean))].sort()
        : [];
    
    // 標準化 period（去除空白）
    const normalizedPeriod = params.period?.trim() || undefined;
    
    // 標準化 endDate
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

        // 檢查緩存
        if (!skipCache) {
          const cachedData = getCachedData(params);
          if (cachedData) {
            setData(cachedData);
            setLastUpdated(new Date());
            setLoading(false);
            return;
          }
        }

        // 使用 ref 中的 dataProvider 來避免閉包問題
        const dp = dataProviderRef.current;

        // 構建查詢參數（優先使用 period，如果同時提供則忽略 endDate）
        const queryParams: Record<string, string | string[]> = {};
        
        if (params.periods && params.periods.length > 0) {
          // 驗證多月份（優先）
          const uniquePeriods = [...new Set(params.periods.map((p) => p?.trim()))].filter(Boolean);
          if (uniquePeriods.length === 0) {
            throw new Error("請至少提供一個有效的月份");
          }
          if (uniquePeriods.length > MAX_PERIODS) {
            throw new Error(`一次最多查詢 ${MAX_PERIODS} 個月份，請縮小範圍`);
          }

          const periodRegex = /^\d{4}-\d{2}$/;
          uniquePeriods.forEach((p) => {
            if (!periodRegex.test(p)) {
              throw new Error(`月份格式錯誤：${p}，應為 YYYY-MM 格式`);
            }
            const [year, month] = p.split("-").map(Number);
            if (year < 1900 || year > 2100 || month < 1 || month > 12) {
              throw new Error(`月份超出有效範圍：${p}，年份應在 1900-2100 之間，月份應在 1-12 之間`);
            }
          });

          // 後端支援 periods（陣列或逗號分隔），同時傳遞以提升兼容性
          queryParams.periods = uniquePeriods;
          queryParams.periodsCsv = uniquePeriods.join(",");
        } else if (params.period) {
          // 去除空白字符
          const trimmedPeriod = params.period.trim();
          if (!trimmedPeriod) {
            throw new Error("請提供有效的月份");
          }

          // 驗證月份格式 (YYYY-MM)
          const periodRegex = /^\d{4}-\d{2}$/;
          if (!periodRegex.test(trimmedPeriod)) {
            throw new Error(`月份格式錯誤：${trimmedPeriod}，應為 YYYY-MM 格式`);
          }

          // 進一步驗證月份是否有效（1-12月）
          const [year, month] = trimmedPeriod.split("-").map(Number);
          if (year < 1900 || year > 2100 || month < 1 || month > 12) {
            throw new Error(`月份超出有效範圍：${trimmedPeriod}，年份應在 1900-2100 之間，月份應在 1-12 之間`);
          }

          queryParams.period = trimmedPeriod;
        } else if (params.endDate) {
          // 驗證日期格式 (yyyy-MM-dd)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(params.endDate)) {
            throw new Error(`日期格式錯誤：${params.endDate}，應為 yyyy-MM-dd 格式`);
          }

          // 驗證日期是否有效
          const date = dayjs(params.endDate);
          if (!date.isValid()) {
            throw new Error(`日期無效：${params.endDate}`);
          }

          queryParams.endDate = params.endDate;
        } else {
          // 如果都不提供，返回空數組
          setData([]);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }

        // 使用 dataProvider 的 get 方法來獲取數據
        const resourcePath = "reports/balance_sheet";

        const response = await dp.get(resourcePath, {
          meta: queryParams,
        });

        // 處理回應數據（返回的是數組）
        let reportData: BalanceSheetReportDto[] = [];

        if (response.data) {
          if (Array.isArray(response.data)) {
            // 如果返回的是數組
            reportData = response.data as BalanceSheetReportDto[];
          } else if (typeof response.data === "object" && !Array.isArray(response.data)) {
            // 如果返回的是單一對象，轉為數組
            reportData = [response.data as BalanceSheetReportDto];
          }
        }

        // 無數據時不拋出錯誤，而是設置為空數組，讓 UI 顯示無數據提示
        setData(reportData);
        setLastUpdated(new Date());
        
        // 只有當有數據時才緩存
        if (reportData.length > 0) {
          setCachedData(params, reportData);
        }
      } catch (err) {
        // 如果是手動取消，不處理錯誤
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        // 重試邏輯
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          console.warn(
            `載入資產負債表失敗，${RETRY_DELAY}ms 後重試 (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})：`,
            err
          );
          await delay(RETRY_DELAY * (retryCount + 1)); // 指數退避
          return fetchData(skipCache, retryCount + 1);
        }

        // 最終失敗 - 提供更細化的錯誤分類
        console.error("❌ 載入資產負債表失敗：", err);

        const errorMessage =
          err instanceof Error
            ? err.message.toLowerCase()
            : "載入資產負債表數據失敗";

        // 根據錯誤類型提供更明確的錯誤訊息
        // 404 錯誤視為無數據，不設置錯誤狀態
        if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          // 404 視為無數據，設置 data 為空數組，不設置錯誤
          setData([]);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }

        let finalError: Error;
        if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("failed to fetch")) {
          finalError = new Error("網路連線失敗，請檢查您的網路連線");
        } else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
          finalError = new Error("請求逾時，請稍後再試");
        } else if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
          finalError = new Error("身份驗證失敗，請重新登入");
        } else if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
          finalError = new Error("沒有權限訪問此資料");
        } else if (errorMessage.includes("500") || errorMessage.includes("internal server")) {
          finalError = new Error("伺服器錯誤，請稍後再試或聯繫管理員");
        } else if (errorMessage.includes("400") || errorMessage.includes("bad request")) {
          finalError = new Error("請求參數錯誤，請檢查查詢條件");
        } else {
          // 提取原始錯誤訊息（去除技術細節）
          const cleanMessage = err instanceof Error
            ? err.message.replace(/^.*?:\s*/, "") // 移除前置的錯誤類型
            : "載入失敗";
          finalError = new Error(`載入失敗：${cleanMessage}`);
        }

        setError(finalError);
      } finally {
        setLoading(false);
      }
    },
    [params]
  );

  // 刷新函數（跳過緩存）
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    // 至少需要提供 period、periods 或 endDate 其中一個
    const hasPeriod = params.period && params.period.trim().length > 0;
    const hasPeriods = params.periods && params.periods.length > 0;
    const hasEndDate = params.endDate && params.endDate.trim().length > 0;
    
    if (hasPeriod || hasEndDate || hasPeriods) {
      fetchData();
    } else {
      // 如果沒有任何查詢參數，清空數據
      setData([]);
      setLoading(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  // 清理函數
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, loading, error, refresh, lastUpdated };
};

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useDataProvider } from "react-admin";
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
  period?: string; // YYYY-MM
  startDate?: string; // yyyy-MM-dd
  endDate?: string; // yyyy-MM-dd
}

interface CacheEntry {
  data: CashFlowReportDto[];
  timestamp: number;
  params: string;
}

const CACHE_KEY_PREFIX = "cash_flow_report_cache_";
const CACHE_DURATION = 5 * 60 * 1000; // 5 分鐘緩存
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 秒

/* =========================================================
 * 工具函數
 * ========================================================= */

// 生成緩存鍵（使用更安全的方式，避免 btoa 對非 ASCII 字符的問題）
const getCacheKey = (params: CashFlowQueryParams): string => {
  // 構建排序後的參數字串，確保相同的參數生成相同的鍵
  const parts: string[] = [];
  if (params.period) {
    parts.push(`period:${params.period}`);
  }
  if (params.startDate) {
    parts.push(`start:${params.startDate}`);
  }
  if (params.endDate) {
    parts.push(`end:${params.endDate}`);
  }
  // 使用 encodeURIComponent 確保特殊字符被正確處理
  const paramString = parts.join("&");
  return `${CACHE_KEY_PREFIX}${encodeURIComponent(paramString)}`;
};

// 從緩存讀取數據
const getCachedData = (params: CashFlowQueryParams): CashFlowReportDto[] | null => {
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
const setCachedData = (params: CashFlowQueryParams, data: CashFlowReportDto[]): void => {
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

export const useCashFlowReport = (params: CashFlowQueryParams = {}) => {
  const dataProvider = useDataProvider();
  const dataProviderRef = useRef(dataProvider);
  const [data, setData] = useState<CashFlowReportDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 更新 ref 以保持 dataProvider 最新
  useEffect(() => {
    dataProviderRef.current = dataProvider;
  }, [dataProvider]);

  // 構建查詢參數的字符串表示（用於緩存鍵）
  const paramsKey = useMemo(
    () => JSON.stringify(params),
    [params.period, params.startDate, params.endDate]
  );

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

        // 構建查詢參數
        const queryParams: Record<string, string> = {};
        if (params.period) {
          // 驗證月份格式 (YYYY-MM)
          const periodRegex = /^\d{4}-\d{2}$/;
          if (periodRegex.test(params.period)) {
            // 進一步驗證月份是否有效（1-12月）
            const [year, month] = params.period.split("-").map(Number);
            if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
              queryParams.period = params.period;
            } else {
              throw new Error(`月份超出有效範圍：${params.period}，年份應在 1900-2100 之間，月份應在 1-12 之間`);
            }
          } else {
            throw new Error(`月份格式錯誤：${params.period}，應為 YYYY-MM 格式`);
          }
        } else if (params.startDate && params.endDate) {
          // 驗證日期格式 (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (dateRegex.test(params.startDate) && dateRegex.test(params.endDate)) {
            // 驗證日期順序
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
        }

        // 驗證查詢參數：必須有 period 或 (startDate 和 endDate)
        if (Object.keys(queryParams).length === 0) {
          throw new Error("查詢參數不完整：必須提供月份或日期範圍");
        }

        // 使用 dataProvider 的 get 方法來獲取數據
        const resourcePath = "cash_flow_reports";

        const response = await dp.get(resourcePath, {
          meta: queryParams,
        });

        // 處理回應數據
        let reportData: CashFlowReportDto[] = [];

        if (Array.isArray(response.data)) {
          reportData = response.data;
        } else if (
          response.data &&
          typeof response.data === "object" &&
          "data" in response.data
        ) {
          // 處理 { data: [...] } 格式
          const nestedData = (response.data as { data: unknown }).data;
          if (Array.isArray(nestedData)) {
            reportData = nestedData;
          }
        }

        setData(reportData);
        setLastUpdated(new Date());
        setCachedData(params, reportData);
      } catch (err) {
        // 如果是手動取消，不處理錯誤
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        // 重試邏輯
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          console.warn(
            `載入現金流量表失敗，${RETRY_DELAY}ms 後重試 (${retryCount + 1}/${MAX_RETRY_ATTEMPTS})：`,
            err
          );
          await delay(RETRY_DELAY * (retryCount + 1)); // 指數退避
          return fetchData(skipCache, retryCount + 1);
        }

        // 最終失敗 - 提供更細化的錯誤分類
        console.error("❌ 載入現金流量表失敗：", err);

        const errorMessage =
          err instanceof Error
            ? err.message.toLowerCase()
            : "載入現金流量表數據失敗";

        // 根據錯誤類型提供更明確的錯誤訊息
        let finalError: Error;
        if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("failed to fetch")) {
          finalError = new Error("網路連線失敗，請檢查您的網路連線");
        } else if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
          finalError = new Error("請求逾時，請稍後再試");
        } else if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
          finalError = new Error("身份驗證失敗，請重新登入");
        } else if (errorMessage.includes("403") || errorMessage.includes("forbidden")) {
          finalError = new Error("沒有權限訪問此資料");
        } else if (errorMessage.includes("404") || errorMessage.includes("not found")) {
          finalError = new Error("找不到指定的資料");
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
    [params, paramsKey]
  );

  // 刷新函數（跳過緩存）
  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
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


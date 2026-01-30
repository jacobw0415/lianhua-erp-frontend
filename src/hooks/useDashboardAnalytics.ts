/**
 * 核心圖表 API：/api/dashboard/analytics/*
 * - break-even, liquidity, cashflow-forecast, product-pareto, supplier-concentration, customer-retention
 */
import { useDataProvider } from 'react-admin';
import { useQuery } from '@tanstack/react-query';
import { getDefaultPeriod, getDefaultDateRange, clampRangeToMaxDays } from '@/utils/dashboardDateUtils';

const ANALYTICS_BASE = 'dashboard/analytics';

/** [圖表 1] 損益平衡分析 */
export interface BreakEvenPoint {
  date: string;
  runningRevenue: number;
  runningExpense: number;
  breakEvenThreshold: number;
}

/** [圖表 2] 流動性與償債能力 */
export interface LiquiditySnapshot {
  liquidAssets: number;
  liquidLiabilities: number;
  quickAssets: number;
  currentRatio: number;
}

/** [圖表 3] 未來現金流預測 */
export interface CashflowForecastPoint {
  date: string;
  inflow: number;
  outflow: number;
}

/** [圖表 4] 商品獲利 Pareto */
export interface ProductParetoPoint {
  productName: string;
  totalAmount: number;
  cumulativePct: number;
}

/** [圖表 5] 供應商採購集中度 */
export interface SupplierConcentrationPoint {
  supplierName: string;
  ratio: number;
  totalAmount: number;
}

/** [圖表 6] 客戶回購與沉睡分析 */
export interface CustomerRetentionPoint {
  customerName: string;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  status: string;
}

export type ForecastDaysOption = 15 | 30 | 60;

export interface DashboardAnalyticsFilters {
  /** 損益平衡：YYYY-MM，預設當月 */
  breakEvenPeriod?: string;
  /** Pareto + 採購集中度：共用區間，預設本月1號～今日 */
  dateRange?: { start: string; end: string };
  /** 現金流預測：15/30/60 天，預設 30 */
  forecastDays?: ForecastDaysOption;
  /** 客戶回購：篩選「沉睡風險」時為 true（例如 >60 天未下單） */
  retentionDormantOnly?: boolean;
}

const defaultPeriod = getDefaultPeriod();
const defaultRange = getDefaultDateRange();

export function useDashboardAnalytics(filters: DashboardAnalyticsFilters = {}) {
  const dataProvider = useDataProvider();

  const breakEvenPeriod = filters.breakEvenPeriod ?? defaultPeriod;
  const dateRange = filters.dateRange ?? defaultRange;
  const startRaw = dateRange?.start ?? defaultRange.start;
  const endRaw = dateRange?.end ?? defaultRange.end;
  const { start: rangeStart, end: rangeEnd } = clampRangeToMaxDays(startRaw, endRaw);
  const forecastDays = filters.forecastDays ?? 30;

  // 1. 損益平衡分析（正規化後端可能回傳的 snake_case，並依日期排序）
  const breakEvenQuery = useQuery({
    queryKey: [ANALYTICS_BASE, 'break-even', breakEvenPeriod],
    queryFn: async () => {
      const res = await dataProvider.get(`${ANALYTICS_BASE}/break-even`, {
        meta: { period: breakEvenPeriod },
      });
      const raw = Array.isArray(res.data) ? res.data : (res.data as Record<string, unknown>)?.content ?? (res.data as Record<string, unknown>)?.items ?? [];
      const toDateStr = (v: unknown): string => {
        if (v == null) return '';
        if (typeof v === 'string') return v.split('T')[0];
        if (typeof v === 'number') return new Date(v).toISOString().split('T')[0];
        if (v instanceof Date) return v.toISOString().split('T')[0];
        return String(v).split('T')[0];
      };
      const normalized: BreakEvenPoint[] = raw.map((item: Record<string, unknown>) => ({
        date: toDateStr(item.date),
        runningRevenue: Number(item.runningRevenue ?? item.running_revenue ?? 0),
        runningExpense: Number(item.runningExpense ?? item.running_expense ?? 0),
        breakEvenThreshold: Number(item.breakEvenThreshold ?? item.break_even_threshold ?? 0),
      })).filter((p: BreakEvenPoint) => p.date);
      normalized.sort((a, b) => a.date.localeCompare(b.date));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. 流動性指標（無參數）
  const liquidityQuery = useQuery({
    queryKey: [ANALYTICS_BASE, 'liquidity'],
    queryFn: async () => {
      const res = await dataProvider.get(`${ANALYTICS_BASE}/liquidity`);
      return res.data as LiquiditySnapshot | null;
    },
    staleTime: 2 * 60 * 1000,
  });

  // 3. 未來現金流預測
  const cashflowForecastQuery = useQuery({
    queryKey: [ANALYTICS_BASE, 'cashflow-forecast', forecastDays],
    queryFn: async () => {
      const res = await dataProvider.get(`${ANALYTICS_BASE}/cashflow-forecast`, {
        meta: { days: forecastDays },
      });
      return (Array.isArray(res.data) ? res.data : []) as CashflowForecastPoint[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 4. 商品 Pareto（API 參數：start, end，預設本月1號～今日）
  const productParetoQuery = useQuery({
    queryKey: [ANALYTICS_BASE, 'product-pareto', rangeStart, rangeEnd],
    queryFn: async () => {
      const res = await dataProvider.get(`${ANALYTICS_BASE}/product-pareto`, {
        meta: { start: rangeStart, end: rangeEnd },
      });
      return (Array.isArray(res.data) ? res.data : []) as ProductParetoPoint[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 5. 供應商集中度（API 參數：start, end，預設本月1號～今日）
  const supplierConcentrationQuery = useQuery({
    queryKey: [ANALYTICS_BASE, 'supplier-concentration', rangeStart, rangeEnd],
    queryFn: async () => {
      const res = await dataProvider.get(`${ANALYTICS_BASE}/supplier-concentration`, {
        meta: { start: rangeStart, end: rangeEnd },
      });
      return (Array.isArray(res.data) ? res.data : []) as SupplierConcentrationPoint[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // 6. 客戶回購分析（可選篩選沉睡）
  const customerRetentionQuery = useQuery({
    queryKey: [ANALYTICS_BASE, 'customer-retention', filters.retentionDormantOnly ?? false],
    queryFn: async () => {
      const res = await dataProvider.get(`${ANALYTICS_BASE}/customer-retention`, {
        meta: filters.retentionDormantOnly ? { dormantOnly: true } : undefined,
      });
      return (Array.isArray(res.data) ? res.data : []) as CustomerRetentionPoint[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const loading =
    breakEvenQuery.isLoading ||
    liquidityQuery.isLoading ||
    cashflowForecastQuery.isLoading ||
    productParetoQuery.isLoading ||
    supplierConcentrationQuery.isLoading ||
    customerRetentionQuery.isLoading;

  const error =
    breakEvenQuery.error ||
    liquidityQuery.error ||
    cashflowForecastQuery.error ||
    productParetoQuery.error ||
    supplierConcentrationQuery.error ||
    customerRetentionQuery.error;

  return {
    // 數據
    breakEven: breakEvenQuery.data ?? [],
    liquidity: liquidityQuery.data ?? null,
    cashflowForecast: cashflowForecastQuery.data ?? [],
    productPareto: productParetoQuery.data ?? [],
    supplierConcentration: supplierConcentrationQuery.data ?? [],
    customerRetention: customerRetentionQuery.data ?? [],
    // 狀態
    loading,
    error,
    isBreakEvenLoading: breakEvenQuery.isLoading,
    isLiquidityLoading: liquidityQuery.isLoading,
    isCashflowForecastLoading: cashflowForecastQuery.isLoading,
    isProductParetoLoading: productParetoQuery.isLoading,
    isSupplierConcentrationLoading: supplierConcentrationQuery.isLoading,
    isCustomerRetentionLoading: customerRetentionQuery.isLoading,
    // 操作
    refetch: () => {
      breakEvenQuery.refetch();
      liquidityQuery.refetch();
      cashflowForecastQuery.refetch();
      productParetoQuery.refetch();
      supplierConcentrationQuery.refetch();
      customerRetentionQuery.refetch();
    },
  };
}

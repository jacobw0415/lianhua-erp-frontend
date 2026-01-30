import { useDataProvider } from "react-admin";
import { useQuery } from "@tanstack/react-query";

/**
 * 📊 與後端 DTO 完全對齊的型別定義
 */
export interface DashboardStats {
  todaySalesTotal: number;
  monthSalesTotal: number;
  monthPurchaseTotal: number;
  monthExpenseTotal: number;
  supplierCount: number;
  customerCount: number;
  activeProductCount: number;
  pendingOrderCount: number;
  accountsPayable: number;
  accountsReceivable: number;
  netProfit: number;
  profitMargin: number;
  todayReceiptsTotal: number;
  todayTotalInflow: number;
  monthTotalReceived: number;
  upcomingAR: number;
}

export interface TrendPoint {
  date: string;
  saleAmount: number;
  receiptAmount: number;
}

// 💡 為了處理 Any 問題並支援後端可能回傳的底線欄位，定義原始資料型別
interface RawTrendPoint {
  date?: string;
  saleAmount?: number;
  sale_amount?: number;    // 支援底線命名
  receiptAmount?: number;
  receipt_amount?: number; // 支援底線命名
}

export interface ExpenseComposition {
  category: string;
  amount: number;
}

export interface DashboardTask {
  type: 'AR_DUE' | 'ORDER_PENDING';
  targetName: string;
  referenceNo: string;
  amount: number;
  dueDate: string;
}

/**
 * 📈 進階分析用型別定義（對齊 /api/dashboard/analytics/* DTO）
 */

// 1. 銷售與毛利結構分析 (/sales-composition)
export interface SalesCompositionPoint {
  categoryName: string;
  salesAmount: number;
  grossProfitAmount: number;
  grossMarginRate: number; // 以百分比表示，例如 35.5 代表 35.5%
}

// 2. 帳款帳齡風險分析 (/accounts-aging)
export interface AccountAgingBucket {
  bucketLabel: string; // 0-30天, 31-60天, ...
  arAmount: number;
  apAmount: number;
}

// 3. 損益四線走勢 (/profit-loss-trend)
export interface ProfitLossPoint {
  period: string; // 會計月份，例如 2025-12
  revenue: number;
  grossProfit: number;
  expense: number;
  netProfit: number;
}

// 4. 未來現金流預測 (/cashflow-forecast)
export interface CashflowForecastPoint {
  date: string; // 預測日期
  expectedInflow: number;
  expectedOutflow: number;
  projectedBalance: number;
}

// 5. 訂單履約漏斗 (/order-funnel)
export interface OrderFunnelPoint {
  stage: string;       // CONFIRMED, DELIVERED, ...
  orderCount: number;
  totalAmount: number;
}

const DEFAULT_STATS: DashboardStats = {
  todaySalesTotal: 0, monthSalesTotal: 0, monthPurchaseTotal: 0, monthExpenseTotal: 0,
  supplierCount: 0, customerCount: 0, activeProductCount: 0, pendingOrderCount: 0,
  accountsPayable: 0, accountsReceivable: 0, netProfit: 0, profitMargin: 0,
  todayReceiptsTotal: 0, todayTotalInflow: 0, monthTotalReceived: 0, upcomingAR: 0,
};

interface AnalyticsOptions {
  period?: string; // YYYY-MM，用於 sales-composition / order-funnel
  months?: number; // 用於 profit-loss-trend
  days?: number;   // 用於 cashflow-forecast
}

export const useDashboardStats = (
  trendDays: number = 30,
  analyticsOptions?: AnalyticsOptions,
) => {
  const dataProvider = useDataProvider();

  // 會計期間與預設查詢參數（前端預設值，後端如需自訂可再擴充）
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const defaultPeriod = `${currentYear}-${currentMonth}`; // YYYY-MM

  const analyticsPeriod = analyticsOptions?.period ?? defaultPeriod;
  const analyticsMonths = analyticsOptions?.months ?? 6;


  // 1. 核心 KPI 統計 (字卡)
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const response = await dataProvider.get('dashboard/stats');
      return response.data as DashboardStats;
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  // 2. 營運趨勢數據 (折線圖)
  const trendsQuery = useQuery({
    queryKey: ['dashboard', 'trends', trendDays],
    /**
     * 優先呼叫後端聚合 API：GET /dashboard/trends?days=30
     * 若後端不可用或發生錯誤，再以前端聚合 sales + receipts 作為備援
     */
    queryFn: async (): Promise<TrendPoint[]> => {
      // === 2.1 優先走後端聚合 ===
      try {
        const response = await dataProvider.get('dashboard/trends', {
          meta: { days: trendDays },
        });

        const rawData = (Array.isArray(response.data) ? response.data : []) as RawTrendPoint[];

        return rawData.map((point: RawTrendPoint): TrendPoint => ({
          date: point.date
            ? new Date(point.date).toLocaleDateString('zh-TW', {
              month: '2-digit',
              day: '2-digit',
            })
            : 'N/A',
          saleAmount: Number(point.saleAmount ?? point.sale_amount ?? 0),
          receiptAmount: Number(point.receiptAmount ?? point.receipt_amount ?? 0),
        }));
      } catch (error) {
        console.warn('後端 /dashboard/trends 不可用，改用前端聚合營運與收款趨勢', error);
      }

      // === 2.2 備援：前端聚合 sales + receipts ===
      const end = new Date();
      const start = new Date();
      const days = Math.max(1, trendDays);
      start.setDate(end.getDate() - (days - 1)); // 近 trendDays 天

      const toIsoDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const startStr = toIsoDate(start);
      const endStr = toIsoDate(end);

      const [salesRes, receiptsRes] = await Promise.all([
        dataProvider
          .getList('sales', {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
            filter: {
              saleDateFrom: startStr,
              saleDateTo: endStr,
            },
          })
          .catch(() => ({ data: [] })),
        dataProvider
          .getList('receipts', {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
            filter: {
              // 對齊收款列表：使用 receivedDateFrom / receivedDateTo 篩選收款日期
              receivedDateFrom: startStr,
              receivedDateTo: endStr,
            },
          })
          .catch(() => ({ data: [] })),
      ]);

      type Agg = { isoDate: string; saleAmount: number; receiptAmount: number };
      const aggMap = new Map<string, Agg>();

      // 先初始化範圍內的每天，每天預設為 0，讓趨勢線連續
      for (
        const d = new Date(start.getTime());
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        const iso = toIsoDate(d);
        if (!aggMap.has(iso)) {
          aggMap.set(iso, { isoDate: iso, saleAmount: 0, receiptAmount: 0 });
        }
      }

      const salesData = Array.isArray((salesRes as any)?.data)
        ? (salesRes as any).data
        : (salesRes as any)?.data?.content ?? [];

      const receiptsData = Array.isArray((receiptsRes as any)?.data)
        ? (receiptsRes as any).data
        : (receiptsRes as any)?.data?.content ?? [];

      // 聚合銷售金額
      salesData.forEach((sale: any) => {
        const rawDate: string | undefined = sale?.saleDate;
        if (!rawDate) return;
        const iso = toIsoDate(new Date(rawDate));
        const bucket = aggMap.get(iso);
        if (!bucket) return;
        bucket.saleAmount += Number(sale?.amount ?? 0);
      });

      // 聚合收款金額（排除作廢）
      receiptsData.forEach((r: any) => {
        if (r?.status === 'VOIDED') return;
        const rawDate: string | undefined = r?.receivedDate;
        if (!rawDate) return;
        const iso = toIsoDate(new Date(rawDate));
        const bucket = aggMap.get(iso);
        if (!bucket) return;
        bucket.receiptAmount += Number(r?.amount ?? 0);
      });

      const result: TrendPoint[] = Array.from(aggMap.values())
        .sort((a, b) => (a.isoDate < b.isoDate ? -1 : a.isoDate > b.isoDate ? 1 : 0))
        .map((p) => ({
          date: new Date(p.isoDate).toLocaleDateString('zh-TW', {
            month: '2-digit',
            day: '2-digit',
          }),
          saleAmount: p.saleAmount,
          receiptAmount: p.receiptAmount,
        }));

      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. 支出結構比例 (圓餅圖) — 回到儀表板即重抓，新增支出後圓餅圖會更新
  const expenseQuery = useQuery({
    queryKey: ['dashboard', 'expenses'],
    queryFn: async () => {
      const response = await dataProvider.get('dashboard/expenses/composition');
      const raw = response.data;
      const list = Array.isArray(raw) ? raw : (raw as any)?.data ?? (raw as any)?.content ?? [];
      return list as ExpenseComposition[];
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // 4. 待辦與預警任務 (資訊牆)
  const tasksQuery = useQuery({
    queryKey: ['dashboard', 'tasks'],
    queryFn: async () => {
      const response = await dataProvider.get('dashboard/tasks');
      return (Array.isArray(response.data) ? response.data : []) as DashboardTask[];
    },
    staleTime: 0,
    refetchOnMount: "always",
  });

  // 5. 帳款帳齡風險分析 (/api/dashboard/analytics/accounts-aging)
  const accountsAgingQuery = useQuery({
    queryKey: ['dashboard', 'analytics', 'accounts-aging', analyticsPeriod],
    queryFn: async () => {
      const response = await dataProvider.get('dashboard/analytics/accounts-aging', {
        meta: { period: analyticsPeriod },
      });
      return (Array.isArray((response as any).data) ? (response as any).data : []) as AccountAgingBucket[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // 6. 損益四線走勢 (/api/dashboard/analytics/profit-loss-trend)
  const profitLossTrendQuery = useQuery({
    queryKey: ['dashboard', 'analytics', 'profit-loss-trend', analyticsMonths],
    queryFn: async () => {
      const response = await dataProvider.get('dashboard/analytics/profit-loss-trend', {
        meta: { months: analyticsMonths },
      });
      return (Array.isArray((response as any).data) ? (response as any).data : []) as ProfitLossPoint[];
    },
    staleTime: 10 * 60 * 1000,
  });

  // 7. 訂單履約漏斗 (/api/dashboard/analytics/order-funnel)
  const orderFunnelQuery = useQuery({
    queryKey: ['dashboard', 'analytics', 'order-funnel', analyticsPeriod],
    queryFn: async () => {
      const response = await dataProvider.get('dashboard/analytics/order-funnel', {
        meta: { period: analyticsPeriod },
      });
      return (Array.isArray((response as any).data) ? (response as any).data : []) as OrderFunnelPoint[];
    },
    staleTime: 10 * 60 * 1000,
  });

  return {
    // 數據 (使用原始 Query 資料以利圖表偵測)
    stats: statsQuery.data || DEFAULT_STATS,
    trends: trendsQuery.data || [],
    expenses: expenseQuery.data || [],
    tasks: tasksQuery.data || [],
    accountsAging: accountsAgingQuery.data || [],
    profitLossTrend: profitLossTrendQuery.data || [],
    orderFunnel: orderFunnelQuery.data || [],

    // 狀態（全域：任一載入即 true）
    loading:
      statsQuery.isLoading ||
      trendsQuery.isLoading ||
      expenseQuery.isLoading ||
      tasksQuery.isLoading ||
      accountsAgingQuery.isLoading ||
      profitLossTrendQuery.isLoading ||
      orderFunnelQuery.isLoading,
    // 各區塊獨立 loading，供圖表區塊單獨顯示 Skeleton
    isStatsLoading: statsQuery.isLoading,
    isTrendsLoading: trendsQuery.isLoading,
    isExpensesLoading: expenseQuery.isLoading,
    isTasksLoading: tasksQuery.isLoading,
    isAccountsAgingLoading: accountsAgingQuery.isLoading,
    isProfitLossTrendLoading: profitLossTrendQuery.isLoading,
    isOrderFunnelLoading: orderFunnelQuery.isLoading,
    isFetching:
      statsQuery.isFetching ||
      trendsQuery.isFetching ||
      accountsAgingQuery.isFetching ||
      profitLossTrendQuery.isFetching ||
      orderFunnelQuery.isFetching,
    error:
      statsQuery.error ||
      trendsQuery.error ||
      expenseQuery.error ||
      tasksQuery.error ||
      accountsAgingQuery.error ||
      profitLossTrendQuery.error ||
      orderFunnelQuery.error,

    // 操作
    refresh: () => {
      statsQuery.refetch();
      trendsQuery.refetch();
      expenseQuery.refetch();
      tasksQuery.refetch();
      accountsAgingQuery.refetch();
      profitLossTrendQuery.refetch();
      orderFunnelQuery.refetch();
    },
    lastUpdated: statsQuery.dataUpdatedAt ? new Date(statsQuery.dataUpdatedAt) : null,
  };
};
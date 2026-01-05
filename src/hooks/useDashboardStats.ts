import { useEffect, useState, useRef } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface DashboardStats {
  // 銷售統計
  todaySalesTotal: number;
  monthSalesTotal: number;

  // 採購統計
  monthPurchaseTotal: number;

  // 費用統計
  monthExpenseTotal: number;

  // 數量統計
  supplierCount: number;
  customerCount: number;
  activeProductCount: number;

  // 訂單統計
  pendingOrderCount: number;

  // 財務統計
  accountsPayable: number; // 應付款項
  accountsReceivable: number; // 應收款項

  // 計算指標
  netProfit: number; // 淨利（銷售 - 採購 - 費用）
  profitMargin: number; // 利潤率（%）
}

interface SaleRecord {
  amount: number;
  saleDate: string;
}

interface PurchaseRecord {
  totalAmount: number;
  purchaseDate: string;
  recordStatus?: 'ACTIVE' | 'VOIDED'; // 可能存在的作廢狀態
}

interface ExpenseRecord {
  amount: number;
  expenseDate: string;
  status?: 'ACTIVE' | 'VOIDED';
}

interface OrderRecord {
  orderStatus: string;
  paymentStatus: string;
}

interface APRecord {
  balance: number;
}

interface ARRecord {
  balance: number;
}

/* =========================================================
 * Helper Functions
 * ========================================================= */

// 獲取今天的日期範圍（YYYY-MM-DD）
const getTodayDateRange = () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  return dateStr;
};

// 獲取本月的日期範圍（使用本地時區，避免 UTC 時區問題）
const getMonthDateRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // 使用本地時區格式化日期，避免 UTC 時區導致的日期偏移
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    start: formatLocalDate(firstDay),
    end: formatLocalDate(lastDay),
  };
};

/* =========================================================
 * Hook
 * ========================================================= */

export const useDashboardStats = () => {
  const dataProvider = useDataProvider();
  const dataProviderRef = useRef(dataProvider);
  const [stats, setStats] = useState<DashboardStats>({
    todaySalesTotal: 0,
    monthSalesTotal: 0,
    monthPurchaseTotal: 0,
    monthExpenseTotal: 0,
    supplierCount: 0,
    customerCount: 0,
    activeProductCount: 0,
    pendingOrderCount: 0,
    accountsPayable: 0,
    accountsReceivable: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 更新 ref 以保持 dataProvider 最新
  useEffect(() => {
    dataProviderRef.current = dataProvider;
  }, [dataProvider]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const monthRange = getMonthDateRange();
      const todayDate = getTodayDateRange();

      // 使用 ref 中的 dataProvider 來避免閉包問題
      const dp = dataProviderRef.current;

      // 並行獲取所有數據
      const [
        todaySalesRes,
        monthSalesRes,
        monthPurchasesRes,
        monthExpensesRes,
        suppliersRes,
        customersRes,
        productsRes,
        ordersRes,
        apRes,
        arRes,
      ] = await Promise.all([
        // 今日銷售
        dp.getList("sales", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: { saleDateFrom: todayDate, saleDateTo: todayDate },
        }).catch(() => ({ data: [], total: 0 })),

        // 本月銷售
        dp.getList("sales", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: { saleDateFrom: monthRange.start, saleDateTo: monthRange.end },
        }).catch(() => ({ data: [], total: 0 })),

        // 本月採購（增加 perPage 以获取更多数据，或使用后端过滤）
        dp.getList("purchases", {
          pagination: { page: 1, perPage: 10000 }, // 增加到 10000 以确保获取所有数据
          sort: { field: "id", order: "DESC" },
          filter: { fromDate: monthRange.start, toDate: monthRange.end },
        }).catch(() => ({ data: [], total: 0 })),

        // 本月費用
        dp.getList("expenses", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: { fromDate: monthRange.start, toDate: monthRange.end },
        }).catch(() => ({ data: [], total: 0 })),

        // 供應商（激活的）
        dp.get("suppliers/active").catch(() => ({ data: [] })),

        // 客戶（所有）
        dp.getList("order_customers", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),

        // 商品（啟用的）
        dp.getList("products", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: { active: true },
        }).catch(() => ({ data: [], total: 0 })),

        // 訂單（待處理的）
        dp.getList("orders", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),

        // 應付款項
        dp.getList("ap", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),

        // 應收款項
        dp.getList("ar", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),
      ]);

      // 處理數據
      const todaySalesData = Array.isArray(todaySalesRes.data)
        ? todaySalesRes.data
        : (todaySalesRes.data as any)?.content ?? [];
      const todaySalesTotal = (todaySalesData as SaleRecord[]).reduce(
        (sum, sale) => sum + (sale.amount || 0),
        0
      );

      const monthSalesData = Array.isArray(monthSalesRes.data)
        ? monthSalesRes.data
        : (monthSalesRes.data as any)?.content ?? [];
      const monthSalesTotal = (monthSalesData as SaleRecord[]).reduce(
        (sum, sale) => sum + (sale.amount || 0),
        0
      );

      const monthPurchasesData = Array.isArray(monthPurchasesRes.data)
        ? monthPurchasesRes.data
        : (monthPurchasesRes.data as any)?.content ?? [];

      // 客户端日期过滤和状态过滤（双重保险，确保只计算本月的有效采购）
      const filteredMonthPurchases = (monthPurchasesData as PurchaseRecord[]).filter((purchase) => {
        // 过滤作废的记录（如果有 recordStatus 字段）
        if (purchase.recordStatus === 'VOIDED') return false;

        // 日期过滤
        if (!purchase.purchaseDate) return false;
        try {
          // 处理日期字符串（可能是 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss 格式）
          const purchaseDateStr = purchase.purchaseDate.split('T')[0].split(' ')[0]; // 处理带时间的日期
          const isInRange = purchaseDateStr >= monthRange.start && purchaseDateStr <= monthRange.end;

          return isInRange;
        } catch (error) {
          console.warn('[Dashboard] 采购日期解析错误:', purchase.purchaseDate, error);
          return false;
        }
      });

      const monthPurchaseTotal = filteredMonthPurchases.reduce(
        (sum, purchase) => sum + (purchase.totalAmount || 0),
        0
      );

      // 开发环境调试日志
      if (import.meta.env.DEV) {
        console.log('[Dashboard] 本月采购统计:', {
          monthRange,
          totalRecords: monthPurchasesData.length,
          filteredRecords: filteredMonthPurchases.length,
          monthPurchaseTotal,
        });
      }

      const monthExpensesData = Array.isArray(monthExpensesRes.data)
        ? monthExpensesRes.data
        : (monthExpensesRes.data as any)?.content ?? [];
      const monthExpenseTotal = (monthExpensesData as ExpenseRecord[])
        .filter((expense) => expense.status !== 'VOIDED')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      // 供應商數據處理（suppliers/active 返回的是 { data: [...] } 格式）
      const suppliersData = Array.isArray(suppliersRes.data)
        ? suppliersRes.data
        : [];
      const supplierCount = suppliersData.length;

      const customersData = Array.isArray(customersRes.data)
        ? customersRes.data
        : (customersRes.data as any)?.content ?? [];
      const customerCount = customersData.length;

      const productsData = Array.isArray(productsRes.data)
        ? productsRes.data
        : (productsRes.data as any)?.content ?? [];
      const activeProductCount = productsData.length;

      const ordersData = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : (ordersRes.data as any)?.content ?? [];
      const pendingOrderCount = (ordersData as OrderRecord[]).filter(
        (order) => order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED'
      ).length;

      const apData = Array.isArray(apRes.data)
        ? apRes.data
        : (apRes.data as any)?.content ?? [];
      const accountsPayable = (apData as APRecord[]).reduce(
        (sum, ap) => sum + (ap.balance || 0),
        0
      );

      const arData = Array.isArray(arRes.data)
        ? arRes.data
        : (arRes.data as any)?.content ?? [];
      const accountsReceivable = (arData as ARRecord[]).reduce(
        (sum, ar) => sum + (ar.balance || 0),
        0
      );

      // 計算淨利和利潤率
      const netProfit = monthSalesTotal - monthPurchaseTotal - monthExpenseTotal;
      const profitMargin =
        monthSalesTotal > 0 ? (netProfit / monthSalesTotal) * 100 : 0;

      setStats({
        todaySalesTotal,
        monthSalesTotal,
        monthPurchaseTotal,
        monthExpenseTotal,
        supplierCount,
        customerCount,
        activeProductCount,
        pendingOrderCount,
        accountsPayable,
        accountsReceivable,
        netProfit,
        profitMargin,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("❌ 載入儀表板統計失敗：", err);
      setError(err instanceof Error ? err : new Error("載入統計數據失敗"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在組件掛載時執行一次，避免重複請求造成閃爍

  return { stats, loading, error, refresh: fetchStats, lastUpdated };
};


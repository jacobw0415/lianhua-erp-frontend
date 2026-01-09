import { useDataProvider } from "react-admin";
// 確保已安裝 @tanstack/react-query
import { useQuery } from "@tanstack/react-query";

/* =========================================================
 * 型別定義
 * ========================================================= */

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
}

// 預設空數據
const DEFAULT_STATS: DashboardStats = {
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
};

interface SaleRecord {
  amount: number;
  saleDate: string;
}

interface PurchaseRecord {
  totalAmount: number;
  purchaseDate: string;
  recordStatus?: 'ACTIVE' | 'VOIDED';
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

// 響應數據類型定義
interface StandardListResponse<T> {
  data: T[];
  total: number;
}

interface WrappedListResponse<T> {
  data: {
    content: T[];
  };
}

type ListResponse<T> = StandardListResponse<T> | WrappedListResponse<T>;

interface StandardGetResponse<T> {
  data: T;
}

interface ArrayGetResponse<T> {
  data: T[];
}

type GetResponse<T> = StandardGetResponse<T> | ArrayGetResponse<T>;

/* =========================================================
 * Helper Functions
 * ========================================================= */

const getTodayDateRange = () => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0];
  return dateStr;
};

const getMonthDateRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

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

const extractArrayData = <T>(response: ListResponse<T> | GetResponse<T> | any): T[] => {
  if (!response) return [];
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (
    typeof response.data === 'object' &&
    response.data !== null &&
    'content' in response.data &&
    Array.isArray((response.data as { content: T[] }).content)
  ) {
    return (response.data as { content: T[] }).content;
  }
  // 處理可能的特殊格式
  if (Array.isArray(response)) return response;
  return [];
};

/* =========================================================
 * Hook: useDashboardStats
 * ========================================================= */

const STALE_TIME = 5 * 60 * 1000; // 5 分鐘緩存

export const useDashboardStats = () => {
  const dataProvider = useDataProvider();

  // 1. 建立 Query
  const queryInfo = useQuery({
    queryKey: ['dashboardStats'], // Dashboard 數據的唯一 Key
    
    // 2. 查詢函數
    queryFn: async () => {
      const monthRange = getMonthDateRange();
      const todayDate = getTodayDateRange();

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
        dataProvider.getList("sales", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: { saleDateFrom: todayDate, saleDateTo: todayDate },
        }).catch(() => ({ data: [], total: 0 })),

        // 本月銷售
        dataProvider.getList("sales", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: { saleDateFrom: monthRange.start, saleDateTo: monthRange.end },
        }).catch(() => ({ data: [], total: 0 })),

        // 本月採購
        dataProvider.getList("purchases", {
          pagination: { page: 1, perPage: 10000 }, // 注意：大量數據會影響效能
          sort: { field: "id", order: "DESC" },
          filter: { fromDate: monthRange.start, toDate: monthRange.end },
        }).catch(() => ({ data: [], total: 0 })),

        // 本月費用
        dataProvider.getList("expenses", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: { fromDate: monthRange.start, toDate: monthRange.end },
        }).catch(() => ({ data: [], total: 0 })),

        // 供應商
        dataProvider.get("suppliers/active").catch(() => ({ data: [] })),

        // 客戶
        dataProvider.getList("order_customers", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),

        // 商品
        dataProvider.getList("products", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: { active: true },
        }).catch(() => ({ data: [], total: 0 })),

        // 訂單
        dataProvider.getList("orders", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "DESC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),

        // 應付
        dataProvider.getList("ap", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),

        // 應收
        dataProvider.getList("ar", {
          pagination: { page: 1, perPage: 1000 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        }).catch(() => ({ data: [], total: 0 })),
      ]);

      // --- 數據計算邏輯 ---

      // 1. 銷售計算
      const todaySalesData = extractArrayData<SaleRecord>(todaySalesRes);
      const todaySalesTotal = todaySalesData.reduce((sum, sale) => sum + (sale.amount || 0), 0);

      const monthSalesData = extractArrayData<SaleRecord>(monthSalesRes);
      const monthSalesTotal = monthSalesData.reduce((sum, sale) => sum + (sale.amount || 0), 0);

      // 2. 採購計算
      const monthPurchasesData = extractArrayData<PurchaseRecord>(monthPurchasesRes);
      const filteredMonthPurchases = monthPurchasesData.filter((purchase) => {
        if (purchase.recordStatus === 'VOIDED') return false;
        if (!purchase.purchaseDate) return false;
        try {
          const purchaseDateStr = purchase.purchaseDate.split('T')[0].split(' ')[0];
          return purchaseDateStr >= monthRange.start && purchaseDateStr <= monthRange.end;
        } catch {
          return false;
        }
      });
      const monthPurchaseTotal = filteredMonthPurchases.reduce((sum, purchase) => sum + (purchase.totalAmount || 0), 0);

      // 3. 費用計算
      const monthExpensesData = extractArrayData<ExpenseRecord>(monthExpensesRes);
      const monthExpenseTotal = monthExpensesData
        .filter((expense) => expense.status !== 'VOIDED')
        .reduce((sum, expense) => sum + (expense.amount || 0), 0);

      // 4. 數量計算
      const suppliersData = Array.isArray(suppliersRes.data) ? suppliersRes.data : [];
      const customersData = extractArrayData(customersRes);
      const productsData = extractArrayData(productsRes);
      
      const ordersData = extractArrayData<OrderRecord>(ordersRes);
      const pendingOrderCount = ordersData.filter(
        (order) => order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED'
      ).length;

      // 5. 財務計算
      const apData = extractArrayData<APRecord>(apRes);
      const accountsPayable = apData.reduce((sum, ap) => sum + (ap.balance || 0), 0);

      const arData = extractArrayData<ARRecord>(arRes);
      const accountsReceivable = arData.reduce((sum, ar) => sum + (ar.balance || 0), 0);

      // 6. 利潤計算
      const netProfit = monthSalesTotal - monthPurchaseTotal - monthExpenseTotal;
      const profitMargin = monthSalesTotal > 0 ? (netProfit / monthSalesTotal) * 100 : 0;

      return {
        todaySalesTotal,
        monthSalesTotal,
        monthPurchaseTotal,
        monthExpenseTotal,
        supplierCount: suppliersData.length,
        customerCount: customersData.length,
        activeProductCount: productsData.length,
        pendingOrderCount,
        accountsPayable,
        accountsReceivable,
        netProfit,
        profitMargin,
      } as DashboardStats;
    },

    // ★ 關鍵設定：資料快取時間 (5分鐘)
    staleTime: STALE_TIME,

    // ★ 關鍵設定：防閃爍 (保留舊數據直到新數據加載完成)
    placeholderData: (previousData) => previousData,
    
    // 失敗重試 1 次
    retry: 1,
  });

  return {
    // 如果是第一次加載且沒有快取，回傳預設值
    stats: queryInfo.data || DEFAULT_STATS,
    // 只有在完全沒有數據且正在加載時，才視為 loading (顯示骨架屏)
    loading: queryInfo.isLoading && !queryInfo.data,
    // 背景更新狀態 (可選用)
    isFetching: queryInfo.isFetching,
    error: queryInfo.error as Error | null,
    refresh: queryInfo.refetch,
    lastUpdated: queryInfo.dataUpdatedAt ? new Date(queryInfo.dataUpdatedAt) : null,
  };
};
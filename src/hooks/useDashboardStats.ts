import { useDataProvider } from "react-admin";
import { useQuery } from "@tanstack/react-query";

/**
 * 📊 與後端 DashboardStatsDto 完全對齊的型別定義
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
  todayReceiptsTotal: 0,
  todayTotalInflow: 0,
  monthTotalReceived: 0,
  upcomingAR: 0,
};

const STALE_TIME = 5 * 60 * 1000; // 5 分鐘快取

export const useDashboardStats = () => {
  const dataProvider = useDataProvider();

  const queryInfo = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      /**
       * ⭐ 關鍵修正：不再發送 10 個 getList 請求
       * 改為呼叫單一聚合接口，由後端 SQL 直接產出正確數字
       */
      const response = await dataProvider.get('dashboard/stats');
      
      // dataProvider.get 已經透過 httpClientSafe 解析了 ApiResponseDto.data
      return response.data as DashboardStats;
    },
    staleTime: STALE_TIME,
    refetchOnMount: "always", 
    refetchOnWindowFocus: true, // 當瀏覽器分頁切換回來時也自動更新
    gcTime: 1000 * 60 * 10,     // 快取保留 10 分鐘 (垃圾回收)
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  return {
    stats: queryInfo.data || DEFAULT_STATS,
    loading: queryInfo.isLoading && !queryInfo.data,
    isFetching: queryInfo.isFetching,
    error: queryInfo.error as Error | null,
    refresh: queryInfo.refetch,
    lastUpdated: queryInfo.dataUpdatedAt ? new Date(queryInfo.dataUpdatedAt) : null,
  };
};
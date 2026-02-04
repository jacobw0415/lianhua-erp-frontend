import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { useDashboardDerivedData } from '@/hooks/useDashboardDerivedData';
import { useCanViewCostStructure } from '@/hooks/useCanViewCostStructure';
import type { DashboardFiltersState } from '@/hooks/useDashboardFilters';
import type { DashboardStats, TrendPoint, OrderFunnelPoint } from '@/hooks/useDashboardStats';
import type {
  BreakEvenPoint,
  LiquiditySnapshot,
  CashflowForecastPoint,
  ProductParetoPoint,
  SupplierConcentrationPoint,
  CustomerRetentionPoint,
  PurchaseStructurePoint,
  CustomerConcentrationPoint,
} from '@/hooks/useDashboardAnalytics';

/* =========================================================
 * 儀表板 Context 型別
 * ========================================================= */

export interface DashboardContextValue {
  filters: DashboardFiltersState;
  stats: DashboardStats;
  trends: TrendPoint[] | undefined;
  expenses: { category: string; amount: number }[];
  tasks: { type: string; referenceNo: string; targetName: string; dueDate: string; amount: number }[] | undefined;
  accountsAging: unknown[];
  profitLossTrend: unknown[];
  orderFunnel: OrderFunnelPoint[] | undefined;
  loading: boolean;
  isTrendsLoading: boolean;
  isExpensesLoading: boolean;
  isAccountsAgingLoading: boolean;
  isProfitLossTrendLoading: boolean;
  isOrderFunnelLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | string | null;
  breakEven: BreakEvenPoint[];
  liquidity: LiquiditySnapshot | null;
  cashflowForecast: CashflowForecastPoint[];
  productPareto: ProductParetoPoint[];
  supplierConcentration: SupplierConcentrationPoint[];
  customerRetention: CustomerRetentionPoint[];
  purchaseStructure: PurchaseStructurePoint[] | undefined;
  customerConcentration: CustomerConcentrationPoint[] | undefined;
  isBreakEvenLoading: boolean;
  isLiquidityLoading: boolean;
  isCashflowForecastLoading: boolean;
  isProductParetoLoading: boolean;
  isSupplierConcentrationLoading: boolean;
  isCustomerRetentionLoading: boolean;
  isPurchaseStructureLoading: boolean;
  isCustomerConcentrationLoading: boolean;
  refetchAnalytics: () => Promise<void>;
  derived: {
    safeTrendData: TrendPoint[];
    purchaseStructureDisplay: { itemName: string; totalAmount: number }[];
    customerConcentrationDonutData: { name: string; value: number }[];
    customerConcentrationWarning: boolean;
    customerRetentionDisplay: unknown[];
    pareto80Threshold: number;
    orderFunnelDisplay: { stage: string; stageLabel: string; totalAmount?: number; orderCount?: number }[];
    isBreakEvenCurrentOrFutureMonth: boolean;
  };
  canViewCostStructure: boolean;
  handleRefresh: () => Promise<void>;
  isRefreshing: boolean;
  hasMounted: boolean;
  currentTime: Date;
}

const defaultContextValue: DashboardContextValue = {
  filters: {} as DashboardFiltersState,
  stats: {} as DashboardStats,
  trends: undefined,
  expenses: [],
  tasks: undefined,
  accountsAging: [],
  profitLossTrend: [],
  orderFunnel: undefined,
  loading: false,
  isTrendsLoading: false,
  isExpensesLoading: false,
  isAccountsAgingLoading: false,
  isProfitLossTrendLoading: false,
  isOrderFunnelLoading: false,
  error: null,
  refresh: async () => { },
  lastUpdated: null,
  breakEven: [],
  liquidity: null,
  cashflowForecast: [],
  productPareto: [],
  supplierConcentration: [],
  customerRetention: [],
  purchaseStructure: undefined,
  customerConcentration: undefined,
  isBreakEvenLoading: false,
  isLiquidityLoading: false,
  isCashflowForecastLoading: false,
  isProductParetoLoading: false,
  isSupplierConcentrationLoading: false,
  isCustomerRetentionLoading: false,
  isPurchaseStructureLoading: false,
  isCustomerConcentrationLoading: false,
  refetchAnalytics: async () => { },
  derived: {
    safeTrendData: [],
    purchaseStructureDisplay: [],
    customerConcentrationDonutData: [],
    customerConcentrationWarning: false,
    customerRetentionDisplay: [],
    pareto80Threshold: 0,
    orderFunnelDisplay: [],
    isBreakEvenCurrentOrFutureMonth: false,
  },
  canViewCostStructure: false,
  handleRefresh: async () => { },
  isRefreshing: false,
  hasMounted: false,
  currentTime: new Date(),
};

export const DashboardContext = createContext<DashboardContextValue>(defaultContextValue);

export function useDashboardContext(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (ctx === undefined || (ctx as unknown) === defaultContextValue) {
    throw new Error('useDashboardContext must be used within DashboardProvider');
  }
  return ctx;
}

/* =========================================================
 * DashboardProvider：集中呼叫 hooks，提供給子元件
 * ========================================================= */

interface DashboardProviderProps {
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const filters = useDashboardFilters();
  const {
    trendDays,
    profitLossMonths,
    clampedRange,
    breakEvenPeriod,
    retentionDormantOnly,
    clampedCashflowRange,
    clampedCustomerConcentrationRange,
  } = filters;

  const statsResult = useDashboardStats(trendDays, {
    months: profitLossMonths,
    days: 30,
    expenseDateRange: clampedRange,
  });

  const {
    stats,
    trends,
    expenses,
    tasks,
    accountsAging,
    profitLossTrend,
    orderFunnel,
    loading,
    isTrendsLoading,
    isExpensesLoading,
    isAccountsAgingLoading,
    isProfitLossTrendLoading,
    isOrderFunnelLoading,
    error,
    refresh,
    lastUpdated,
  } = statsResult;

  const analyticsResult = useDashboardAnalytics({
    breakEvenPeriod,
    dateRange: clampedRange,
    cashflowDateRange: clampedCashflowRange,
    retentionDormantOnly,
    customerConcentrationDateRange: clampedCustomerConcentrationRange,
  });

  const {
    breakEven,
    liquidity,
    cashflowForecast,
    productPareto,
    supplierConcentration,
    customerRetention,
    purchaseStructure,
    customerConcentration,
    isBreakEvenLoading,
    isLiquidityLoading,
    isCashflowForecastLoading,
    isProductParetoLoading,
    isSupplierConcentrationLoading,
    isCustomerRetentionLoading,
    isPurchaseStructureLoading,
    isCustomerConcentrationLoading,
    refetch: refetchAnalytics,
  } = analyticsResult;

  const derived = useDashboardDerivedData({
    trends,
    trendDays,
    orderFunnel,
    orderFunnelMetric: filters.orderFunnelMetric,
    productPareto,
    purchaseStructure,
    customerConcentration,
    customerRetention,
    retentionDormantOnly,
    stats,
    breakEvenPeriod,
  });

  const canViewCostStructure = useCanViewCostStructure();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refresh(), refetchAnalytics()]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh, refetchAnalytics]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const now = new Date();
    const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timer = setTimeout(() => {
      updateTime();
      intervalId = setInterval(updateTime, 60000);
    }, msUntilNextMinute);
    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const value = useMemo<DashboardContextValue>(
    () => ({
      filters,
      stats,
      trends,
      expenses,
      tasks,
      accountsAging,
      profitLossTrend,
      orderFunnel,
      loading,
      isTrendsLoading,
      isExpensesLoading,
      isAccountsAgingLoading,
      isProfitLossTrendLoading,
      isOrderFunnelLoading,
      error,
      refresh,
      lastUpdated,
      breakEven,
      liquidity,
      cashflowForecast,
      productPareto,
      supplierConcentration,
      customerRetention,
      purchaseStructure,
      customerConcentration,
      isBreakEvenLoading,
      isLiquidityLoading,
      isCashflowForecastLoading,
      isProductParetoLoading,
      isSupplierConcentrationLoading,
      isCustomerRetentionLoading,
      isPurchaseStructureLoading,
      isCustomerConcentrationLoading,
      refetchAnalytics,
      derived,
      canViewCostStructure,
      handleRefresh,
      isRefreshing,
      hasMounted,
      currentTime,
    }),
    [
      filters,
      stats,
      trends,
      expenses,
      tasks,
      accountsAging,
      profitLossTrend,
      orderFunnel,
      loading,
      isTrendsLoading,
      isExpensesLoading,
      isAccountsAgingLoading,
      isProfitLossTrendLoading,
      isOrderFunnelLoading,
      error,
      refresh,
      lastUpdated,
      breakEven,
      liquidity,
      cashflowForecast,
      productPareto,
      supplierConcentration,
      customerRetention,
      purchaseStructure,
      customerConcentration,
      isBreakEvenLoading,
      isLiquidityLoading,
      isCashflowForecastLoading,
      isProductParetoLoading,
      isSupplierConcentrationLoading,
      isCustomerRetentionLoading,
      isPurchaseStructureLoading,
      isCustomerConcentrationLoading,
      refetchAnalytics,
      derived,
      canViewCostStructure,
      handleRefresh,
      isRefreshing,
      hasMounted,
      currentTime,
    ]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

DashboardProvider.displayName = 'DashboardProvider';

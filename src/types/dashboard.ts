/**
 * 儀表板模組共用型別（集中管理，供 hooks / 元件 / 常數使用）
 */
import type { ReactNode } from 'react';

export type {
  DashboardStats,
  TrendPoint,
  ExpenseComposition,
  DashboardTask,
  SalesCompositionPoint,
  AccountAgingBucket,
  ProfitLossPoint,
  OrderFunnelPoint,
} from '@/hooks/useDashboardStats';

export type {
  BreakEvenPoint,
  LiquiditySnapshot,
  CashflowForecastPoint,
  ProductParetoPoint,
  SupplierConcentrationPoint,
  CustomerRetentionPoint,
  PurchaseStructurePoint,
  CustomerConcentrationPoint,
  DashboardAnalyticsFilters,
} from '@/hooks/useDashboardAnalytics';

export type { DashboardFiltersState } from '@/hooks/useDashboardFilters';

export type {
  UseDashboardDerivedDataParams,
  PurchaseStructureDisplayItem,
  CustomerConcentrationDonutItem,
  OrderFunnelDisplayItem,
} from '@/hooks/useDashboardDerivedData';

export interface DashboardAlertItem {
  label: string;
  path: string;
  color: 'warning' | 'error';
  icon?: ReactNode;
}

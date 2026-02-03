import { useMemo } from 'react';
import dayjs from 'dayjs';
import { ORDER_STAGE_LABELS } from '@/constants/dashboardConstants';
import type { DashboardStats, OrderFunnelPoint } from '@/hooks/useDashboardStats';
import type {
  ProductParetoPoint,
  PurchaseStructurePoint,
  CustomerConcentrationPoint,
  CustomerRetentionPoint,
} from '@/hooks/useDashboardAnalytics';

interface TrendPoint {
  date: string;
  saleAmount: number;
  receiptAmount: number;
}

export interface UseDashboardDerivedDataParams {
  trends: TrendPoint[] | undefined;
  trendDays: number;
  orderFunnel: OrderFunnelPoint[] | undefined;
  orderFunnelMetric: 'amount' | 'count';
  productPareto: ProductParetoPoint[];
  purchaseStructure: PurchaseStructurePoint[] | undefined;
  customerConcentration: CustomerConcentrationPoint[] | undefined;
  customerRetention: CustomerRetentionPoint[];
  retentionDormantOnly: boolean;
  stats: DashboardStats;
  breakEvenPeriod: string;
}

export interface PurchaseStructureDisplayItem {
  itemName: string;
  totalAmount: number;
}

export interface CustomerConcentrationDonutItem {
  name: string;
  value: number;
}

export interface OrderFunnelDisplayItem {
  stage: string;
  stageLabel: string;
  totalAmount?: number;
  orderCount?: number;
}

export interface DashboardAlert {
  label: string;
  path: string;
  color: 'warning' | 'error';
  icon: React.ReactNode;
}

export interface QuickActionItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  color: 'primary' | 'secondary' | 'error' | 'info';
}

export function useDashboardDerivedData(params: UseDashboardDerivedDataParams) {
  const {
    trends,
    trendDays,
    orderFunnel,
    orderFunnelMetric,
    productPareto,
    purchaseStructure,
    customerConcentration,
    customerRetention,
    retentionDormantOnly,
    stats,
    breakEvenPeriod,
  } = params;

  const safeTrendData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    return trends.slice(-trendDays);
  }, [trends, trendDays]);

  const purchaseStructureDisplay = useMemo((): PurchaseStructureDisplayItem[] => {
    if (!purchaseStructure?.length) return [];
    const sorted = [...purchaseStructure].sort(
      (a, b) => Number(b.totalAmount) - Number(a.totalAmount)
    );
    if (sorted.length <= 8) return sorted;
    const top8 = sorted.slice(0, 8);
    const otherSum = sorted.slice(8).reduce((sum, d) => sum + Number(d.totalAmount), 0);
    return [...top8, { itemName: '其他', totalAmount: otherSum }];
  }, [purchaseStructure]);

  const customerConcentrationDonutData = useMemo((): CustomerConcentrationDonutItem[] => {
    if (!customerConcentration?.length) return [];
    return customerConcentration.map((d) => ({
      name: d.customerName,
      value: Number(d.totalAmount),
    }));
  }, [customerConcentration]);

  const top3RatioSum = useMemo(() => {
    if (!customerConcentration?.length) return 0;
    return customerConcentration.slice(0, 3).reduce((sum, d) => sum + Number(d.ratio), 0);
  }, [customerConcentration]);

  const customerConcentrationWarning = top3RatioSum > 70;

  const customerRetentionDisplay = useMemo(() => {
    if (!customerRetention.length) return [];
    if (!retentionDormantOnly) return customerRetention;
    return customerRetention.filter(
      (r) =>
        r.daysSinceLastOrder > 60 ||
        (r.status && String(r.status).includes('沉睡'))
    );
  }, [customerRetention, retentionDormantOnly]);

  const pareto80Threshold = useMemo(() => {
    if (!productPareto?.length) return 0;
    const total = productPareto.reduce((sum, d) => sum + Number(d.totalAmount ?? 0), 0);
    return total * 0.8;
  }, [productPareto]);

  const orderFunnelDisplay = useMemo((): OrderFunnelDisplayItem[] => {
    if (!orderFunnel?.length) return [];
    const dataKey = orderFunnelMetric === 'amount' ? 'totalAmount' : 'orderCount';
    return [...orderFunnel]
      .sort((a, b) => Number(b[dataKey] ?? 0) - Number(a[dataKey] ?? 0))
      .map((item) => ({
        ...item,
        stageLabel: ORDER_STAGE_LABELS[item.stage] ?? item.stage,
      })) as OrderFunnelDisplayItem[];
  }, [orderFunnel, orderFunnelMetric]);

  const isBreakEvenCurrentOrFutureMonth = useMemo(
    () => breakEvenPeriod >= dayjs().format('YYYY-MM'),
    [breakEvenPeriod]
  );

  return {
    safeTrendData,
    purchaseStructureDisplay,
    customerConcentrationDonutData,
    top3RatioSum,
    customerConcentrationWarning,
    customerRetentionDisplay,
    pareto80Threshold,
    orderFunnelDisplay,
    isBreakEvenCurrentOrFutureMonth,
  };
}

/**
 * 儀表板共用常數
 */

/** 訂單履約階段顯示名稱 */
export const ORDER_STAGE_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已確認',
  DELIVERED: '已出貨',
  INVOICED: '已開票',
  PAID: '已收款',
  CANCELLED: '已取消',
};

/** 儀表板區塊網格設定（響應式） */
export const DASHBOARD_GRID = {
  columns: { xs: '1fr', md: '1fr 1fr' as const },
  gap: 2,
  mb: 2,
} as const;

/** 快速操作設定（label, path, color；icon 由頁面依 key 對應） */
export const QUICK_ACTIONS_CONFIG = [
  { label: '新增銷售', path: '/sales/create', color: 'primary' as const },
  { label: '新增進貨', path: '/purchases/create', color: 'secondary' as const },
  { label: '新增支出', path: '/expenses/create', color: 'error' as const },
  { label: '新增訂單', path: '/orders/create', color: 'info' as const },
] as const;

/** 待辦／預警閾值：應付帳款超過此金額顯示「應付帳款偏高」 */
export const ALERT_AP_WARNING_THRESHOLD = 100_000;

/** Snackbar 顯示時長（ms） */
export const DASHBOARD_SNACKBAR_DURATION_MS = 3000;

import type { DashboardStats } from '@/hooks/useDashboardStats';
import type { STAT_CARD_COLORS } from '@/constants/chartColors';

/** Stat 區塊設定：由 config 驅動，避免重複與錯漏 */
export type StatItemFormat = 'currency' | 'number' | 'percent';
export type StatSectionItemConfig = {
  title: string;
  iconKey: string;
  iconColorKey: keyof typeof STAT_CARD_COLORS;
  valueKey: keyof DashboardStats;
  format: StatItemFormat;
  path?: string;
  /** 僅用於 percent：依正負顯示 success/error 色 */
  colorBySign?: boolean;
};
export type StatSectionConfig = {
  id: string;
  title: string;
  titleIconKey: string;
  items: StatSectionItemConfig[];
};

export const STAT_SECTIONS_CONFIG: StatSectionConfig[] = [
  {
    id: 'financial',
    title: '財務指標',
    titleIconKey: 'AccountBalanceWallet',
    items: [
      { title: '本月銷售總額', iconKey: 'MonetizationOn', iconColorKey: 'netProfit', valueKey: 'monthSalesTotal', format: 'currency', path: '/sales' },
      { title: '應收帳款 (AR)', iconKey: 'AccountBalanceWallet', iconColorKey: 'ar', valueKey: 'accountsReceivable', format: 'currency', path: '/ar' },
      { title: '應付帳款 (AP)', iconKey: 'MoneyOff', iconColorKey: 'ap', valueKey: 'accountsPayable', format: 'currency', path: '/ap' },
      { title: '淨利率', iconKey: 'Assessment', iconColorKey: 'revenue', valueKey: 'profitMargin', format: 'percent', colorBySign: true },
    ],
  },
  {
    id: 'operations',
    title: '營運概況',
    titleIconKey: 'Assessment',
    items: [
      { title: '今日營收', iconKey: 'MonetizationOn', iconColorKey: 'revenue', valueKey: 'todaySalesTotal', format: 'currency', path: '/sales' },
      { title: '本月採購', iconKey: 'ShoppingCart', iconColorKey: 'purchase', valueKey: 'monthPurchaseTotal', format: 'currency', path: '/purchases' },
      { title: '本月費用', iconKey: 'Receipt', iconColorKey: 'expense', valueKey: 'monthExpenseTotal', format: 'currency', path: '/expenses' },
      { title: '本月淨利', iconKey: 'TrendingUp', iconColorKey: 'revenue', valueKey: 'netProfit', format: 'currency', colorBySign: true },
    ],
  },
  {
    id: 'cashflow',
    title: '現金流量',
    titleIconKey: 'Payments',
    items: [
      { title: '今日訂單收款', iconKey: 'Receipt', iconColorKey: 'revenue', valueKey: 'todayReceiptsTotal', format: 'currency', path: '/receipts' },
      { title: '今日總入金', iconKey: 'AccountBalance', iconColorKey: 'info', valueKey: 'todayTotalInflow', format: 'currency' },
      { title: '本月累計實收', iconKey: 'History', iconColorKey: 'netProfit', valueKey: 'monthTotalReceived', format: 'currency' },
      { title: '即期應收 (7D)', iconKey: 'EventNote', iconColorKey: 'ap', valueKey: 'upcomingAR', format: 'currency', path: '/ar' },
    ],
  },
  {
    id: 'business',
    title: '業務概況',
    titleIconKey: 'Store',
    items: [
      { title: '合作供應商', iconKey: 'Store', iconColorKey: 'secondary', valueKey: 'supplierCount', format: 'number', path: '/suppliers' },
      { title: '累計客戶', iconKey: 'People', iconColorKey: 'secondary', valueKey: 'customerCount', format: 'number', path: '/order_customers' },
      { title: '上架商品', iconKey: 'Inventory', iconColorKey: 'info', valueKey: 'activeProductCount', format: 'number', path: '/products' },
      { title: '未結案訂單', iconKey: 'PendingActions', iconColorKey: 'warning', valueKey: 'pendingOrderCount', format: 'number', path: '/orders' },
    ],
  },
];

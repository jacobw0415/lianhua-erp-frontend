import type { DashboardStats } from '@/hooks/useDashboardStats';
import type { STAT_CARD_COLORS } from '@/constants/chartColors';

/**
 * 儀表板共用常數（文案鍵對應 `locales/<lang>/dashboard.json`）
 */

/** 儀表板區塊網格設定（響應式） */
export const DASHBOARD_GRID = {
  columns: { xs: '1fr', sm: '1fr', md: '1fr 1fr' as const },
  gap: 2,
  mb: 2,
} as const;

/** 快速操作設定（labelKey 為 dashboard 命名空間鍵，不含前綴） */
export const QUICK_ACTIONS_CONFIG = [
  { labelKey: 'quickActions.addSale', path: '/sales/create', color: 'primary' as const },
  { labelKey: 'quickActions.addPurchase', path: '/purchases/create', color: 'secondary' as const },
  { labelKey: 'quickActions.addExpense', path: '/expenses/create', color: 'error' as const },
  { labelKey: 'quickActions.addOrder', path: '/orders/create', color: 'info' as const },
] as const;

/** 待辦／預警閾值：應付帳款超過此金額顯示「應付帳款偏高」 */
export const ALERT_AP_WARNING_THRESHOLD = 100_000;

/** Snackbar 顯示時長（ms） */
export const DASHBOARD_SNACKBAR_DURATION_MS = 3000;

/** Stat 區塊設定：由 config 驅動，避免重複與錯漏 */
export type StatItemFormat = 'currency' | 'number' | 'percent';
export type StatSectionItemConfig = {
  iconKey: string;
  iconColorKey: keyof typeof STAT_CARD_COLORS;
  valueKey: keyof DashboardStats;
  format: StatItemFormat;
  path?: string;
  /** 僅用於 percent：依正負顯示 success/error 色 */
  colorBySign?: boolean;
};
export type StatSectionConfig = {
  id: 'financial' | 'operations' | 'cashflow' | 'business';
  titleIconKey: string;
  items: StatSectionItemConfig[];
};

export const STAT_SECTIONS_CONFIG: StatSectionConfig[] = [
  {
    id: 'financial',
    titleIconKey: 'AccountBalanceWallet',
    items: [
      { iconKey: 'MonetizationOn', iconColorKey: 'netProfit', valueKey: 'monthSalesTotal', format: 'currency', path: '/sales' },
      { iconKey: 'AccountBalanceWallet', iconColorKey: 'ar', valueKey: 'accountsReceivable', format: 'currency', path: '/ar' },
      { iconKey: 'MoneyOff', iconColorKey: 'ap', valueKey: 'accountsPayable', format: 'currency', path: '/ap' },
      { iconKey: 'Assessment', iconColorKey: 'revenue', valueKey: 'profitMargin', format: 'percent', colorBySign: true },
    ],
  },
  {
    id: 'operations',
    titleIconKey: 'Assessment',
    items: [
      { iconKey: 'MonetizationOn', iconColorKey: 'revenue', valueKey: 'todaySalesTotal', format: 'currency', path: '/sales' },
      { iconKey: 'ShoppingCart', iconColorKey: 'purchase', valueKey: 'monthPurchaseTotal', format: 'currency', path: '/purchases' },
      { iconKey: 'Receipt', iconColorKey: 'expense', valueKey: 'monthExpenseTotal', format: 'currency', path: '/expenses' },
      { iconKey: 'TrendingUp', iconColorKey: 'revenue', valueKey: 'netProfit', format: 'currency', colorBySign: true },
    ],
  },
  {
    id: 'cashflow',
    titleIconKey: 'Payments',
    items: [
      { iconKey: 'Receipt', iconColorKey: 'revenue', valueKey: 'todayReceiptsTotal', format: 'currency', path: '/receipts' },
      { iconKey: 'AccountBalance', iconColorKey: 'info', valueKey: 'todayTotalInflow', format: 'currency' },
      { iconKey: 'History', iconColorKey: 'netProfit', valueKey: 'monthTotalReceived', format: 'currency' },
      { iconKey: 'EventNote', iconColorKey: 'ap', valueKey: 'upcomingAR', format: 'currency', path: '/ar' },
    ],
  },
  {
    id: 'business',
    titleIconKey: 'Store',
    items: [
      { iconKey: 'Store', iconColorKey: 'secondary', valueKey: 'supplierCount', format: 'number', path: '/suppliers' },
      { iconKey: 'People', iconColorKey: 'secondary', valueKey: 'customerCount', format: 'number', path: '/order_customers' },
      { iconKey: 'Inventory', iconColorKey: 'info', valueKey: 'activeProductCount', format: 'number', path: '/products' },
      { iconKey: 'PendingActions', iconColorKey: 'warning', valueKey: 'pendingOrderCount', format: 'number', path: '/orders' },
    ],
  },
];

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Box,
  Chip,
  Snackbar,
  useTheme,
  Alert as MuiAlert,
  Paper,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarningIcon from '@mui/icons-material/Warning';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TimelineIcon from '@mui/icons-material/Timeline';
import PieChartIcon from '@mui/icons-material/PieChart';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import {
  getDefaultPeriod,
  getDefaultDateRange,
  clampRangeToMaxDays,
  getDefaultCashflowRange,
} from '@/utils/dashboardDateUtils';
import { PlainCurrency } from '@/components/money/PlainCurrency';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { ChartEmptyState } from '@/components/dashboard/ChartEmptyState';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { WelcomeCard, getGreeting } from '@/components/dashboard/WelcomeCard';
import { QuickActionsSection } from '@/components/dashboard/QuickActionsSection';
import { StatSection } from '@/components/dashboard/sections/StatSection';
import { TrendAndExpenseSection } from '@/components/dashboard/sections/TrendAndExpenseSection';
import { AdvancedAnalysisSection } from '@/components/dashboard/sections/AdvancedAnalysisSection';
import { BreakEvenSection } from '@/components/dashboard/sections/BreakEvenSection';
import { ProfitLossSection } from '@/components/dashboard/sections/ProfitLossSection';
import { TaskListSection } from '@/components/dashboard/sections/TaskListSection';
import { CHART_COLORS, STAT_CARD_COLORS } from '@/constants/chartColors';
import { formatPercent, formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle } from '@/utils/chartTooltipStyle';
import { DESIGN_PARETO_REF } from '@/constants/designSystem';

/* =========================================================
 * Helper Functions & Constants
 * ========================================================= */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 (${weekday})`;
};

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/** 訂單履約階段顯示名稱 */
const ORDER_STAGE_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  CONFIRMED: '已確認',
  DELIVERED: '已出貨',
  INVOICED: '已開票',
  PAID: '已收款',
  CANCELLED: '已取消',
};

/* =========================================================
 * Dashboard Component
 * ========================================================= */

const Dashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  // 控制圖表顯示天數（7 / 14 / 30）
  const [trendDays, setTrendDays] = useState(7);

  const [profitLossMonths, setProfitLossMonths] = useState(6);
  const [orderFunnelMetric, setOrderFunnelMetric] = useState<'amount' | 'count'>('amount');

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
  } = useDashboardStats(trendDays, {
    months: profitLossMonths,
    days: 30,
  });

  // 核心圖表分析：篩選狀態（商品 Pareto / 供應商集中度 固定預設區間，無日期選擇器）
  const [breakEvenPeriod, setBreakEvenPeriod] = useState(() => getDefaultPeriod());
  const [retentionDormantOnly, setRetentionDormantOnly] = useState(false);
  const defaultCashflow = useMemo(() => getDefaultCashflowRange(30), []);
  const [cashflowStart, setCashflowStart] = useState(defaultCashflow.start);
  const [cashflowEnd, setCashflowEnd] = useState(defaultCashflow.end);

  const clampedRange = useMemo(() => {
    const def = getDefaultDateRange();
    return clampRangeToMaxDays(def.start, def.end);
  }, []);

  const clampedCashflowRange = useMemo(
    () => clampRangeToMaxDays(cashflowStart, cashflowEnd),
    [cashflowStart, cashflowEnd]
  );

  const {
    breakEven,
    liquidity,
    cashflowForecast,
    productPareto,
    supplierConcentration,
    customerRetention,
    isBreakEvenLoading,
    isLiquidityLoading,
    isCashflowForecastLoading,
    isProductParetoLoading,
    isSupplierConcentrationLoading,
    isCustomerRetentionLoading,
  } = useDashboardAnalytics({
    breakEvenPeriod,
    dateRange: clampedRange,
    cashflowDateRange: clampedCashflowRange,
    retentionDormantOnly,
  });

  const breakEvenMonthOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [];
    const now = dayjs();
    for (let i = 0; i < 12; i++) {
      const d = now.subtract(i, 'month');
      list.push({ value: d.format('YYYY-MM'), label: d.format('YYYY年MM月') });
    }
    return list;
  }, []);

  const customerRetentionDisplay = useMemo(() => {
    if (!customerRetention.length) return [];
    if (!retentionDormantOnly) return customerRetention;
    return customerRetention.filter((r) => r.daysSinceLastOrder > 60 || (r.status && String(r.status).includes('沉睡')));
  }, [customerRetention, retentionDormantOnly]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);


  // ✨ 修正：確保切片邏輯安全
  const safeTrendData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    return trends.slice(-trendDays);
  }, [trends, trendDays]);

  // 時間更新邏輯
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
    return () => { clearTimeout(timer); if (intervalId) clearInterval(intervalId); };
  }, []);

  // 刷新邏輯
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    try {
      await refresh();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  // F5 快捷鍵
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        if (!isRefreshing && !loading) handleRefresh();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRefresh, isRefreshing, loading]);

  // 頁面級別滾動條樣式
  useEffect(() => {
    const styleId = 'dashboard-scrollbar-style';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const scrollbarStyles = `
      body::-webkit-scrollbar {
        width: 6px;
      }
      body::-webkit-scrollbar-track {
        background: ${isDark ? '#2A2A2A' : '#f1f1f1'};
        border-radius: 4px;
      }
      body::-webkit-scrollbar-thumb {
        background: ${isDark ? '#555' : '#c1c1c1'};
        border-radius: 4px;
      }
      body::-webkit-scrollbar-thumb:hover {
        background: ${isDark ? '#777' : '#a1a1a1'};
      }
    `;

    styleElement.textContent = scrollbarStyles;

    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [isDark]);

  // 計算值
  const greetingData = useMemo(() => getGreeting(), []);
  const formattedDateStr = useMemo(() => formatDate(currentTime), [currentTime]);
  const formattedTimeStr = useMemo(() => formatTime(currentTime), [currentTime]);
  /** 流動性指標：規格「截至今日 YYYY-MM-DD HH:mm」 */
  const liquiditySnapshotLabel = useMemo(() => dayjs(currentTime).format('YYYY-MM-DD HH:mm'), [currentTime]);
  /** 損益平衡：是否為當月或未來月（不可選未來月，下個月按鈕需禁用） */
  const isBreakEvenCurrentOrFutureMonth = useMemo(() => breakEvenPeriod >= dayjs().format('YYYY-MM'), [breakEvenPeriod]);

  // 訂單漏斗：加上階段中文標籤與顯示用 dataKey
  /** Pareto 圖 80% 門檻（累計金額達總額 80% 的參考線） */
  const pareto80Threshold = useMemo(() => {
    if (!productPareto?.length) return 0;
    const total = productPareto.reduce((sum, d) => sum + Number(d.totalAmount ?? 0), 0);
    return total * 0.8;
  }, [productPareto]);

  const orderFunnelDisplay = useMemo(() => {
    if (!orderFunnel?.length) return [];
    const dataKey = orderFunnelMetric === 'amount' ? 'totalAmount' : 'orderCount';
    return [...orderFunnel]
      .sort((a, b) => Number(b[dataKey] ?? 0) - Number(a[dataKey] ?? 0))
      .map((item) => ({
        ...item,
        stageLabel: ORDER_STAGE_LABELS[item.stage] ?? item.stage,
      }));
  }, [orderFunnel, orderFunnelMetric]);

  const alerts = useMemo(() => {
    const list = [];
    if (stats.pendingOrderCount > 0) {
      list.push({ label: `待處理訂單 (${stats.pendingOrderCount})`, path: '/orders', color: 'warning' as const, icon: <WarningIcon /> });
    }
    if (stats.accountsPayable > 100000) {
      list.push({ label: '應付帳款偏高', path: '/ap', color: 'error' as const, icon: <MoneyOffIcon /> });
    }
    return list;
  }, [stats]);

  const quickActions = useMemo(
    () => [
      { label: '新增銷售', icon: <PointOfSaleIcon />, path: '/sales/create', color: 'primary' as const },
      { label: '新增進貨', icon: <Inventory2Icon />, path: '/purchases/create', color: 'secondary' as const },
      { label: '新增支出', icon: <MoneyOffIcon />, path: '/expenses/create', color: 'error' as const },
      { label: '新增訂單', icon: <ShoppingBagIcon />, path: '/orders/create', color: 'info' as const },
    ],
    []
  );

  const alertsForQuick = useMemo(
    () => alerts.map((a) => ({ label: a.label, path: a.path, color: a.color })),
    [alerts]
  );

  return (
    <DashboardLayout isLoading={loading} hasData={!!stats}>
      <WelcomeCard
        isDark={isDark}
        greeting={greetingData}
        formattedDate={formattedDateStr}
        formattedTime={formattedTimeStr}
        lastUpdated={lastUpdated != null ? (typeof lastUpdated === 'string' ? lastUpdated : (lastUpdated as Date).toISOString()) : undefined}
      />

      <QuickActionsSection
        quickActions={quickActions}
        alerts={alertsForQuick}
      />

      <StatSection
        title="營運概況"
        titleIcon={<AssessmentIcon color="primary" />}
        items={[
          { icon: <MonetizationOnIcon sx={{ fontSize: 36 }} />, title: '今日營收', value: <>NT$ <PlainCurrency value={stats.todaySalesTotal} /></>, iconColor: STAT_CARD_COLORS.revenue, loading, onClick: () => navigate('/sales') },
          { icon: <ShoppingCartIcon sx={{ fontSize: 36 }} />, title: '本月採購', value: <>NT$ <PlainCurrency value={stats.monthPurchaseTotal} /></>, iconColor: STAT_CARD_COLORS.purchase, loading, onClick: () => navigate('/purchases') },
          { icon: <ReceiptIcon sx={{ fontSize: 36 }} />, title: '本月費用', value: <>NT$ <PlainCurrency value={stats.monthExpenseTotal} /></>, iconColor: STAT_CARD_COLORS.expense, loading, onClick: () => navigate('/expenses') },
          { icon: <TrendingUpIcon sx={{ fontSize: 36 }} />, title: '本月淨利', value: <Box sx={{ color: stats.netProfit >= 0 ? 'success.main' : 'error.main' }}>NT$ <PlainCurrency value={stats.netProfit} /></Box>, iconColor: stats.netProfit >= 0 ? STAT_CARD_COLORS.revenue : STAT_CARD_COLORS.ap, loading },
        ]}
      />

      <StatSection
        title="財務指標"
        titleIcon={<AccountBalanceWalletIcon color="info" />}
        items={[
          { icon: <MonetizationOnIcon sx={{ fontSize: 36 }} />, title: '本月銷售總額', value: <>NT$ <PlainCurrency value={stats.monthSalesTotal} /></>, iconColor: STAT_CARD_COLORS.netProfit, loading, onClick: () => navigate('/sales') },
          { icon: <AccountBalanceWalletIcon sx={{ fontSize: 36 }} />, title: '應收帳款 (AR)', value: <>NT$ <PlainCurrency value={stats.accountsReceivable} /></>, iconColor: STAT_CARD_COLORS.ar, loading, onClick: () => navigate('/ar') },
          { icon: <MoneyOffIcon sx={{ fontSize: 36 }} />, title: '應付帳款 (AP)', value: <>NT$ <PlainCurrency value={stats.accountsPayable} /></>, iconColor: STAT_CARD_COLORS.ap, loading, onClick: () => navigate('/ap') },
          { icon: <AssessmentIcon sx={{ fontSize: 36 }} />, title: '淨利率', value: <Box sx={{ color: stats.profitMargin >= 0 ? 'success.main' : 'error.main' }}>{formatPercent(stats.profitMargin)}</Box>, iconColor: stats.profitMargin >= 0 ? STAT_CARD_COLORS.revenue : STAT_CARD_COLORS.ap, loading },
        ]}
      />

      <StatSection
        title="現金流量"
        titleIcon={<PaymentsIcon color="success" />}
        items={[
          { icon: <ReceiptIcon sx={{ fontSize: 36 }} />, title: '今日訂單收款', value: <>NT$ <PlainCurrency value={stats.todayReceiptsTotal} /></>, iconColor: STAT_CARD_COLORS.revenue, loading, onClick: () => navigate('/receipts') },
          { icon: <AccountBalanceIcon sx={{ fontSize: 36 }} />, title: '今日總入金', value: <>NT$ <PlainCurrency value={stats.todayTotalInflow} /></>, iconColor: STAT_CARD_COLORS.info, loading },
          { icon: <HistoryIcon sx={{ fontSize: 36 }} />, title: '本月累計實收', value: <>NT$ <PlainCurrency value={stats.monthTotalReceived} /></>, iconColor: STAT_CARD_COLORS.netProfit, loading },
          { icon: <EventNoteIcon sx={{ fontSize: 36 }} />, title: '即期應收 (7D)', value: <>NT$ <PlainCurrency value={stats.upcomingAR} /></>, iconColor: STAT_CARD_COLORS.ap, loading, onClick: () => navigate('/ar') },
        ]}
      />

      <StatSection
        title="業務概況"
        titleIcon={<StoreIcon color="secondary" />}
        items={[
          { icon: <StoreIcon sx={{ fontSize: 36 }} />, title: '合作供應商', value: stats.supplierCount, iconColor: STAT_CARD_COLORS.secondary, loading, onClick: () => navigate('/suppliers') },
          { icon: <PeopleIcon sx={{ fontSize: 36 }} />, title: '累計客戶', value: stats.customerCount, iconColor: STAT_CARD_COLORS.secondary, loading, onClick: () => navigate('/order_customers') },
          { icon: <InventoryIcon sx={{ fontSize: 36 }} />, title: '上架商品', value: stats.activeProductCount, iconColor: STAT_CARD_COLORS.info, loading, onClick: () => navigate('/products') },
          { icon: <PendingActionsIcon sx={{ fontSize: 36 }} />, title: '未結案訂單', value: stats.pendingOrderCount, iconColor: STAT_CARD_COLORS.warning, loading, onClick: () => navigate('/orders') },
        ]}
      />

      <TrendAndExpenseSection
        isDark={isDark}
        trendDays={trendDays}
        setTrendDays={setTrendDays}
        safeTrendData={safeTrendData}
        isTrendsLoading={isTrendsLoading}
        hasMounted={hasMounted}
        expenses={expenses}
        isExpensesLoading={isExpensesLoading}
      />

      <AdvancedAnalysisSection
        isDark={isDark}
        hasMounted={hasMounted}
        accountsAging={accountsAging}
        isAccountsAgingLoading={isAccountsAgingLoading}
        orderFunnelDisplay={orderFunnelDisplay}
        orderFunnelMetric={orderFunnelMetric}
        setOrderFunnelMetric={setOrderFunnelMetric}
        isOrderFunnelLoading={isOrderFunnelLoading}
      />

      {/* 損益平衡分析 | 損益四線走勢 倆倆並排 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4 }}>
        <BreakEvenSection
          isDark={isDark}
          breakEvenPeriod={breakEvenPeriod}
          setBreakEvenPeriod={setBreakEvenPeriod}
          breakEvenMonthOptions={breakEvenMonthOptions}
          isBreakEvenCurrentOrFutureMonth={isBreakEvenCurrentOrFutureMonth}
          breakEven={breakEven}
          isBreakEvenLoading={isBreakEvenLoading}
        />
        <ProfitLossSection
          isDark={isDark}
          hasMounted={hasMounted}
          profitLossMonths={profitLossMonths}
          setProfitLossMonths={setProfitLossMonths}
          profitLossTrend={profitLossTrend}
          isProfitLossTrendLoading={isProfitLossTrendLoading}
        />
      </Box>

      {/* 📊 核心圖表分析 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" /> 核心圖表分析
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {/* [1] 流動性指標（Read-only 快照，無選擇器；規格：截至今日 YYYY-MM-DD HH:mm） */}
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WaterDropIcon fontSize="small" /> 流動性指標
              </Typography>
              <Typography variant="caption" color="text.secondary">截至今日 {liquiditySnapshotLabel}</Typography>
            </Box>
            <Box sx={{ height: 260 }}>
              {isLiquidityLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : liquidity ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, pt: 1 }}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">流動資產</Typography>
                    <Typography variant="h6">NT$ <PlainCurrency value={liquidity.liquidAssets} /></Typography>
                  </Card>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">流動負債</Typography>
                    <Typography variant="h6">NT$ <PlainCurrency value={liquidity.liquidLiabilities} /></Typography>
                  </Card>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">速動資產</Typography>
                    <Typography variant="h6">NT$ <PlainCurrency value={liquidity.quickAssets} /></Typography>
                  </Card>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">流動比率</Typography>
                    <Typography variant="h6" color="primary">{Number(liquidity.currentRatio).toFixed(2)}</Typography>
                  </Card>
                </Box>
              ) : <ChartEmptyState message="暫無數據" height={260} />}
            </Box>
          </Paper>

          {/* [3] 現金流預測（API：baseDate 基準日 + days 天數；兩組日期選擇器） */}
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimelineIcon fontSize="small" /> 現金流預測
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
                  <DatePicker
                    label="基準日"
                    value={cashflowStart ? dayjs(cashflowStart) : null}
                    onChange={(v) => setCashflowStart(v ? v.format('YYYY-MM-DD') : defaultCashflow.start)}
                    format="YYYY-MM-DD"
                    maxDate={cashflowEnd ? dayjs(cashflowEnd) : undefined}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { width: 160 },
                      },
                    }}
                  />
                  <DatePicker
                    label="結束日"
                    value={cashflowEnd ? dayjs(cashflowEnd) : null}
                    onChange={(v) => setCashflowEnd(v ? v.format('YYYY-MM-DD') : defaultCashflow.end)}
                    format="YYYY-MM-DD"
                    minDate={cashflowStart ? dayjs(cashflowStart) : undefined}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { width: 160 },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Box>
            <Box sx={{ height: 260 }}>
              {isCashflowForecastLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : cashflowForecast.length > 0 ? (
                <ChartContainer height={260}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={cashflowForecast} margin={{ top: 8, right: 16, left: 0, bottom: 24 }} barGap={4}>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => dayjs(v).format('MM/DD')} />
                      <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={getChartTooltipContentStyle(theme)} />
                      <Legend />
                      <Bar dataKey="inflow" name="流入" fill={CHART_COLORS.cashflowInflow} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600} />
                      <Bar dataKey="outflow" name="流出" fill={CHART_COLORS.expense} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={600} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : <ChartEmptyState message="暫無數據" height={260} />}
            </Box>
          </Paper>
        </Box>

        {/* 商品獲利 Pareto | 供應商集中度 倆倆並排 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 3, mb: 2 }}>
          {/* [4] 商品獲利 Pareto（固定本月1號～今日，無日期選擇器；API start, end） */}
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PieChartIcon fontSize="small" /> 商品獲利 Pareto
              </Typography>
              <Typography variant="caption" color="text.secondary">{clampedRange.start} ~ {clampedRange.end}</Typography>
            </Box>
            <Box sx={{ height: 260 }}>
              {isProductParetoLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : productPareto.length > 0 ? (
                <ChartContainer height={260}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={productPareto} layout="vertical" margin={{ top: 8, right: 60, left: 8, bottom: 8 }} barCategoryGap="10%">
                      <CartesianGrid strokeDasharray="5 5" horizontal={false} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis type="number" tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="productName" type="category" width={80} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={getChartTooltipContentStyle(theme)} formatter={(value: unknown) => [typeof value === 'number' ? `NT$ ${Number(value).toLocaleString()}` : '', '']} />
                      {pareto80Threshold > 0 && (
                        <ReferenceLine x={pareto80Threshold} stroke={DESIGN_PARETO_REF} strokeDasharray="5 5" strokeWidth={2} label={{ value: '80%', position: 'insideTopRight', fill: theme.palette.text.secondary, fontSize: 11 }} />
                      )}
                      <Bar dataKey="totalAmount" name="金額" fill={CHART_COLORS.netProfit} radius={[0, 6, 6, 0]} maxBarSize={24} isAnimationActive animationDuration={400} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : <ChartEmptyState message="暫無數據" height={260} />}
            </Box>
          </Paper>

          {/* [5] 供應商集中度（固定本月1號～今日，無日期選擇器；API start, end） */}
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BusinessCenterIcon fontSize="small" /> 供應商集中度
              </Typography>
              <Typography variant="caption" color="text.secondary">{clampedRange.start} ~ {clampedRange.end}</Typography>
            </Box>
            <Box sx={{ height: 260 }}>
              {isSupplierConcentrationLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : supplierConcentration.length > 0 ? (
                <ChartContainer height={260}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={supplierConcentration} layout="vertical" margin={{ top: 8, right: 60, left: 8, bottom: 8 }} barCategoryGap="12%">
                      <CartesianGrid strokeDasharray="1 4" horizontal={false} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis type="number" tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 10 }} />
                      <YAxis dataKey="supplierName" type="category" width={80} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={getChartTooltipContentStyle(theme)} formatter={(value: unknown) => [typeof value === 'number' ? `NT$ ${Number(value).toLocaleString()}` : '', '']} />
                      <Bar dataKey="totalAmount" name="採購金額" fill={CHART_COLORS.secondary} radius={[0, 8, 8, 0]} maxBarSize={26} isAnimationActive animationDuration={400} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : <ChartEmptyState message="暫無數據" height={260} />}
            </Box>
          </Paper>
        </Box>

        {/* 客戶回購分析 | 待辦任務與即期預警 倆倆並排 */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 4, alignItems: 'stretch' }}>
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonSearchIcon fontSize="small" /> 客戶回購分析
              </Typography>
              <ToggleButtonGroup size="small" value={retentionDormantOnly ? 'dormant' : 'all'} exclusive onChange={(_, v) => setRetentionDormantOnly(v === 'dormant')} sx={{ height: 28 }}>
                <ToggleButton value="all">全部</ToggleButton>
                <ToggleButton value="dormant">沉睡風險 (&gt;60天)</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                minHeight: 260,
                maxHeight: 260,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                  borderRadius: 4,
                },
              }}
            >
              {isCustomerRetentionLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : customerRetentionDisplay.length > 0 ? (
                <List dense sx={{ py: 0 }}>
                  {customerRetentionDisplay.slice(0, 8).map((row, i) => (
                    <ListItem key={`${row.customerName}-${row.lastOrderDate}-${i}`} divider sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={row.customerName}
                        secondary={`最後訂單 ${row.lastOrderDate} · ${row.daysSinceLastOrder} 天前`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                      <Chip size="small" label={row.status} color={row.status.includes('沉睡') ? 'warning' : 'default'} variant="outlined" />
                    </ListItem>
                  ))}
                  {customerRetentionDisplay.length > 8 && <ListItem><ListItemText secondary={`共 ${customerRetentionDisplay.length} 筆，僅顯示前 8 筆`} /></ListItem>}
                </List>
              ) : <ChartEmptyState message="暫無數據" height={260} />}
            </Box>
          </Paper>
          <TaskListSection tasks={tasks} />
        </Box>
      </Box>

      {error && <MuiAlert severity="error" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>載入數據時發生錯誤：{error.message}</MuiAlert>}
      <Snackbar open={refreshSuccess} autoHideDuration={3000} onClose={() => setRefreshSuccess(false)} message="儀表板數據已更新" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </DashboardLayout>
  );
};

export default Dashboard;
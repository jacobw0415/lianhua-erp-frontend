import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Snackbar,
  useTheme,
  Alert as MuiAlert,
  Stack,
  Divider,
  Paper,
  Skeleton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';

// 📊 導入 Recharts 組件
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  ComposedChart,
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
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HistoryIcon from '@mui/icons-material/History';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PlainCurrency } from '@/components/money/PlainCurrency';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { ChartEmptyState } from '@/components/dashboard/ChartEmptyState';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { CHART_COLORS, PIE_COLORS } from '@/constants/chartColors';
import { formatPercent, formatAxisCurrency } from '@/utils/dashboardFormatters';

/* =========================================================
 * Helper Functions & Constants
 * ========================================================= */
const getGreeting = (): { text: string; icon: React.ReactNode } => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: '早安', icon: <WbSunnyIcon sx={{ fontSize: 24, ml: 1, color: '#FFD54F' }} /> };
  if (hour < 18) return { text: '午安', icon: <WbSunnyIcon sx={{ fontSize: 24, ml: 1, color: '#FFA726' }} /> };
  return { text: '晚安', icon: <NightlightIcon sx={{ fontSize: 24, ml: 1, color: '#90CAF9' }} /> };
};

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
 * StatCard Component (React.memo)
 * ========================================================= */

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  iconColor: string;
  loading?: boolean;
  onClick?: () => void;
}

const StatCard = React.memo<StatCardProps>(({ icon, title, value, iconColor, loading, onClick }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: 2,
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: onClick ? 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' : 'none',
      '&:hover': onClick ? { boxShadow: 6, transform: 'translateY(-4px)' } : {},
    }}
    onClick={onClick}
  >
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            color: iconColor,
            bgcolor: `${iconColor}15`,
            p: 1.5,
            borderRadius: '50%',
            mr: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{title}</Typography>
          {loading ? <Skeleton variant="text" width="80%" height={40} /> : <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>}
        </Box>
      </Box>
    </CardContent>
  </Card>
));
StatCard.displayName = 'StatCard';

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

  // 訂單漏斗：加上階段中文標籤與顯示用 dataKey
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

  const quickActions = [
    { label: '新增銷售', icon: <PointOfSaleIcon />, path: '/sales/create', color: 'primary' },
    { label: '新增進貨', icon: <Inventory2Icon />, path: '/purchases/create', color: 'secondary' },
    { label: '新增支出', icon: <MoneyOffIcon />, path: '/expenses/create', color: 'error' },
    { label: '新增訂單', icon: <ShoppingBagIcon />, path: '/orders/create', color: 'info' },
  ];

  // 歡迎卡片背景
  const cardBackground = isDark
    ? 'rgba(27, 94, 32, 0.85)'
    : 'rgba(46, 125, 50, 0.85)';

  return (
    <DashboardLayout
      isLoading={loading}
      hasData={!!stats}
    >

      {/* 歡迎區 */}
      <Card
        sx={{
          backdropFilter: 'blur(10px)',
          background: cardBackground,
          color: '#fff',
          borderRadius: 3,
          boxShadow: isDark ? 4 : 3,
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
        }}
      >
        <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', opacity: 0.2 }} />
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' } }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', letterSpacing: 0.5 }}>
                  {greetingData.text}
                </Typography>
                <Box sx={{ ml: 1.5 }}>{greetingData.icon}</Box>
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
                歡迎使用蓮華 ERP 管理系統
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                  數據最後更新：{new Date(lastUpdated).toLocaleTimeString()}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 3, md: 0 }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2, lineHeight: 1 }}>
                  {formattedTimeStr}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1, mt: 1, opacity: 0.9 }}>
                  <CalendarTodayIcon sx={{ fontSize: 18 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {formattedDateStr}
                  </Typography>
                </Box>
              </Box>

            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 快捷功能與提醒 */}
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PendingActionsIcon fontSize="small" /> 快速操作
            </Typography>
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outlined"
                  size="small"
                  color={action.color as any}
                  startIcon={action.icon}
                  onClick={() => navigate(action.path)}
                  sx={{ whiteSpace: 'nowrap', borderRadius: 4 }}
                >
                  {action.label}
                </Button>
              ))}
            </Stack>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          {alerts.length > 0 && (
            <Box
              sx={{
                minWidth: { md: 300 },
                maxWidth: { md: 400 },
                maxHeight: 100,
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  borderRadius: '4px'
                }
              }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  position: 'sticky',
                  top: 0,
                  bgcolor: isDark ? '#2A2A2A' : '#F5F5F5',
                  zIndex: 1,
                  mb: 1,
                  pb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <WarningIcon fontSize="small" color="warning" /> 待辦事項
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {alerts.map((alert, index) => (
                  <Chip
                    key={index}
                    label={alert.label}
                    color={alert.color}
                    size="small"
                    onClick={() => navigate(alert.path)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </Paper>
      </Box>

      {/* 營運概況 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon color="primary" /> 營運概況
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4
      }}>
        <StatCard icon={<MonetizationOnIcon sx={{ fontSize: 36 }} />} title="今日營收" value={<>NT$ <PlainCurrency value={stats.todaySalesTotal} /></>} iconColor={CHART_COLORS.revenue} loading={loading} onClick={() => navigate('/sales')} />
        <StatCard icon={<ShoppingCartIcon sx={{ fontSize: 36 }} />} title="本月採購" value={<>NT$ <PlainCurrency value={stats.monthPurchaseTotal} /></>} iconColor="#FB8C00" loading={loading} onClick={() => navigate('/purchases')} />
        <StatCard icon={<ReceiptIcon sx={{ fontSize: 36 }} />} title="本月費用" value={<>NT$ <PlainCurrency value={stats.monthExpenseTotal} /></>} iconColor="#8E24AA" loading={loading} onClick={() => navigate('/expenses')} />
        <StatCard icon={<TrendingUpIcon sx={{ fontSize: 36 }} />} title="本月淨利" value={<Box sx={{ color: stats.netProfit >= 0 ? 'success.main' : 'error.main' }}>NT$ <PlainCurrency value={stats.netProfit} /></Box>} iconColor={stats.netProfit >= 0 ? CHART_COLORS.revenue : CHART_COLORS.expense} loading={loading} />
      </Box>

      {/* 財務指標 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWalletIcon color="info" /> 財務指標
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4
      }}>
        <StatCard icon={<MonetizationOnIcon sx={{ fontSize: 36 }} />} title="本月銷售總額" value={<>NT$ <PlainCurrency value={stats.monthSalesTotal} /></>} iconColor={CHART_COLORS.netProfit} loading={loading} onClick={() => navigate('/sales')} />
        <StatCard icon={<AccountBalanceWalletIcon sx={{ fontSize: 36 }} />} title="應收帳款 (AR)" value={<>NT$ <PlainCurrency value={stats.accountsReceivable} /></>} iconColor="#0288D1" loading={loading} onClick={() => navigate('/ar')} />
        <StatCard icon={<MoneyOffIcon sx={{ fontSize: 36 }} />} title="應付帳款 (AP)" value={<>NT$ <PlainCurrency value={stats.accountsPayable} /></>} iconColor={CHART_COLORS.expense} loading={loading} onClick={() => navigate('/ap')} />
        <StatCard icon={<AssessmentIcon sx={{ fontSize: 36 }} />} title="淨利率" value={<Box sx={{ color: stats.profitMargin >= 0 ? 'success.main' : 'error.main' }}>{formatPercent(stats.profitMargin)}</Box>} iconColor={stats.profitMargin >= 0 ? CHART_COLORS.revenue : CHART_COLORS.expense} loading={loading} />
      </Box>

      {/* 現金流量 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaymentsIcon color="success" /> 現金流量
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <StatCard icon={<ReceiptIcon sx={{ fontSize: 36 }} />} title="今日訂單收款" value={<>NT$ <PlainCurrency value={stats.todayReceiptsTotal} /></>} iconColor={CHART_COLORS.revenue} loading={loading} onClick={() => navigate('/receipts')} />
        <StatCard icon={<AccountBalanceIcon sx={{ fontSize: 36 }} />} title="今日總入金" value={<>NT$ <PlainCurrency value={stats.todayTotalInflow} /></>} iconColor="#00838F" loading={loading} />
        <StatCard icon={<HistoryIcon sx={{ fontSize: 36 }} />} title="本月累計實收" value={<>NT$ <PlainCurrency value={stats.monthTotalReceived} /></>} iconColor="#1565C0" loading={loading} />
        <StatCard icon={<EventNoteIcon sx={{ fontSize: 36 }} />} title="即期應收 (7D)" value={<>NT$ <PlainCurrency value={stats.upcomingAR} /></>} iconColor="#C62828" loading={loading} onClick={() => navigate('/ar')} />
      </Box>

      {/* 業務概況 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <StoreIcon color="secondary" /> 業務概況
      </Typography>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4
      }}>
        <StatCard icon={<StoreIcon sx={{ fontSize: 36 }} />} title="合作供應商" value={stats.supplierCount} iconColor="#1E88E5" loading={loading} onClick={() => navigate('/suppliers')} />
        <StatCard icon={<PeopleIcon sx={{ fontSize: 36 }} />} title="累計客戶" value={stats.customerCount} iconColor="#5E35B1" loading={loading} onClick={() => navigate('/order_customers')} />
        <StatCard icon={<InventoryIcon sx={{ fontSize: 36 }} />} title="上架商品" value={stats.activeProductCount} iconColor="#00796B" loading={loading} onClick={() => navigate('/products')} />
        <StatCard icon={<PendingActionsIcon sx={{ fontSize: 36 }} />} title="未結案訂單" value={stats.pendingOrderCount} iconColor="#F57C00" loading={loading} onClick={() => navigate('/orders')} />
      </Box>

      {/* 📈 底部圖表分析區域 (營運雙軸趨勢圖 + 支出結構) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>

        {/* 左側：趨勢折線圖 */}
        <Paper sx={{ p: 3, borderRadius: 2, minHeight: 450, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>營運與收款趨勢</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={trendDays} onChange={(e) => setTrendDays(Number(e.target.value))}>
                <MenuItem value={7}>近 7 天</MenuItem>
                <MenuItem value={14}>近 14 天</MenuItem>
                <MenuItem value={30}>近 30 天</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ flexGrow: 1, minHeight: 350, minWidth: 0, overflow: 'hidden' }}>
            {hasMounted && !isTrendsLoading && safeTrendData.length > 0 ? (
              <ChartContainer height={350}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={safeTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#444' : '#eee'} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke={CHART_COLORS.revenue}
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(v) => formatAxisCurrency(v)}
                    />
                    <YAxis yAxisId="right" orientation="right" stroke={CHART_COLORS.netProfit} tick={{ fontSize: 11 }} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderRadius: 8, border: 'none' }}
                      formatter={(val: any) => `NT$ ${Number(val).toLocaleString()}`}
                    />
                    <Legend verticalAlign="top" align="right" height={36} />
                    <Line yAxisId="left" type="monotone" dataKey="saleAmount" name="零售營收" stroke={CHART_COLORS.revenue} strokeWidth={3} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="receiptAmount" name="訂單收款" stroke={CHART_COLORS.netProfit} strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                {isTrendsLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : <ChartEmptyState message="當前區間無數據" height={350} />}
              </Box>
            )}
          </Box>
        </Paper>

        {/* 右側：支出圓餅圖 */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>本月支出結構</Typography>
          <Box sx={{ width: '100%', minHeight: 320, minWidth: 0 }}>
            {hasMounted && !isExpensesLoading && expenses.length > 0 ? (
              <ChartContainer height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={expenses} dataKey="amount" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                      {expenses.map((_, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val: any) => `NT$ ${Number(val).toLocaleString()}`} />
                    <Legend verticalAlign="bottom" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
                {isExpensesLoading ? <Skeleton variant="circular" width={200} height={200} /> : <ChartEmptyState message="當前區間無數據" height={320} />}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* 📊 進階營運分析區塊 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssessmentIcon color="primary" /> 進階營運分析
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        {/* 帳款帳齡風險分析 */}
        <Paper sx={{ p: 3, borderRadius: 2, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            帳款帳齡風險
          </Typography>
          <Box sx={{ flexGrow: 1, minHeight: 280, minWidth: 0 }}>
            {hasMounted && !isAccountsAgingLoading && accountsAging && accountsAging.length > 0 ? (
              <ChartContainer height={280}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={accountsAging}
                    margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#444' : '#eee'} />
                    <XAxis
                      dataKey="bucketLabel"
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    />
                    <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderRadius: 8, border: 'none' }}
                      formatter={(value: any, name: any) => [`NT$ ${Number(value).toLocaleString()}`, name]}
                    />
                    <Legend />
                    <Bar dataKey="arAmount" name="應收帳款" stackId="amount" fill={CHART_COLORS.revenue} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="apAmount" name="應付帳款" stackId="amount" fill={CHART_COLORS.expense} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                {isAccountsAgingLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : <ChartEmptyState />}
              </Box>
            )}
          </Box>
        </Paper>

        {/* 訂單履約漏斗（金額/筆數切換 + 階段中文） */}
        <Paper sx={{ p: 3, borderRadius: 2, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              訂單履約狀態
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={orderFunnelMetric}
              exclusive
              onChange={(_, v) => v != null && setOrderFunnelMetric(v)}
              sx={{ height: 32 }}
            >
              <ToggleButton value="amount">金額</ToggleButton>
              <ToggleButton value="count">筆數</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 280, minWidth: 0 }}>
            {hasMounted && !isOrderFunnelLoading && orderFunnelDisplay.length > 0 ? (
              <ChartContainer height={280}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={orderFunnelDisplay} layout="vertical" margin={{ top: 10, right: 20, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#444' : '#eee'} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => (orderFunnelMetric === 'amount' ? formatAxisCurrency(v) : String(v))}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis dataKey="stageLabel" type="category" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderRadius: 8, border: 'none' }}
                      formatter={(value: any) => [
                        orderFunnelMetric === 'amount' ? `NT$ ${Number(value).toLocaleString()}` : String(value),
                        orderFunnelMetric === 'amount' ? '總金額' : '筆數',
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey={orderFunnelMetric === 'amount' ? 'totalAmount' : 'orderCount'}
                      name={orderFunnelMetric === 'amount' ? '訂單金額' : '訂單筆數'}
                      fill={CHART_COLORS.secondary}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                {isOrderFunnelLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : <ChartEmptyState />}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* 📉 損益四線走勢 */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              損益四線走勢
            </Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={profitLossMonths}
                onChange={(e) => setProfitLossMonths(Number(e.target.value))}
              >
                <MenuItem value={3}>過去 3 個月</MenuItem>
                <MenuItem value={6}>過去 6 個月</MenuItem>
                <MenuItem value={12}>過去 12 個月</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flexGrow: 1, minHeight: 300, minWidth: 0 }}>
            {hasMounted && !isProfitLossTrendLoading && profitLossTrend && profitLossTrend.length > 0 ? (
              <ChartContainer height={300}>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={profitLossTrend} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#444' : '#eee'} />
                    <XAxis dataKey="period" tick={{ fontSize: 11, fill: theme.palette.text.secondary }} />
                    <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDark ? '#333' : '#fff', borderRadius: 8, border: 'none' }}
                      formatter={(value: any, name?: string) => [`NT$ ${Number(value).toLocaleString()}`, name ?? '']}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" name="營收" stroke={CHART_COLORS.netProfit} fill={`${CHART_COLORS.netProfit}33`} strokeWidth={2} />
                    <Area type="monotone" dataKey="expense" name="費用" stroke={CHART_COLORS.expense} fill={`${CHART_COLORS.expense}22`} strokeWidth={2} />
                    <Line type="monotone" dataKey="grossProfit" name="毛利" stroke={CHART_COLORS.revenue} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="netProfit" name="淨利" stroke={CHART_COLORS.secondary} strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                {isProfitLossTrendLoading ? <Skeleton variant="rectangular" width="100%" height="100%" /> : <ChartEmptyState />}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* 📋 底部待辦任務明細 */}
      <Paper
        sx={{
          padding: 3,
          borderRadius: 2,
          marginBottom: 4,
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: isDark ? 3 : 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentLateIcon color="error" /> 待辦任務與即期預警
          </Typography>
          {tasks && tasks.length > 0 && (
            <Chip
              label={`共 ${tasks.length} 筆`}
              size="small"
              color="error"
              variant={isDark ? 'filled' : 'outlined'}
            />
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
          點擊任一列可快速前往對應列表進行處理。
        </Typography>
        <Divider sx={{ mb: 1.5 }} />

        {tasks && tasks.length > 0 ? (
          <List
            dense
            sx={{
              maxHeight: 260,
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                borderRadius: 4,
              },
            }}
          >
            {tasks.map((task, index) => (
              <ListItem
                key={`${task.type}-${task.referenceNo}-${task.dueDate}-${index}`}
                divider={index !== tasks.length - 1}
                onClick={() => navigate(task.type === 'AR_DUE' ? '/ar' : '/orders')}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
                  <Avatar sx={{ bgcolor: task.type === 'AR_DUE' ? 'error.light' : 'warning.light' }}>
                    {task.type === 'AR_DUE' ? <MoneyOffIcon /> : <ShoppingCartIcon />}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: 600 }} noWrap>
                      {task.targetName} ({task.referenceNo})
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      訂單日期：{task.dueDate}
                    </Typography>
                  }
                />
                <Box sx={{ textAlign: 'right', minWidth: 150 }}>
                  <Typography variant="subtitle1" color="error.main" sx={{ fontWeight: 700 }}>
                    NT$ <PlainCurrency value={task.amount} />
                  </Typography>
                  <Chip
                    size="small"
                    label={task.type === 'AR_DUE' ? '帳款催收' : '訂單處理'}
                    color={task.type === 'AR_DUE' ? 'error' : 'warning'}
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
              目前無緊急待辦事項
            </Typography>
            <Typography variant="caption" color="text.secondary">
              帳款到期或訂單異常時，會自動在此顯示提醒。
            </Typography>
          </Box>
        )}
      </Paper>

      {error && <MuiAlert severity="error" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>載入數據時發生錯誤：{error.message}</MuiAlert>}
      <Snackbar open={refreshSuccess} autoHideDuration={3000} onClose={() => setRefreshSuccess(false)} message="儀表板數據已更新" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </DashboardLayout>
  );
};

export default Dashboard;
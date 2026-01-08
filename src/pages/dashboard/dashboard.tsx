import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Skeleton
} from '@mui/material';

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
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PlainCurrency } from '@/components/money/PlainCurrency';
import { DashboardLayout } from '@/layout/DashboardLayout';

/* =========================================================
 * Helper Functions
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

const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
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
    {/* 恢復適當的 padding 以保持美觀 */}
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            color: iconColor,
            bgcolor: `${iconColor}15`,
            p: 1.5, // 恢復 icon 背景大小
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
  
  const { stats, loading, error, refresh, lastUpdated } = useDashboardStats();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

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

  // ★★★ 恢復：頁面級別滾動條樣式 (Scrollbar Settings) ★★★
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

  const alerts = useMemo(() => {
    const list = [];
    if (stats.pendingOrderCount > 0) {
      list.push({ label: `待處理訂單 (${stats.pendingOrderCount})`, link: '#/orders', color: 'warning' as const, icon: <WarningIcon /> });
    }
    if (stats.accountsPayable > 100000) {
      list.push({ label: '應付帳款偏高', link: '#/ap', color: 'error' as const, icon: <MoneyOffIcon /> });
    }
    return list;
  }, [stats]);

  const quickActions = [
    { label: '新增銷售', icon: <PointOfSaleIcon />, link: '#/sales/create', color: 'primary' },
    { label: '新增進貨', icon: <Inventory2Icon />, link: '#/purchases/create', color: 'secondary' },
    { label: '新增支出', icon: <MoneyOffIcon />, link: '#/expenses/create', color: 'error' },
    { label: '新增訂單', icon: <ShoppingBagIcon />, link: '#/orders/create', color: 'info' },
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
      
      {/* 歡迎區 (恢復原本的大小與間距) */}
      <Card
        sx={{
          backdropFilter: 'blur(10px)',
          background: cardBackground,
          color: '#fff',
          borderRadius: 3,
          boxShadow: isDark ? 4 : 3,
          mb: 3, // ★ 恢復為 3 (24px)
          position: 'relative',
          overflow: 'hidden',
          transition: 'box-shadow 0.3s ease-in-out',
        }}
      >
        <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', opacity: 0.2 }} />
        {/* ★ 恢復 padding 為 3 */}
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 3, '&:last-child': { pb: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' } }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> {/* 恢復 mb: 1 */}
                <Typography variant="h4" sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', letterSpacing: 0.5 }}> {/* 恢復字體 h4 */}
                  {greetingData.text}
                </Typography>
                <Box sx={{ ml: 1.5 }}>{greetingData.icon}</Box>
              </Box>
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}> {/* 恢復字體 h6 */}
                歡迎使用蓮華 ERP 管理系統
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                  數據最後更新：{new Date(lastUpdated).toLocaleTimeString()}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' }, mt: { xs: 3, md: 0 } }}>
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
        </CardContent>
      </Card>

      {/* 快捷功能與提醒 (恢復垂直間距) */}
      <Box sx={{ mb: 3 }}> {/* ★ 恢復為 3 */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, // 稍微寬鬆一點
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
                  onClick={() => window.location.href = action.link}
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
                    onClick={() => window.location.href = alert.link}
                    sx={{ cursor: 'pointer' }}
                    />
                ))}
                </Stack>
            </Box>
          )}
        </Paper>
      </Box>

      {/* 營運概況 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}> {/* 標題間距恢復 */}
        <AssessmentIcon color="primary" /> 營運概況
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 2, // gap 保持為 2 (16px) 比較剛好，不會太散
        mb: 4   // ★ 區塊間距恢復為 4 (32px)
      }}>
        <StatCard icon={<MonetizationOnIcon sx={{ fontSize: 36 }} />} title="今日營收" value={<>NT$ <PlainCurrency value={stats.todaySalesTotal} /></>} iconColor="#43A047" loading={loading} onClick={() => window.location.href = '#/sales'} />
        <StatCard icon={<ShoppingCartIcon sx={{ fontSize: 36 }} />} title="本月採購" value={<>NT$ <PlainCurrency value={stats.monthPurchaseTotal} /></>} iconColor="#FB8C00" loading={loading} onClick={() => window.location.href = '#/purchases'} />
        <StatCard icon={<ReceiptIcon sx={{ fontSize: 36 }} />} title="本月費用" value={<>NT$ <PlainCurrency value={stats.monthExpenseTotal} /></>} iconColor="#8E24AA" loading={loading} onClick={() => window.location.href = '#/expenses'} />
        <StatCard icon={<TrendingUpIcon sx={{ fontSize: 36 }} />} title="本月淨利" value={<Box sx={{ color: stats.netProfit >= 0 ? 'success.main' : 'error.main' }}>NT$ <PlainCurrency value={stats.netProfit} /></Box>} iconColor={stats.netProfit >= 0 ? '#4CAF50' : '#F44336'} loading={loading} />
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
        <StatCard icon={<MonetizationOnIcon sx={{ fontSize: 36 }} />} title="本月銷售總額" value={<>NT$ <PlainCurrency value={stats.monthSalesTotal} /></>} iconColor="#1976D2" loading={loading} onClick={() => window.location.href = '#/sales'} />
        <StatCard icon={<AccountBalanceWalletIcon sx={{ fontSize: 36 }} />} title="應收帳款 (AR)" value={<>NT$ <PlainCurrency value={stats.accountsReceivable} /></>} iconColor="#0288D1" loading={loading} onClick={() => window.location.href = '#/ar'} />
        <StatCard icon={<MoneyOffIcon sx={{ fontSize: 36 }} />} title="應付帳款 (AP)" value={<>NT$ <PlainCurrency value={stats.accountsPayable} /></>} iconColor="#D32F2F" loading={loading} onClick={() => window.location.href = '#/ap'} />
        <StatCard icon={<AssessmentIcon sx={{ fontSize: 36 }} />} title="淨利率" value={<Box sx={{ color: stats.profitMargin >= 0 ? 'success.main' : 'error.main' }}>{formatPercent(stats.profitMargin)}</Box>} iconColor={stats.profitMargin >= 0 ? '#4CAF50' : '#F44336'} loading={loading} />
      </Box>

      {/* 業務概況 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
        <StoreIcon color="secondary" /> 業務概況
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
        gap: 2 
      }}>
        <StatCard icon={<StoreIcon sx={{ fontSize: 36 }} />} title="合作供應商" value={stats.supplierCount} iconColor="#1E88E5" loading={loading} onClick={() => window.location.href = '#/suppliers'} />
        <StatCard icon={<PeopleIcon sx={{ fontSize: 36 }} />} title="累計客戶" value={stats.customerCount} iconColor="#5E35B1" loading={loading} onClick={() => window.location.href = '#/order_customers'} />
        <StatCard icon={<InventoryIcon sx={{ fontSize: 36 }} />} title="上架商品" value={stats.activeProductCount} iconColor="#00796B" loading={loading} onClick={() => window.location.href = '#/products'} />
        <StatCard icon={<PendingActionsIcon sx={{ fontSize: 36 }} />} title="未結案訂單" value={stats.pendingOrderCount} iconColor="#F57C00" loading={loading} onClick={() => window.location.href = '#/orders'} />
      </Box>

      {error && <MuiAlert severity="error" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>載入數據時發生錯誤：{error.message}</MuiAlert>}
      <Snackbar open={refreshSuccess} autoHideDuration={3000} onClose={() => setRefreshSuccess(false)} message="儀表板數據已更新" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </DashboardLayout>
  );
};

export default Dashboard;
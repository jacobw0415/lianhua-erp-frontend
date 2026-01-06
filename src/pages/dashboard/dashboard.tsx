// src/pages/dashboard/Dashboard.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Skeleton,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
  useTheme,
  Fade
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
import RefreshIcon from '@mui/icons-material/Refresh';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarningIcon from '@mui/icons-material/Warning';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightlightIcon from '@mui/icons-material/Nightlight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { useDashboardStats } from '@/hooks/useDashboardStats';
import { PlainCurrency } from '@/components/money/PlainCurrency';

/* =========================================================
 * Helper Functions
 * ========================================================= */

// 獲取動態問候語和圖標
const getGreeting = (): { text: string; icon: React.ReactNode } => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      text: '早安',
      icon: <WbSunnyIcon sx={{ fontSize: 28, verticalAlign: 'middle', ml: 0.5 }} />
    };
  }
  if (hour < 18) {
    return {
      text: '午安',
      icon: <WbSunnyIcon sx={{ fontSize: 28, verticalAlign: 'middle', ml: 0.5, color: '#FFA726' }} />
    };
  }
  return {
    text: '晚安',
    icon: <NightlightIcon sx={{ fontSize: 28, verticalAlign: 'middle', ml: 0.5 }} />
  };
};

// 格式化日期（年月日 星期X）
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];

  return `${year}年${month}月${day}日 星期${weekday}`;
};

// 格式化時間（今天 HH:MM 或完整時間）
const formatTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];

  // 判斷是否是今天
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) {
    return `現在 ${hours}:${minutes}`;
  }

  return `${year}年${month}月${day}日 星期${weekday} ${hours}:${minutes}`;
};

// 格式化相對時間（多久前更新）
const formatRelativeTime = (date: Date | null): string => {
  if (!date) return '尚未更新';

  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // 秒

  if (diff < 60) return '剛剛更新';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前更新`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小時前更新`;
  return formatDateTime(date);
};

// 格式化百分比
const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

/* =========================================================
 * StatCard Component (優化：使用 React.memo)
 * ========================================================= */

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  iconColor: string;
  loading?: boolean;
  onClick?: () => void;
}

const StatCard = React.memo<StatCardProps>(({
  icon,
  title,
  value,
  iconColor,
  loading,
  onClick
}) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: 2,
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      // 只針對 hover 效果使用過渡，主題切換相關屬性（背景色、文字顏色）不使用過渡
      transition: onClick ? 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out' : 'none',
      '&:hover': onClick ? {
        boxShadow: 4,
        transform: 'translateY(-2px)',
      } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            color: iconColor,
            fontSize: 40,
            mr: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
            {title}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={100} height={40} />
          ) : (
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
          )}
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
  const { stats, loading, error, refresh, lastUpdated } = useDashboardStats();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // 優化：只在分鐘變化時更新時間（減少不必要的重渲染）
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // 立即更新一次
    updateTime();

    // 計算到下一個分鐘的毫秒數
    const now = new Date();
    const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    let intervalId: ReturnType<typeof setInterval> | null = null;

    // 設置定時器，在下一個分鐘時開始每分鐘更新
    const timer = setTimeout(() => {
      updateTime();
      intervalId = setInterval(updateTime, 60000);
    }, msUntilNextMinute);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // 處理刷新（使用 useCallback 優化）
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    try {
      await refresh();
      setRefreshSuccess(true);
      // 3秒後自動關閉成功提示
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      console.error('刷新失敗：', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  // 鍵盤快捷鍵：F5 刷新
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F5 或 Ctrl+R / Cmd+R
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.metaKey && e.key === 'r')) {
        e.preventDefault();
        if (!isRefreshing && !loading) {
          handleRefresh();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRefresh, isRefreshing, loading]);

  // 獲取主題
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 為頁面級別滾動條應用統一樣式
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
      // 組件卸載時移除樣式
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [isDark]);

  // 使用 useMemo 優化計算值
  const greetingData = useMemo(() => getGreeting(), []);
  const formattedDate = useMemo(() => formatDate(currentTime), [currentTime]);
  const formattedTime = useMemo(() => formatTime(currentTime), [currentTime]);
  const relativeUpdateTime = useMemo(() => formatRelativeTime(lastUpdated), [lastUpdated]);

  // 計算提醒列表
  const alerts = useMemo(() => {
    const alertList: Array<{ message: string; link: string; severity: 'info' | 'warning' | 'error' }> = [];

    if (stats.pendingOrderCount > 0) {
      alertList.push({
        message: `有 ${stats.pendingOrderCount} 筆待處理訂單`,
        link: '#/orders',
        severity: 'warning',
      });
    }

    if (stats.accountsPayable > 100000) {
      alertList.push({
        message: `應付款項較高：NT$ ${stats.accountsPayable.toLocaleString()}`,
        link: '#/ap',
        severity: 'info',
      });
    }

    if (stats.accountsReceivable > 100000) {
      alertList.push({
        message: `應收款項較高：NT$ ${stats.accountsReceivable.toLocaleString()}`,
        link: '#/ar',
        severity: 'info',
      });
    }

    return alertList;
  }, [stats.pendingOrderCount, stats.accountsPayable, stats.accountsReceivable]);

  // 從主題配置獲取歡迎字卡背景色（帶透明度）
  const cardBackground = isDark
    ? 'rgba(27, 94, 32, 0.85)' // #1B5E20 帶透明度
    : 'rgba(46, 125, 50, 0.85)'; // #2E7D32 帶透明度

  return (
    <Box sx={{ padding: 3 }}>
      {/* 歡迎區 */}
      <Fade in timeout={500}>
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
            // 移除過渡，讓主題切換立即生效
          }}
        >
          {/* 背景裝飾 - 多層次 */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              opacity: 0.2,
            }}
          />

          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                    {greetingData.text}！
                  </Typography>
                  {greetingData.icon}
                </Box>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.95, mb: 1.5 }}>
                  歡迎使用蓮華 ERP 管理系統
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {formattedDate}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon sx={{ fontSize: 16, opacity: 0.9 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {formattedTime}
                    </Typography>
                  </Box>
                </Box>
                {lastUpdated && (
                  <Typography variant="caption" sx={{ opacity: 0.8, display: 'block' }}>
                    數據更新時間：{relativeUpdateTime}
                  </Typography>
                )}
              </Box>

              {/* 刷新按鈕 */}
              <Tooltip title="刷新數據 (F5)">
                <IconButton
                  onClick={handleRefresh}
                  disabled={isRefreshing || loading}
                  disableRipple
                  disableFocusRipple
                  sx={{
                    color: '#fff',
                    backgroundColor: 'transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'scale(1.05)',
                    },
                    '&:focus': {
                      outline: 'none',
                      backgroundColor: 'transparent',
                    },
                  }}
                >
                  <RefreshIcon sx={{
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }} />
                </IconButton>
              </Tooltip>
            </Box>

            {/* 重要提醒 */}
            {!loading && alerts.length > 0 && (
              <Fade in timeout={600}>
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {alerts.map((alert, index) => (
                      <Chip
                        key={index}
                        icon={alert.severity === 'warning' ? <WarningIcon /> : <PendingActionsIcon />}
                        label={alert.message}
                        onClick={() => window.location.href = alert.link}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.35)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}

            {/* 快速操作按鈕 */}
            <Box sx={{
              mt: 3,
              pt: 2,
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(4, 1fr)',
                  },
                  gap: 1.5,
                }}
              >
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PointOfSaleIcon />}
                  onClick={() => window.location.href = '#/sales/create'}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  新增銷售
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Inventory2Icon />}
                  onClick={() => window.location.href = '#/purchases/create'}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  新增進貨
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MoneyOffIcon />}
                  onClick={() => window.location.href = '#/expenses/create'}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  新增支出
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ShoppingBagIcon />}
                  onClick={() => window.location.href = '#/orders/create'}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    },
                  }}
                >
                  新增訂單
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* 錯誤提示 */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              重試
            </Button>
          }
        >
          載入數據時發生錯誤：{error.message}
        </Alert>
      )}

      {/* 刷新成功提示 */}
      <Snackbar
        open={refreshSuccess}
        autoHideDuration={3000}
        onClose={() => setRefreshSuccess(false)}
        message="數據已成功刷新"
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />

      {/* 載入中狀態 */}
      {loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 主要統計指標 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        主要統計指標
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
          title="今日營收"
          value={<>NT$ <PlainCurrency value={stats.todaySalesTotal} /></>}
          iconColor="#43A047"
          loading={loading}
          onClick={() => window.location.href = '#/sales'}
        />
        <StatCard
          icon={<ShoppingCartIcon sx={{ fontSize: 40 }} />}
          title="本月採購"
          value={<>NT$ <PlainCurrency value={stats.monthPurchaseTotal} /></>}
          iconColor="#FB8C00"
          loading={loading}
          onClick={() => window.location.href = '#/purchases'}
        />
        <StatCard
          icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
          title="本月費用"
          value={<>NT$ <PlainCurrency value={stats.monthExpenseTotal} /></>}
          iconColor="#8E24AA"
          loading={loading}
          onClick={() => window.location.href = '#/expenses'}
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
          title="本月淨利"
          value={
            <Box
              sx={{
                color: stats.netProfit >= 0 ? 'success.main' : 'error.main',
              }}
            >
              NT$ <PlainCurrency value={stats.netProfit} />
            </Box>
          }
          iconColor={stats.netProfit >= 0 ? '#4CAF50' : '#F44336'}
          loading={loading}
        />
      </Box>

      {/* 銷售與財務指標 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        銷售與財務
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          icon={<MonetizationOnIcon sx={{ fontSize: 40 }} />}
          title="本月銷售"
          value={<>NT$ <PlainCurrency value={stats.monthSalesTotal} /></>}
          iconColor="#1976D2"
          loading={loading}
          onClick={() => window.location.href = '#/sales'}
        />
        <StatCard
          icon={<AccountBalanceWalletIcon sx={{ fontSize: 40 }} />}
          title="應收款項"
          value={<>NT$ <PlainCurrency value={stats.accountsReceivable} /></>}
          iconColor="#0288D1"
          loading={loading}
          onClick={() => window.location.href = '#/ar'}
        />
        <StatCard
          icon={<ReceiptIcon sx={{ fontSize: 40 }} />}
          title="應付款項"
          value={<>NT$ <PlainCurrency value={stats.accountsPayable} /></>}
          iconColor="#D32F2F"
          loading={loading}
          onClick={() => window.location.href = '#/ap'}
        />
        <StatCard
          icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
          title="利潤率"
          value={
            <Box
              sx={{
                color: stats.profitMargin >= 0 ? 'success.main' : 'error.main',
              }}
            >
              {formatPercent(stats.profitMargin)}
            </Box>
          }
          iconColor={stats.profitMargin >= 0 ? '#4CAF50' : '#F44336'}
          loading={loading}
        />
      </Box>

      {/* 業務指標 */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        業務指標
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
        }}
      >
        <StatCard
          icon={<StoreIcon sx={{ fontSize: 40 }} />}
          title="供應商數量"
          value={stats.supplierCount}
          iconColor="#1E88E5"
          loading={loading}
          onClick={() => window.location.href = '#/suppliers'}
        />
        <StatCard
          icon={<PeopleIcon sx={{ fontSize: 40 }} />}
          title="客戶數量"
          value={stats.customerCount}
          iconColor="#5E35B1"
          loading={loading}
          onClick={() => window.location.href = '#/order_customers'}
        />
        <StatCard
          icon={<InventoryIcon sx={{ fontSize: 40 }} />}
          title="啟用商品數"
          value={stats.activeProductCount}
          iconColor="#00796B"
          loading={loading}
          onClick={() => window.location.href = '#/products'}
        />
        <StatCard
          icon={<PendingActionsIcon sx={{ fontSize: 40 }} />}
          title="待處理訂單"
          value={stats.pendingOrderCount}
          iconColor="#F57C00"
          loading={loading}
          onClick={() => window.location.href = '#/orders'}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;

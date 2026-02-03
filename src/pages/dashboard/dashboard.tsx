import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Snackbar, useTheme, Alert as MuiAlert } from '@mui/material';

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

import { DashboardProvider, useDashboardContext } from '@/contexts/DashboardContext';
import { DashboardLayout } from '@/layout/DashboardLayout';
import { WelcomeCard, getGreeting } from '@/components/dashboard/WelcomeCard';
import { QuickActionsSection } from '@/components/dashboard/QuickActionsSection';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { StatSection } from '@/components/dashboard/sections/StatSection';
import { TrendAndExpenseSection } from '@/components/dashboard/sections/TrendAndExpenseSection';
import { AdvancedAnalysisSection } from '@/components/dashboard/sections/AdvancedAnalysisSection';
import { DashboardFinancialBlock } from '@/components/dashboard/blocks/DashboardFinancialBlock';
import { DashboardInsightsBlock } from '@/components/dashboard/blocks/DashboardInsightsBlock';
import { STAT_SECTIONS_CONFIG, QUICK_ACTIONS_CONFIG, ALERT_AP_WARNING_THRESHOLD, DASHBOARD_SNACKBAR_DURATION_MS } from '@/constants/dashboardConstants';
import { formatDashboardDate, formatDashboardTime } from '@/utils/dashboardFormatters';
import { buildStatSectionItems } from '@/utils/buildStatSectionItems';
import { applyBodyScrollbarStyles } from '@/utils/scrollbarStyles';
import type { AccountAgingBucket } from '@/hooks/useDashboardStats';

/* =========================================================
 * 規格對齊：四大區塊 = 核心 KPI｜趨勢分析｜財務健康｜經營洞察
 * 成本結構區塊：採購結構分析 + 單位成本走勢，僅 OWNER / MANAGER 可存取
 * 日期格式：YYYY-MM-DD (ISO Date)
 * 手動重新整理：F5 / 按鈕會同時 refetch stats + analytics
 * ========================================================= */

const STAT_ICON_MAP: Record<string, React.ReactNode> = {
  MonetizationOn: <MonetizationOnIcon sx={{ fontSize: 36 }} />,
  ShoppingCart: <ShoppingCartIcon sx={{ fontSize: 36 }} />,
  Store: <StoreIcon sx={{ fontSize: 36 }} />,
  Assessment: <AssessmentIcon sx={{ fontSize: 36 }} />,
  People: <PeopleIcon sx={{ fontSize: 36 }} />,
  Inventory: <InventoryIcon sx={{ fontSize: 36 }} />,
  Receipt: <ReceiptIcon sx={{ fontSize: 36 }} />,
  AccountBalanceWallet: <AccountBalanceWalletIcon sx={{ fontSize: 36 }} />,
  TrendingUp: <TrendingUpIcon sx={{ fontSize: 36 }} />,
  PendingActions: <PendingActionsIcon sx={{ fontSize: 36 }} />,
  MoneyOff: <MoneyOffIcon sx={{ fontSize: 36 }} />,
  Payments: <PaymentsIcon sx={{ fontSize: 36 }} />,
  AccountBalance: <AccountBalanceIcon sx={{ fontSize: 36 }} />,
  History: <HistoryIcon sx={{ fontSize: 36 }} />,
  EventNote: <EventNoteIcon sx={{ fontSize: 36 }} />,
};

const STAT_TITLE_ICON_MAP: Record<string, React.ReactNode> = {
  AccountBalanceWallet: <AccountBalanceWalletIcon color="info" />,
  Assessment: <AssessmentIcon color="primary" />,
  Payments: <PaymentsIcon color="success" />,
  Store: <StoreIcon color="secondary" />,
};

const DashboardContent: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const ctx = useDashboardContext();

  const {
    filters,
    stats,
    loading,
    error,
    lastUpdated,
    handleRefresh,
    isRefreshing,
    hasMounted,
    derived,
    expenses,
    isTrendsLoading,
    isExpensesLoading,
    accountsAging,
    isAccountsAgingLoading,
    isOrderFunnelLoading,
    currentTime,
  } = ctx;

  const { trendDays, setTrendDays, orderFunnelMetric, setOrderFunnelMetric } = filters;
  const { safeTrendData, orderFunnelDisplay } = derived;

  const [refreshSuccess, setRefreshSuccess] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        if (!isRefreshing && !loading) {
          handleRefresh().then(() => {
            setRefreshSuccess(true);
            setTimeout(() => setRefreshSuccess(false), DASHBOARD_SNACKBAR_DURATION_MS);
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleRefresh, isRefreshing, loading]);

  useEffect(() => {
    return applyBodyScrollbarStyles(theme);
  }, [theme]);

  const greetingData = useMemo(() => getGreeting(theme.palette), [theme.palette]);
  const formattedDateStr = useMemo(() => formatDashboardDate(currentTime), [currentTime]);
  const formattedTimeStr = useMemo(() => formatDashboardTime(currentTime), [currentTime]);

  const alerts = useMemo(() => {
    const list: { label: string; path: string; color: 'warning' | 'error'; icon: React.ReactNode }[] = [];
    if (stats.pendingOrderCount > 0) {
      list.push({
        label: `待處理訂單 (${stats.pendingOrderCount})`,
        path: '/orders',
        color: 'warning',
        icon: <WarningIcon />,
      });
    }
    if (stats.accountsPayable > ALERT_AP_WARNING_THRESHOLD) {
      list.push({ label: '應付帳款偏高', path: '/ap', color: 'error', icon: <MoneyOffIcon /> });
    }
    return list;
  }, [stats]);

  const quickActions = useMemo(
    () =>
      QUICK_ACTIONS_CONFIG.map((config, i) => ({
        ...config,
        icon: [<PointOfSaleIcon key="sales" />, <Inventory2Icon key="purchases" />, <MoneyOffIcon key="expenses" />, <ShoppingBagIcon key="orders" />][i],
      })),
    []
  );

  const alertsForQuick = useMemo(
    () => alerts.map((a) => ({ label: a.label, path: a.path, color: a.color })),
    [alerts]
  );

  const statSections = useMemo(
    () =>
      STAT_SECTIONS_CONFIG.map((sectionConfig) =>
        buildStatSectionItems(
          sectionConfig,
          stats,
          loading,
          navigate,
          STAT_ICON_MAP,
          STAT_TITLE_ICON_MAP
        )
      ),
    [stats, loading, navigate]
  );

  return (
    <DashboardLayout isLoading={loading} hasData={!!stats}>
      <WelcomeCard
        greeting={greetingData}
        formattedDate={formattedDateStr}
        formattedTime={formattedTimeStr}
        lastUpdated={
          lastUpdated != null
            ? typeof lastUpdated === 'string'
              ? lastUpdated
              : (lastUpdated as Date).toISOString()
            : undefined
        }
      />

      <QuickActionsSection
        quickActions={quickActions}
        alerts={alertsForQuick}
      />

      {statSections.map((section) => (
        <StatSection
          key={section.title}
          title={section.title}
          titleIcon={section.titleIcon}
          items={section.items}
        />
      ))}

      <DashboardFinancialBlock />

      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="營運與收現狀況"
          subtitle="Operation & Cash Collection Overview"
          icon={<AssessmentIcon color="primary" />}
        />
        <TrendAndExpenseSection
          trendDays={trendDays}
          setTrendDays={setTrendDays}
          safeTrendData={safeTrendData}
          isTrendsLoading={isTrendsLoading}
          hasMounted={hasMounted}
          expenses={expenses}
          isExpensesLoading={isExpensesLoading}
          variant="trendOnly"
        />
        <AdvancedAnalysisSection
          hasMounted={hasMounted}
          accountsAging={accountsAging as AccountAgingBucket[] | undefined}
          isAccountsAgingLoading={isAccountsAgingLoading}
          orderFunnelDisplay={orderFunnelDisplay}
          orderFunnelMetric={orderFunnelMetric}
          setOrderFunnelMetric={setOrderFunnelMetric}
          isOrderFunnelLoading={isOrderFunnelLoading}
          blockLayout
        />
      </Box>

      <DashboardInsightsBlock />

      {error && (
        <MuiAlert severity="error" sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}>
          載入數據時發生錯誤：{error.message}
        </MuiAlert>
      )}
      <Snackbar
        open={refreshSuccess}
        autoHideDuration={DASHBOARD_SNACKBAR_DURATION_MS}
        onClose={() => setRefreshSuccess(false)}
        message="儀表板數據已更新"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </DashboardLayout>
  );
};

const Dashboard = () => (
  <DashboardProvider>
    <DashboardContent />
  </DashboardProvider>
);

export default Dashboard;

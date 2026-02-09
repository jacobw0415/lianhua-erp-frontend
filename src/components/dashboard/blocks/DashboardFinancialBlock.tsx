import React from 'react';
import { Box } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import dayjs from 'dayjs';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { ProfitLossSection } from '@/components/dashboard/sections/ProfitLossSection';
import { BreakEvenSection } from '@/components/dashboard/sections/BreakEvenSection';
import { LiquiditySection } from '@/components/dashboard/sections/LiquiditySection';
import { CashflowForecastSection } from '@/components/dashboard/sections/CashflowForecastSection';
import { DASHBOARD_GRID } from '@/constants/dashboardConstants';
import { useDashboardContext } from '@/contexts/DashboardContext';

export const DashboardFinancialBlock: React.FC = () => {
  const {
    hasMounted,
    filters,
    profitLossTrend,
    isProfitLossTrendLoading,
    breakEven,
    isBreakEvenLoading,
    liquidity,
    isLiquidityLoading,
    cashflowForecast,
    isCashflowForecastLoading,
    derived,
    currentTime,
  } = useDashboardContext();

  const {
    profitLossMonths,
    setProfitLossMonths,
    breakEvenPeriod,
    setBreakEvenPeriod,
    breakEvenMonthOptions,
    cashflowStart,
    cashflowEnd,
    setCashflowStart,
    setCashflowEnd,
    defaultCashflow,
  } = filters;

  const liquiditySnapshotLabel = dayjs(currentTime).format('YYYY-MM-DD HH:mm');

  return (
    <Box sx={{ mb: 4 }}>
      <SectionHeader
        title="財務績效與資金健康"
        subtitle="Financial Performance & Liquidity"
        icon={<AccountBalanceWalletIcon color="primary" />}
      />
      <Box sx={{ mb: 2 }}>
        <ProfitLossSection
          hasMounted={hasMounted}
          profitLossMonths={profitLossMonths}
          setProfitLossMonths={setProfitLossMonths}
          profitLossTrend={profitLossTrend}
          isProfitLossTrendLoading={isProfitLossTrendLoading}
        />
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: DASHBOARD_GRID.columns,
          gap: DASHBOARD_GRID.gap,
          mb: DASHBOARD_GRID.mb,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
        }}
      >
        <BreakEvenSection
          breakEvenPeriod={breakEvenPeriod}
          setBreakEvenPeriod={setBreakEvenPeriod}
          breakEvenMonthOptions={breakEvenMonthOptions}
          isBreakEvenCurrentOrFutureMonth={derived.isBreakEvenCurrentOrFutureMonth}
          breakEven={breakEven}
          isBreakEvenLoading={isBreakEvenLoading}
        />
        <LiquiditySection
          liquidity={liquidity}
          isLoading={isLiquidityLoading}
          snapshotLabel={liquiditySnapshotLabel}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <CashflowForecastSection
          data={cashflowForecast}
          isLoading={isCashflowForecastLoading}
          startDate={cashflowStart}
          endDate={cashflowEnd}
          onStartDateChange={setCashflowStart}
          onEndDateChange={setCashflowEnd}
          defaultStart={defaultCashflow.start}
          defaultEnd={defaultCashflow.end}
        />
      </Box>
    </Box>
  );
};

DashboardFinancialBlock.displayName = 'DashboardFinancialBlock';

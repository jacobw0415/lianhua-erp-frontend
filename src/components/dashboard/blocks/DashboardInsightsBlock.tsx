import React from 'react';
import { Box, Typography } from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { TrendAndExpenseSection } from '@/components/dashboard/sections/TrendAndExpenseSection';
import { PurchaseStructureSection } from '@/components/dashboard/sections/PurchaseStructureSection';
import { ProductParetoSection } from '@/components/dashboard/sections/ProductParetoSection';
import { SupplierConcentrationSection } from '@/components/dashboard/sections/SupplierConcentrationSection';
import { CustomerRetentionSection } from '@/components/dashboard/sections/CustomerRetentionSection';
import { CustomerConcentrationSection } from '@/components/dashboard/sections/CustomerConcentrationSection';
import { TaskListSection } from '@/components/dashboard/sections/TaskListSection';
import { DASHBOARD_GRID } from '@/constants/dashboardConstants';
import { useDashboardContext } from '@/contexts/DashboardContext';

export const DashboardInsightsBlock: React.FC = () => {
  const {
    canViewCostStructure,
    filters,
    trendDays,
    setTrendDays,
    isTrendsLoading,
    hasMounted,
    expenses,
    isExpensesLoading,
    isPurchaseStructureLoading,
    productPareto,
    isProductParetoLoading,
    supplierConcentration,
    isSupplierConcentrationLoading,
    isCustomerRetentionLoading,
    retentionDormantOnly,
    setRetentionDormantOnly,
    isCustomerConcentrationLoading,
    tasks,
    derived,
    customerConcentration,
  } = useDashboardContext();

  const {
    clampedRange,
    clampedCustomerConcentrationRange,
    customerConcentrationStart,
    customerConcentrationEnd,
    setCustomerConcentrationStart,
    setCustomerConcentrationEnd,
    defaultCustomerConcentrationRange,
  } = filters;
  const {
    safeTrendData,
    purchaseStructureDisplay,
    pareto80Threshold,
    customerConcentrationDonutData,
    customerRetentionDisplay,
    customerConcentrationWarning: showWarning,
  } = derived;

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="成本結構與經營洞察"
          subtitle="Cost Structure & Business Insights"
          icon={<ReceiptIcon color="primary" />}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: DASHBOARD_GRID.columns, gap: DASHBOARD_GRID.gap, mb: DASHBOARD_GRID.mb }}>
          <TrendAndExpenseSection
            trendDays={trendDays}
            setTrendDays={setTrendDays}
            safeTrendData={safeTrendData}
            isTrendsLoading={isTrendsLoading}
            hasMounted={hasMounted}
            expenses={expenses}
            isExpensesLoading={isExpensesLoading}
            variant="expenseOnly"
            dateRangeLabel={`${clampedRange.start} ~ ${clampedRange.end}`}
          />
          {canViewCostStructure ? (
            <PurchaseStructureSection
              data={purchaseStructureDisplay}
              isLoading={isPurchaseStructureLoading}
              dateRangeLabel={`${clampedRange.start} ~ ${clampedRange.end}`}
            />
          ) : (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                minHeight: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                成本結構區塊僅限 OWNER / MANAGER 角色檢視
              </Typography>
            </Box>
          )}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: DASHBOARD_GRID.columns, gap: DASHBOARD_GRID.gap, mb: DASHBOARD_GRID.mb }}>
          <ProductParetoSection
            data={productPareto}
            isLoading={isProductParetoLoading}
            dateRangeLabel={`${clampedRange.start} ~ ${clampedRange.end}`}
            pareto80Threshold={pareto80Threshold}
          />
          <SupplierConcentrationSection
            data={supplierConcentration}
            isLoading={isSupplierConcentrationLoading}
            dateRangeLabel={`${clampedRange.start} ~ ${clampedRange.end}`}
          />
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <SectionHeader
          title="客戶關係與營運風險"
          subtitle="Customer & Operational Risk Management"
          icon={<PeopleIcon color="primary" />}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: DASHBOARD_GRID.columns, gap: DASHBOARD_GRID.gap, alignItems: 'stretch', mb: DASHBOARD_GRID.mb }}>
          <CustomerRetentionSection
            data={customerRetentionDisplay}
            isLoading={isCustomerRetentionLoading}
            dormantOnly={retentionDormantOnly}
            onDormantOnlyChange={setRetentionDormantOnly}
          />
          <CustomerConcentrationSection
            donutData={customerConcentrationDonutData}
            rawData={customerConcentration}
            isLoading={isCustomerConcentrationLoading}
            dateRangeLabel={`${clampedCustomerConcentrationRange.start} ~ ${clampedCustomerConcentrationRange.end}`}
            startDate={customerConcentrationStart}
            endDate={customerConcentrationEnd}
            onStartDateChange={setCustomerConcentrationStart}
            onEndDateChange={setCustomerConcentrationEnd}
            defaultStart={defaultCustomerConcentrationRange.start}
            defaultEnd={defaultCustomerConcentrationRange.end}
            showWarning={showWarning}
          />
        </Box>
        <Box sx={{ mt: 0 }}>
          <TaskListSection tasks={tasks} />
        </Box>
      </Box>
    </>
  );
};

DashboardInsightsBlock.displayName = 'DashboardInsightsBlock';

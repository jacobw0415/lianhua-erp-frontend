import React from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { ChartEmptyState } from '../ChartEmptyState';
import { CHART_COLORS } from '@/constants/chartColors';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle } from '@/utils/chartTooltipStyle';

type OrderMetric = 'amount' | 'count';

interface AccountsAgingItem {
  bucketLabel: string;
  arAmount: number;
  apAmount: number;
}

interface OrderFunnelDisplayItem {
  stageLabel: string;
  totalAmount?: number;
  orderCount?: number;
}

interface AdvancedAnalysisSectionProps {
  isDark: boolean;
  hasMounted: boolean;
  accountsAging: AccountsAgingItem[] | undefined;
  isAccountsAgingLoading: boolean;
  orderFunnelDisplay: OrderFunnelDisplayItem[];
  orderFunnelMetric: OrderMetric;
  setOrderFunnelMetric: (metric: OrderMetric) => void;
  isOrderFunnelLoading: boolean;
}

export const AdvancedAnalysisSection: React.FC<AdvancedAnalysisSectionProps> = ({
  isDark,
  hasMounted,
  accountsAging,
  isAccountsAgingLoading,
  orderFunnelDisplay,
  orderFunnelMetric,
  setOrderFunnelMetric,
  isOrderFunnelLoading,
}) => {
  const theme = useTheme();

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          進階營運分析
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
        <Paper sx={{ p: 3, borderRadius: 2, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            帳款帳齡風險
          </Typography>
          <Box sx={{ flexGrow: 1, minHeight: 280, minWidth: 0 }}>
            {hasMounted && !isAccountsAgingLoading && accountsAging && accountsAging.length > 0 ? (
              <ChartContainer height={280}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={accountsAging} margin={{ top: 10, right: 20, left: 0, bottom: 20 }} barCategoryGap="18%">
                    <CartesianGrid
                      strokeDasharray="5 5"
                      vertical={false}
                      stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                    />
                    <XAxis
                      dataKey="bucketLabel"
                      tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                    />
                    <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={getChartTooltipContentStyle(theme)}
                      formatter={(value: any, name: any) => [`NT$ ${Number(value).toLocaleString()}`, name]}
                    />
                    <Legend />
                    <Bar
                      dataKey="arAmount"
                      name="應收帳款"
                      stackId="amount"
                      fill={CHART_COLORS.revenue}
                      radius={[8, 8, 0, 0]}
                      isAnimationActive
                      animationDuration={400}
                    />
                    <Bar
                      dataKey="apAmount"
                      name="應付帳款"
                      stackId="amount"
                      fill={CHART_COLORS.expense}
                      radius={[8, 8, 0, 0]}
                      isAnimationActive
                      animationDuration={400}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                {isAccountsAgingLoading ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                ) : (
                  <ChartEmptyState />
                )}
              </Box>
            )}
          </Box>
        </Paper>

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
                  <BarChart
                    data={orderFunnelDisplay}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
                    barCategoryGap="12%"
                  >
                    <CartesianGrid
                      strokeDasharray="1 4"
                      horizontal={false}
                      stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                    />
                    <XAxis
                      type="number"
                      tickFormatter={(v) =>
                        orderFunnelMetric === 'amount' ? formatAxisCurrency(v) : String(v)
                      }
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="stageLabel"
                      type="category"
                      width={80}
                      tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    />
                    <Tooltip
                      contentStyle={getChartTooltipContentStyle(theme)}
                      formatter={(value: any) => [
                        orderFunnelMetric === 'amount'
                          ? `NT$ ${Number(value).toLocaleString()}`
                          : String(value),
                        orderFunnelMetric === 'amount' ? '總金額' : '筆數',
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey={orderFunnelMetric === 'amount' ? 'totalAmount' : 'orderCount'}
                      name={orderFunnelMetric === 'amount' ? '訂單金額' : '訂單筆數'}
                      fill={CHART_COLORS.secondary}
                      radius={[0, 8, 8, 0]}
                      maxBarSize={28}
                      isAnimationActive
                      animationDuration={500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                {isOrderFunnelLoading ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                ) : (
                  <ChartEmptyState />
                )}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </>
  );
};


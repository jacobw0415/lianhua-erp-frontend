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
import type { TooltipContentProps } from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { ChartEmptyState } from '../ChartEmptyState';
import { CHART_COLORS } from '@/constants/chartColors';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle, getChartLegendStyle } from '@/utils/chartTooltipStyle';
import { getChartGridStroke } from '@/utils/chartTheme';

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
  hasMounted: boolean;
  accountsAging: AccountsAgingItem[] | undefined;
  isAccountsAgingLoading: boolean;
  orderFunnelDisplay: OrderFunnelDisplayItem[];
  orderFunnelMetric: OrderMetric;
  setOrderFunnelMetric: (metric: OrderMetric) => void;
  isOrderFunnelLoading: boolean;
  /** 區塊一使用時隱藏「進階營運分析」標題，並改為訂單履約(2)｜帳齡(3) 順序 */
  blockLayout?: boolean;
}

export const AdvancedAnalysisSection: React.FC<AdvancedAnalysisSectionProps> = ({
  hasMounted,
  accountsAging,
  isAccountsAgingLoading,
  orderFunnelDisplay,
  orderFunnelMetric,
  setOrderFunnelMetric,
  isOrderFunnelLoading,
  blockLayout = false,
}) => {
  const theme = useTheme();
  const gridStroke = getChartGridStroke(theme);

  /** 訂單履約進度：自訂 Tooltip，數值使用對應色調 */
  const renderOrderFunnelTooltip = (props: TooltipContentProps<number, string>) => {
    const { active, payload, label } = props;
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const name = orderFunnelMetric === 'amount' ? '訂單金額' : '訂單筆數';
    const displayValue =
      orderFunnelMetric === 'amount'
        ? `NT$ ${Number(item.value).toLocaleString()}`
        : String(item.value);
    return (
      <Paper
        elevation={8}
        sx={{
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          ...getChartTooltipContentStyle(theme),
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label ?? ''}
        </Typography>
        <Typography
          variant="body2"
          component="span"
          sx={{ display: 'block', color: item.color ?? theme.palette.text.primary }}
        >
          {name}: {displayValue}
        </Typography>
      </Paper>
    );
  };

  /** 應收／應付帳款帳齡：自訂 Tooltip，應收／應付使用對應色調 */
  const renderAccountsAgingTooltip = (props: TooltipContentProps<number, string>) => {
    const { active, payload, label } = props;
    if (!active || !payload?.length || label == null) return null;
    return (
      <Paper
        elevation={8}
        sx={{
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          ...getChartTooltipContentStyle(theme),
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((item, index) => (
          <Typography
            key={item.dataKey ?? item.name ?? index}
            variant="body2"
            component="span"
            sx={{ display: 'block', color: item.color ?? theme.palette.text.primary }}
          >
            {item.name}: {item.value != null ? `NT$ ${Number(item.value).toLocaleString()}` : '—'}
          </Typography>
        ))}
      </Paper>
    );
  };

  const orderFunnelPaper = (
    <Paper sx={{ p: 3, borderRadius: 2, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          訂單履約進度分析
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
                  stroke={gridStroke}
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
                <Tooltip content={renderOrderFunnelTooltip} />
                <Legend
                  wrapperStyle={getChartLegendStyle(theme)}
                  formatter={(value, entry: { color?: string }) => (
                    <span style={{ color: entry?.color ?? theme.palette.text.primary }}>{value}</span>
                  )}
                />
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
  );

  const accountsAgingPaper = (
    <Paper sx={{ p: 3, borderRadius: 2, minHeight: 360, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        應收／應付帳款帳齡分析
      </Typography>
      <Box sx={{ flexGrow: 1, minHeight: 280, minWidth: 0 }}>
        {hasMounted && !isAccountsAgingLoading && accountsAging && accountsAging.length > 0 ? (
          <ChartContainer height={280}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={accountsAging}
                margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="5 5"
                  vertical={false}
                  stroke={gridStroke}
                />
                <XAxis
                  dataKey="bucketLabel"
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
                <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 11 }} />
                <Tooltip content={renderAccountsAgingTooltip} />
                <Legend
                  wrapperStyle={getChartLegendStyle(theme)}
                  formatter={(value, entry: { color?: string }) => (
                    <span style={{ color: entry?.color ?? theme.palette.text.primary }}>{value}</span>
                  )}
                />
                <Bar
                  dataKey="arAmount"
                  name="應收帳款"
                  stackId="amount"
                  fill={CHART_COLORS.revenue}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
                  isAnimationActive
                  animationDuration={400}
                />
                <Bar
                  dataKey="apAmount"
                  name="應付帳款"
                  stackId="amount"
                  fill={CHART_COLORS.expense}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={48}
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
  );

  return (
    <>
      {!blockLayout && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            進階營運分析
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 3,
          mb: blockLayout ? 0 : 4,
        }}
      >
        {blockLayout ? (
          <>
            {orderFunnelPaper}
            {accountsAgingPaper}
          </>
        ) : (
          <>
            {accountsAgingPaper}
            {orderFunnelPaper}
          </>
        )}
      </Box>
    </>
  );
};


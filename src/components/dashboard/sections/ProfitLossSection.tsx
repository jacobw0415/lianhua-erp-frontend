import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  ComposedChart,
  Area,
  Line,
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
import { getChartTooltipContentStyle, getChartLegendStyle } from '@/utils/chartTooltipStyle';
import { getChartGridStroke } from '@/utils/chartTheme';

interface ProfitLossPoint {
  period: string;
  revenue: number;
  expense: number;
  grossProfit: number;
  netProfit: number;
}

interface ProfitLossSectionProps {
  hasMounted: boolean;
  profitLossMonths: number;
  setProfitLossMonths: (months: number) => void;
  profitLossTrend?: ProfitLossPoint[];
  isProfitLossTrendLoading: boolean;
}

export const ProfitLossSection: React.FC<ProfitLossSectionProps> = ({
  hasMounted,
  profitLossMonths,
  setProfitLossMonths,
  profitLossTrend,
  isProfitLossTrendLoading,
}) => {
  const theme = useTheme();
  const gridStroke = getChartGridStroke(theme);

  /** 損益趨勢：自訂 Tooltip，各指標名稱與金額使用對應線條色 */
  const renderProfitLossTooltip = (props: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color?: string; dataKey?: string }>;
    label?: string;
  }) => {
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
            {item.name}: NT$ {Number(item.value).toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          損益趨勢分析
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
      <Box sx={{ height: 300, flexGrow: 1, minWidth: 0 }}>
        {hasMounted && !isProfitLossTrendLoading && profitLossTrend && profitLossTrend.length > 0 ? (
          <ChartContainer height={300}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={profitLossTrend} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.netProfit} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART_COLORS.netProfit} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="expenseAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.expense} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={CHART_COLORS.expense} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="5 5"
                  vertical={false}
                  stroke={gridStroke}
                />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                />
                <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 11 }} />
                <Tooltip content={renderProfitLossTooltip} />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: 8, ...getChartLegendStyle(theme) }}
                  formatter={(value, entry: { color?: string }) => (
                    <span style={{ color: entry?.color ?? theme.palette.text.primary }}>{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="營收"
                  stroke={CHART_COLORS.netProfit}
                  fill="url(#revenueAreaGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="費用"
                  stroke={CHART_COLORS.expense}
                  fill="url(#expenseAreaGrad)"
                  strokeWidth={2}
                />
                <Line
                  type="natural"
                  dataKey="grossProfit"
                  name="毛利"
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="natural"
                  dataKey="netProfit"
                  name="淨利"
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            {isProfitLossTrendLoading ? (
              <Skeleton variant="rectangular" width="100%" height="100%" />
            ) : (
              <ChartEmptyState height={300} />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};


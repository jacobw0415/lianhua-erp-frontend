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
} from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { ChartEmptyState } from '../ChartEmptyState';
import { CHART_COLORS, PIE_COLORS } from '@/constants/chartColors';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle } from '@/utils/chartTooltipStyle';

interface TrendPoint {
  date: string;
  saleAmount: number;
  receiptAmount: number;
}

interface ExpenseItem {
  category: string;
  amount: number;
}

interface TrendAndExpenseSectionProps {
  isDark: boolean;
  trendDays: number;
  setTrendDays: (days: number) => void;
  safeTrendData: TrendPoint[];
  isTrendsLoading: boolean;
  hasMounted: boolean;
  expenses: ExpenseItem[];
  isExpensesLoading: boolean;
}

export const TrendAndExpenseSection: React.FC<TrendAndExpenseSectionProps> = ({
  isDark,
  trendDays,
  setTrendDays,
  safeTrendData,
  isTrendsLoading,
  hasMounted,
  expenses,
  isExpensesLoading,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
      <Paper sx={{ p: 3, borderRadius: 2, minHeight: 450, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            營運與收款趨勢
          </Typography>
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
                  <CartesianGrid
                    strokeDasharray="5 5"
                    vertical={false}
                    stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}
                  />
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
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={CHART_COLORS.netProfit}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickFormatter={(v) => formatAxisCurrency(v)}
                  />
                  <Tooltip
                    contentStyle={getChartTooltipContentStyle(theme)}
                    formatter={(val: any) => `NT$ ${Number(val).toLocaleString()}`}
                  />
                  <Legend verticalAlign="top" align="right" height={36} layout="horizontal" />
                  <Line
                    yAxisId="left"
                    type="natural"
                    dataKey="saleAmount"
                    name="零售營收"
                    stroke={CHART_COLORS.revenue}
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={600}
                  />
                  <Line
                    yAxisId="right"
                    type="natural"
                    dataKey="receiptAmount"
                    name="訂單收款"
                    stroke={CHART_COLORS.netProfit}
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                    dot={{ r: 3 }}
                    activeDot={{ r: 4 }}
                    isAnimationActive
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
              {isTrendsLoading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" />
              ) : (
                <ChartEmptyState message="當前區間無數據" height={350} />
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
          本月支出結構
        </Typography>
        <Box sx={{ width: '100%', minHeight: 320, minWidth: 0 }}>
          {hasMounted && !isExpensesLoading && expenses.length > 0 ? (
            <Box sx={{ position: 'relative', width: '100%', minHeight: 320 }}>
              <ChartContainer height={320}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={expenses}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={92}
                      paddingAngle={2}
                    >
                      {expenses.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke={theme.palette.background.paper}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={getChartTooltipContentStyle(theme)}
                      formatter={(val: any) => `NT$ ${Number(val).toLocaleString()}`}
                    />
                    <Legend verticalAlign="bottom" align="center" layout="horizontal" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              {/* 圓心總額標籤（絕對定位，不干擾 Recharts SVG） */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  NT$ {expenses.reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">本月支出總計</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320 }}>
              {isExpensesLoading ? (
                <Skeleton variant="circular" width={200} height={200} />
              ) : (
                <ChartEmptyState message="當前區間無數據" height={320} />
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};


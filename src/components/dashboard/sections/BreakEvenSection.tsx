import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Skeleton,
  useTheme,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BalanceIcon from '@mui/icons-material/Balance';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { ChartContainer } from '../ChartContainer';
import { ChartEmptyState } from '../ChartEmptyState';
import { CHART_COLORS } from '@/constants/chartColors';
import { DESIGN_PARETO_REF } from '@/constants/designSystem';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle } from '@/utils/chartTooltipStyle';

interface BreakEvenPoint {
  date: string;
  runningRevenue: number;
  runningExpense: number;
  breakEvenThreshold?: number;
}

interface BreakEvenSectionProps {
  isDark: boolean;
  breakEvenPeriod: string;
  setBreakEvenPeriod: (period: string) => void;
  breakEvenMonthOptions: { value: string; label: string }[];
  isBreakEvenCurrentOrFutureMonth: boolean;
  breakEven: BreakEvenPoint[];
  isBreakEvenLoading: boolean;
}

export const BreakEvenSection: React.FC<BreakEvenSectionProps> = ({
  isDark,
  breakEvenPeriod,
  setBreakEvenPeriod,
  breakEvenMonthOptions,
  isBreakEvenCurrentOrFutureMonth,
  breakEven,
  isBreakEvenLoading,
}) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 380, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BalanceIcon fontSize="small" /> 損益平衡分析
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setBreakEvenPeriod(dayjs(breakEvenPeriod).subtract(1, 'month').format('YYYY-MM'))}
            aria-label="上個月"
          >
            <ChevronLeftIcon />
          </IconButton>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select value={breakEvenPeriod} onChange={(e) => setBreakEvenPeriod(e.target.value)}>
              {breakEvenMonthOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            size="small"
            onClick={() => setBreakEvenPeriod(dayjs(breakEvenPeriod).add(1, 'month').format('YYYY-MM'))}
            aria-label="下個月"
            disabled={isBreakEvenCurrentOrFutureMonth}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ height: 300, flexGrow: 1 }}>
        {isBreakEvenLoading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        ) : breakEven.length > 0 ? (
          <ChartContainer height={300}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={breakEven} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="1 4" vertical={false} stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => dayjs(v).format('MM/DD')} />
                <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={getChartTooltipContentStyle(theme)}
                  formatter={(val: number | undefined) => [val != null ? `NT$ ${Number(val).toLocaleString()}` : '', '']}
                />
                <Legend />
                <Line type="natural" dataKey="runningRevenue" name="累計營收" stroke={CHART_COLORS.revenue} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 4, strokeWidth: 2 }} isAnimationActive animationDuration={400} />
                <Line type="natural" dataKey="runningExpense" name="累計支出" stroke={CHART_COLORS.expense} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} isAnimationActive animationDuration={400} />
                <Line type="monotone" dataKey="breakEvenThreshold" name="損益平衡門檻" stroke={DESIGN_PARETO_REF} strokeDasharray="5 5" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={400} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <ChartEmptyState message="暫無數據" height={300} />
        )}
      </Box>
    </Paper>
  );
};

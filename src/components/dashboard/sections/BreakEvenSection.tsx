import React from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
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
import type { BreakEvenPoint } from '@/hooks/useDashboardAnalytics';
import { ChartContainer } from '../ChartContainer';
import { DashboardChartCard } from '../DashboardChartCard';
import { CHART_COLORS } from '@/constants/chartColors';
import { DESIGN_PARETO_REF } from '@/constants/designSystem';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle, getChartLegendStyle } from '@/utils/chartTooltipStyle';
import { getChartGridStroke } from '@/utils/chartTheme';

export interface BreakEvenSectionProps {
  breakEvenPeriod: string;
  setBreakEvenPeriod: (period: string) => void;
  breakEvenMonthOptions: { value: string; label: string }[];
  isBreakEvenCurrentOrFutureMonth: boolean;
  breakEven: BreakEvenPoint[];
  isBreakEvenLoading: boolean;
}

export const BreakEvenSection: React.FC<BreakEvenSectionProps> = ({
  breakEvenPeriod,
  setBreakEvenPeriod,
  breakEvenMonthOptions,
  isBreakEvenCurrentOrFutureMonth,
  breakEven,
  isBreakEvenLoading,
}) => {
  const theme = useTheme();
  const gridStroke = getChartGridStroke(theme);

  /** 損益平衡點：自訂 Tooltip，各指標名稱與金額使用對應線條色 */
  const renderBreakEvenTooltip = (props: {
    active?: boolean;
    payload?: readonly { name: string; value: number; color?: string; dataKey?: string }[];
    label?: string | number;
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
          {dayjs(label).format('YYYY-MM-DD')}
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

  const actions = (
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
  );

  return (
    <DashboardChartCard
      title={
        <>
          <BalanceIcon fontSize="small" /> 損益平衡點分析
        </>
      }
      actions={actions}
      loading={isBreakEvenLoading}
      hasData={breakEven.length > 0}
      emptyMessage="暫無數據"
      height={300}
    >
      <ChartContainer height={300}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={breakEven} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="1 4" vertical={false} stroke={gridStroke} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => dayjs(v).format('MM/DD')} />
            <YAxis tickFormatter={(v) => formatAxisCurrency(v)} tick={{ fontSize: 10 }} />
            <Tooltip content={renderBreakEvenTooltip} />
            <Legend
              wrapperStyle={getChartLegendStyle(theme)}
              formatter={(value, entry: { color?: string }) => (
                <span style={{ color: entry?.color ?? theme.palette.text.primary }}>{value}</span>
              )}
            />
            <Line type="natural" dataKey="runningRevenue" name="累計營收" stroke={CHART_COLORS.revenue} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 4, strokeWidth: 2 }} isAnimationActive animationDuration={400} />
            <Line type="natural" dataKey="runningExpense" name="累計支出" stroke={CHART_COLORS.expense} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 4 }} isAnimationActive animationDuration={400} />
            <Line type="monotone" dataKey="breakEvenThreshold" name="損益平衡門檻" stroke={DESIGN_PARETO_REF} strokeDasharray="5 5" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={400} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </DashboardChartCard>
  );
};

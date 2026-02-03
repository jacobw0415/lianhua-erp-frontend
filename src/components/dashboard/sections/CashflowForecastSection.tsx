import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { ChartContainer } from '../ChartContainer';
import { DashboardChartCard } from '../DashboardChartCard';
import { CHART_COLORS } from '@/constants/chartColors';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle, getChartLegendStyle } from '@/utils/chartTooltipStyle';
import { getChartGridStroke, getChartReferenceLineStroke } from '@/utils/chartTheme';
import type { CashflowForecastPoint } from '@/hooks/useDashboardAnalytics';

export interface CashflowForecastSectionProps {
  data: CashflowForecastPoint[];
  isLoading: boolean;
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  defaultStart: string;
  defaultEnd: string;
}

export const CashflowForecastSection: React.FC<CashflowForecastSectionProps> = ({
  data,
  isLoading,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  defaultStart,
  defaultEnd,
}) => {
  const theme = useTheme();
  const gridStroke = getChartGridStroke(theme);
  const refLineStroke = getChartReferenceLineStroke(theme);

  const chartData = React.useMemo(
    () =>
      data.map((d) => ({
        ...d,
        outflowNegative: -(d.outflow ?? 0),
      })),
    [data]
  );

  /** 現金流量預測：自訂 Tooltip，流入／流出／淨流入使用對應色調 */
  const renderCashflowForecastTooltip = (props: {
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

  return (
    <DashboardChartCard
      title={
        <>
          <TimelineIcon fontSize="small" /> 現金流量預測分析
        </>
      }
      actions={
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
          <DatePicker
            label="基準日"
            value={startDate ? dayjs(startDate) : null}
            onChange={(v) => onStartDateChange(v ? v.format('YYYY-MM-DD') : defaultStart)}
            format="YYYY-MM-DD"
            maxDate={endDate ? dayjs(endDate) : undefined}
            slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
          />
          <DatePicker
            label="結束日"
            value={endDate ? dayjs(endDate) : null}
            onChange={(v) => onEndDateChange(v ? v.format('YYYY-MM-DD') : defaultEnd)}
            format="YYYY-MM-DD"
            minDate={startDate ? dayjs(startDate) : undefined}
            slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
          />
        </LocalizationProvider>
      }
      loading={isLoading}
      hasData={chartData.length > 0}
      height={260}
    >
      <ChartContainer height={260}>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 48, bottom: 24 }}
            barGap={4}
            barCategoryGap="12%"
          >
            <CartesianGrid strokeDasharray="5 5" vertical={false} stroke={gridStroke} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => dayjs(v).format('MM/DD')} />
            <YAxis
              tickFormatter={(v) => formatAxisCurrency(v)}
              tick={{ fontSize: 10 }}
              domain={['auto', 'auto']}
              width={48}
            />
            <Tooltip content={renderCashflowForecastTooltip} />
            <Legend
              wrapperStyle={getChartLegendStyle(theme)}
              formatter={(value, entry: { color?: string }) => (
                <span style={{ color: entry?.color ?? theme.palette.text.primary }}>{value}</span>
              )}
            />
            <ReferenceLine y={0} stroke={refLineStroke} strokeWidth={1} />
            <Bar
              dataKey="inflow"
              name="流入"
              fill={CHART_COLORS.cashflowInflow}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              isAnimationActive
              animationDuration={600}
            />
            <Bar
              dataKey="outflowNegative"
              name="流出"
              fill={CHART_COLORS.expense}
              radius={[0, 0, 4, 4]}
              maxBarSize={28}
              isAnimationActive
              animationDuration={600}
            />
            <Line
              type="monotone"
              dataKey="net"
              name="淨流入"
              stroke={CHART_COLORS.netProfit}
              strokeWidth={2.5}
              dot={{ r: 4 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              isAnimationActive
              animationDuration={600}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </DashboardChartCard>
  );
};

CashflowForecastSection.displayName = 'CashflowForecastSection';

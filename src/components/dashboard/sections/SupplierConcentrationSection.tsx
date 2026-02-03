import React from 'react';
import { Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { ChartContainer } from '../ChartContainer';
import { DashboardChartCard } from '../DashboardChartCard';
import { CHART_COLORS } from '@/constants/chartColors';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle } from '@/utils/chartTooltipStyle';
import { getChartGridStroke } from '@/utils/chartTheme';
import type { SupplierConcentrationPoint } from '@/hooks/useDashboardAnalytics';

export interface SupplierConcentrationSectionProps {
  data: SupplierConcentrationPoint[];
  isLoading: boolean;
  dateRangeLabel: string;
}

export const SupplierConcentrationSection: React.FC<SupplierConcentrationSectionProps> = ({
  data,
  isLoading,
  dateRangeLabel,
}) => {
  const theme = useTheme();
  const gridStroke = getChartGridStroke(theme);

  /** 供應商集中度：自訂 Tooltip，採購金額使用對應色調 */
  const renderSupplierConcentrationTooltip = (props: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color?: string; dataKey?: string }>;
    label?: string;
  }) => {
    const { active, payload, label } = props;
    if (!active || !payload?.length) return null;
    const item = payload[0];
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
          採購金額: {item.value != null ? `NT$ ${Number(item.value).toLocaleString()}` : '—'}
        </Typography>
      </Paper>
    );
  };

  return (
    <DashboardChartCard
      title={
        <>
          <BusinessCenterIcon fontSize="small" /> 供應商集中度分析
        </>
      }
      subtitle={
        <Typography variant="caption" color="text.secondary">
          {dateRangeLabel}
        </Typography>
      }
      loading={isLoading}
      hasData={data.length > 0}
      height={260}
    >
      <ChartContainer height={260}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 60, left: 8, bottom: 8 }}
            barCategoryGap="12%"
          >
            <CartesianGrid
              strokeDasharray="1 4"
              horizontal={false}
              stroke={gridStroke}
            />
            <XAxis
              type="number"
              tickFormatter={(v) => formatAxisCurrency(v)}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              dataKey="supplierName"
              type="category"
              width={80}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={renderSupplierConcentrationTooltip} />
            <Bar
              dataKey="totalAmount"
              name="採購金額"
              fill={CHART_COLORS.secondary}
              radius={[0, 8, 8, 0]}
              maxBarSize={26}
              isAnimationActive
              animationDuration={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </DashboardChartCard>
  );
};

SupplierConcentrationSection.displayName = 'SupplierConcentrationSection';

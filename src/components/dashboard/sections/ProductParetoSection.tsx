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
  ReferenceLine,
} from 'recharts';
import PieChartIcon from '@mui/icons-material/PieChart';
import { ChartContainer } from '../ChartContainer';
import { DashboardChartCard } from '../DashboardChartCard';
import { CHART_COLORS } from '@/constants/chartColors';
import { DESIGN_PARETO_REF } from '@/constants/designSystem';
import { formatAxisCurrency } from '@/utils/dashboardFormatters';
import { getChartTooltipContentStyle } from '@/utils/chartTooltipStyle';
import { getChartGridStroke } from '@/utils/chartTheme';
import type { ProductParetoPoint } from '@/hooks/useDashboardAnalytics';

export interface ProductParetoSectionProps {
  data: ProductParetoPoint[];
  isLoading: boolean;
  dateRangeLabel: string;
  pareto80Threshold: number;
}

export const ProductParetoSection: React.FC<ProductParetoSectionProps> = ({
  data,
  isLoading,
  dateRangeLabel,
  pareto80Threshold,
}) => {
  const theme = useTheme();
  const gridStroke = getChartGridStroke(theme);

  /** 商品貢獻度：自訂 Tooltip，金額使用對應色調 */
  const renderProductParetoTooltip = (props: {
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
          金額: {item.value != null ? `NT$ ${Number(item.value).toLocaleString()}` : '—'}
        </Typography>
      </Paper>
    );
  };

  return (
    <DashboardChartCard
      title={
        <>
          <PieChartIcon fontSize="small" /> 商品貢獻度分析（80／20 法則）
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
            barCategoryGap="10%"
          >
            <CartesianGrid
              strokeDasharray="5 5"
              horizontal={false}
              stroke={gridStroke}
            />
            <XAxis
              type="number"
              tickFormatter={(v) => formatAxisCurrency(v)}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              dataKey="productName"
              type="category"
              width={80}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={renderProductParetoTooltip} />
            {pareto80Threshold > 0 && (
              <ReferenceLine
                x={pareto80Threshold}
                stroke={DESIGN_PARETO_REF}
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: '80%',
                  position: 'insideTopRight',
                  fill: theme.palette.text.secondary,
                  fontSize: 11,
                }}
              />
            )}
            <Bar
              dataKey="totalAmount"
              name="金額"
              fill={CHART_COLORS.netProfit}
              radius={[0, 6, 6, 0]}
              maxBarSize={24}
              isAnimationActive
              animationDuration={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </DashboardChartCard>
  );
};

ProductParetoSection.displayName = 'ProductParetoSection';

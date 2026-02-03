import React from 'react';
import { Typography, Box, Paper, Skeleton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from '../ChartContainer';
import { ChartEmptyState } from '../ChartEmptyState';
import { PIE_COLORS } from '@/constants/chartColors';
import { getChartTooltipContentStyle, getChartLegendStyle } from '@/utils/chartTooltipStyle';
import { useTheme } from '@mui/material/styles';
import type { PurchaseStructureDisplayItem } from '@/hooks/useDashboardDerivedData';

export interface PurchaseStructureSectionProps {
  data: PurchaseStructureDisplayItem[];
  isLoading: boolean;
  dateRangeLabel: string;
}

export const PurchaseStructureSection: React.FC<PurchaseStructureSectionProps> = ({
  data,
  isLoading,
  dateRangeLabel,
}) => {
  const theme = useTheme();

  const total = React.useMemo(
    () => data.reduce((sum, d) => sum + Number(d.totalAmount), 0),
    [data]
  );

  /** 採購結構：自訂 Tooltip，項目與金額使用與扇形相同的顏色（與營運支出結構分析對齊） */
  const renderPurchaseTooltip = (props: {
    active?: boolean;
    payload?: Array<{ name?: string; value?: number }>;
  }) => {
    const { active, payload } = props;
    if (!active || !payload?.length) return null;
    const name = payload[0].name ?? '';
    const value = Number(payload[0].value ?? 0);
    const index = data.findIndex((d) => d.itemName === name);
    const segmentColor =
      index >= 0 ? PIE_COLORS[index % PIE_COLORS.length] : theme.palette.text.primary;
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
        <Typography variant="body2" sx={{ fontWeight: 600, color: segmentColor }}>
          {name}
        </Typography>
        <Typography variant="body2" component="span" sx={{ ml: 0.5, color: segmentColor }}>
          NT$ {value.toLocaleString()}
        </Typography>
      </Paper>
    );
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <ShoppingCartIcon fontSize="small" /> 採購結構分析
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {dateRangeLabel}
      </Typography>
      <Box sx={{ width: '100%', minHeight: 260, minWidth: 0 }}>
        {!isLoading && data.length > 0 ? (
          <Box sx={{ position: 'relative', width: '100%', minHeight: 260 }}>
            <ChartContainer height={260}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="totalAmount"
                    nameKey="itemName"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={renderPurchaseTooltip} offset={12} />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    wrapperStyle={getChartLegendStyle(theme)}
                    formatter={(value, entry: { color?: string }) => (
                      <span style={{ color: entry?.color ?? theme.palette.text.primary }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
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
                NT$ {total.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                採購總計
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
            {isLoading ? (
              <Skeleton variant="circular" width={200} height={200} />
            ) : (
              <ChartEmptyState message="當前區間無數據" height={260} />
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

PurchaseStructureSection.displayName = 'PurchaseStructureSection';

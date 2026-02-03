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
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import {
  ComposedChart,
  Bar,
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
import { getChartTooltipContentStyle, getChartLegendStyle } from '@/utils/chartTooltipStyle';
import { getChartGridStroke } from '@/utils/chartTheme';

interface TrendPoint {
  date: string;
  saleAmount: number;
  receiptAmount: number;
}

interface ExpenseItem {
  category: string;
  amount: number;
}

/** 區塊一：僅趨勢（滿版）；區塊三：僅支出（半版）；預設：兩者並排 */
export type TrendAndExpenseVariant = 'both' | 'trendOnly' | 'expenseOnly';

interface TrendAndExpenseSectionProps {
  trendDays: number;
  setTrendDays: (days: number) => void;
  safeTrendData: TrendPoint[];
  isTrendsLoading: boolean;
  hasMounted: boolean;
  expenses: ExpenseItem[];
  isExpensesLoading: boolean;
  /** 預設 'both'；'trendOnly' 用於區塊一滿版，'expenseOnly' 用於區塊三半版 */
  variant?: TrendAndExpenseVariant;
  /** 與採購結構同步：顯示同一日期區間 (expenseOnly 時顯示) */
  dateRangeLabel?: string;
}

export const TrendAndExpenseSection: React.FC<TrendAndExpenseSectionProps> = ({
  trendDays,
  setTrendDays,
  safeTrendData,
  isTrendsLoading,
  hasMounted,
  expenses,
  isExpensesLoading,
  variant = 'both',
  dateRangeLabel,
}) => {
  const theme = useTheme();
  const gridStroke = getChartGridStroke(theme);

  /** 營收與現金回收趨勢：自訂 Tooltip，顯示日期、金額、收現率% */
  const renderTrendTooltip = (props: { active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string }) => {
    const { active, payload, label } = props;
    if (!active || !payload?.length || label == null) return null;
    const sale = Number(payload.find((p) => p.dataKey === 'saleAmount')?.value ?? 0);
    const receipt = Number(payload.find((p) => p.dataKey === 'receiptAmount')?.value ?? 0);
    const rate = sale > 0 ? (receipt / sale) * 100 : 0;
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
        <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: CHART_COLORS.revenue }}>
          期間營收
        </Typography>
        <Typography component="span" variant="body2" sx={{ ml: 0.5, color: CHART_COLORS.revenue }}>
          NT$ {sale.toLocaleString()}
        </Typography>
        <br />
        <Typography component="span" variant="body2" sx={{ fontWeight: 600, color: CHART_COLORS.netProfit }}>
          實際收款
        </Typography>
        <Typography component="span" variant="body2" sx={{ ml: 0.5, color: CHART_COLORS.netProfit }}>
          NT$ {receipt.toLocaleString()}
        </Typography>
        {sale > 0 && (
          <>
            <br />
            <Typography component="span" variant="caption" color="text.secondary">
              收現率
            </Typography>
            <Typography component="span" variant="caption" sx={{ ml: 0.5, fontWeight: 600 }}>
              {rate.toFixed(1)}%
            </Typography>
          </>
        )}
      </Paper>
    );
  };

  const trendPaper = (
    <Paper sx={{ p: 3, borderRadius: 2, minHeight: 450, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          營收與現金回收趨勢
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
                <ComposedChart
                  data={safeTrendData}
                  margin={{ top: 10, right: 52, left: 52, bottom: 24 }}
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="5 5"
                    vertical={false}
                    stroke={gridStroke}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    width={48}
                    stroke={CHART_COLORS.revenue}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => formatAxisCurrency(v)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    width={48}
                    stroke={CHART_COLORS.netProfit}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => formatAxisCurrency(v)}
                  />
                    <Tooltip content={renderTrendTooltip} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    layout="horizontal"
                    wrapperStyle={getChartLegendStyle(theme)}
                    formatter={(value, entry: { color?: string }) => (
                      <span style={{ color: entry?.color ?? theme.palette.text.primary }}>{value}</span>
                    )}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="saleAmount"
                    name="期間營收"
                    fill={CHART_COLORS.revenue}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    isAnimationActive
                    animationDuration={600}
                  />
                  <Line
                    yAxisId="right"
                    type="natural"
                    dataKey="receiptAmount"
                    name="實際收款"
                    stroke={CHART_COLORS.netProfit}
                    strokeWidth={2.5}
                    strokeDasharray="4 2"
                    dot={{ r: 4 }}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={600}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
              {isTrendsLoading ? (
                <Skeleton variant="rectangular" width="100%" height="100%" />
              ) : (
                <ChartEmptyState message="選擇區間內尚無營收或收款資料" height={350} />
              )}
            </Box>
          )}
        </Box>
    </Paper>
  );

  /** 營運支出結構：自訂 Tooltip，字卡顯示類別與金額（對應扇形顏色），依 Recharts 預設位置顯示 */
  const renderExpenseTooltip = (props: { active?: boolean; payload?: Array<{ name?: string; value?: number }> }) => {
    const { active, payload } = props;
    if (!active || !payload?.length) return null;
    const name = payload[0].name ?? '';
    const value = Number(payload[0].value ?? 0);
    const index = expenses.findIndex((e) => e.category === name);
    const segmentColor = index >= 0 ? PIE_COLORS[index % PIE_COLORS.length] : theme.palette.text.primary;
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

  const expensePaper = (
    <Paper sx={{ p: 2, borderRadius: 2, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <MoneyOffIcon fontSize="small" /> 營運支出結構分析
        </Typography>
      </Box>
      {dateRangeLabel != null && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {dateRangeLabel}
        </Typography>
      )}
        <Box sx={{ width: '100%', minHeight: 260, minWidth: 0 }}>
          {hasMounted && !isExpensesLoading && expenses.length > 0 ? (
            <Box sx={{ position: 'relative', width: '100%', minHeight: 260 }}>
              <ChartContainer height={260}>
                <ResponsiveContainer width="100%" height={260}>
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
                    <Tooltip content={renderExpenseTooltip} offset={12} />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      layout="horizontal"
                      wrapperStyle={getChartLegendStyle(theme)}
                      formatter={(value, entry: { color?: string }) => (
                        <span style={{ color: entry?.color ?? theme.palette.text.primary }}>{value}</span>
                      )}
                    />
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
                <Typography variant="caption" color="text.secondary">營運支出總計</Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
              {isExpensesLoading ? (
                <Skeleton variant="circular" width={200} height={200} />
              ) : (
                <ChartEmptyState message="當前區間無數據" height={260} />
              )}
            </Box>
          )}
        </Box>
    </Paper>
  );

  if (variant === 'trendOnly') {
    return <Box sx={{ mb: 4 }}>{trendPaper}</Box>;
  }
  if (variant === 'expenseOnly') {
    return <>{expensePaper}</>;
  }
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
      {trendPaper}
      {expensePaper}
    </Box>
  );
};


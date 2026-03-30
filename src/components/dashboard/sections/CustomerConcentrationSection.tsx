import React from 'react';
import { Typography, Box, Chip, Paper, Skeleton } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import WarningIcon from '@mui/icons-material/Warning';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { ChartContainer } from '../ChartContainer';
import { ChartEmptyState } from '../ChartEmptyState';
import { PIE_COLORS, STAT_CARD_COLORS } from '@/constants/chartColors';
import { getChartTooltipContentStyle, getChartLegendStyle } from '@/utils/chartTooltipStyle';
import { useTheme } from '@mui/material/styles';
import type { CustomerConcentrationDonutItem } from '@/hooks/useDashboardDerivedData';
import type { CustomerConcentrationPoint } from '@/hooks/useDashboardAnalytics';
import { useTranslation } from 'react-i18next';
import 'dayjs/locale/en';

export interface CustomerConcentrationSectionProps {
  donutData: CustomerConcentrationDonutItem[];
  rawData: CustomerConcentrationPoint[] | undefined;
  isLoading: boolean;
  dateRangeLabel: string;
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  defaultStart: string;
  defaultEnd: string;
  showWarning: boolean;
}

export const CustomerConcentrationSection: React.FC<CustomerConcentrationSectionProps> = ({
  donutData,
  rawData,
  isLoading,
  dateRangeLabel,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  defaultStart,
  defaultEnd,
  showWarning,
}) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation('dashboard');
  const dayjsLocale = i18n.language.startsWith('en') ? 'en' : 'zh-tw';
  const WARNING_TOP3_COLORS = ['#F57C00', '#FB8C00', '#FFB74D'] as const;

  const getSegmentColor = React.useCallback(
    (index: number) => {
      if (index < 0) return theme.palette.text.primary;
      if (showWarning && index < 3) {
        return WARNING_TOP3_COLORS[index] ?? STAT_CARD_COLORS.warning;
      }
      return PIE_COLORS[index % PIE_COLORS.length];
    },
    [showWarning, theme.palette.text.primary]
  );

  const total = React.useMemo(
    () => donutData.reduce((sum, d) => sum + Number(d.value), 0),
    [donutData]
  );

  /** 客戶採購集中度：自訂 Tooltip，客戶名稱與金額使用與扇形相同的顏色（與營運支出結構分析對齊） */
  const renderCustomerConcentrationTooltip = (props: any) => {
    const { active, payload } = props;
    if (!active || !payload?.length) return null;
    const name = String(payload[0].name ?? '');
    const value = Number(payload[0].value ?? 0);
    const index = donutData.findIndex((d) => d.name === name);
    const segmentColor = getSegmentColor(index);
    const ratioStr = rawData?.find((c) => c.customerName === name)?.ratio;
    const suffix = ratioStr != null ? ` (${ratioStr.toFixed(2)}%)` : '';
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
          {suffix}
        </Typography>
      </Paper>
    );
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 2,
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 第一列：標題（左）｜日期選擇器（右，一組） */}
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
          <DonutLargeIcon fontSize="small" /> {t('charts.customerConc.title')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={dayjsLocale}>
            <DatePicker
              label={t('charts.customerConc.startDate')}
              value={startDate ? dayjs(startDate) : null}
              onChange={(v) => onStartDateChange(v ? v.format('YYYY-MM-DD') : defaultStart)}
              format="YYYY-MM-DD"
              maxDate={endDate ? dayjs(endDate) : undefined}
              slotProps={{ textField: { size: 'small', sx: { width: 168 } } }}
            />
            <DatePicker
              label={t('charts.customerConc.endDate')}
              value={endDate ? dayjs(endDate) : null}
              onChange={(v) => onEndDateChange(v ? v.format('YYYY-MM-DD') : defaultEnd)}
              format="YYYY-MM-DD"
              minDate={startDate ? dayjs(startDate) : undefined}
              slotProps={{ textField: { size: 'small', sx: { width: 168 } } }}
            />
          </LocalizationProvider>
        </Box>
      </Box>
      {/* 第二列：日期區間文字 */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {dateRangeLabel}
      </Typography>
      {/* 第三列：警示 Chip（若有） */}
      {showWarning && (
        <Chip
          size="small"
          icon={<WarningIcon />}
          label={t('charts.customerConc.warningTop3')}
          color="warning"
          sx={{ alignSelf: 'flex-start', mb: 1 }}
        />
      )}
      {/* 圖表區 */}
      <Box sx={{ height: 260, position: 'relative' }}>
        {isLoading ? (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        ) : donutData.length === 0 ? (
          <ChartEmptyState message={t('common.noData')} height={260} />
        ) : (
          <>
            <ChartContainer height={260}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {donutData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getSegmentColor(index)}
                        stroke={theme.palette.background.paper}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={renderCustomerConcentrationTooltip}
                    offset={12}
                    wrapperStyle={{ zIndex: 10 }}
                  />
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
                top: '45%', // 稍微往上移，避免遮住下方扇形的 Tooltip
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                textAlign: 'center',
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                zIndex: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                NT$ {total.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('charts.customerConc.revenueTotal')}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

CustomerConcentrationSection.displayName = 'CustomerConcentrationSection';

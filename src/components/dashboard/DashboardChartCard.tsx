import React from 'react';
import { Paper, Typography, Box, Skeleton } from '@mui/material';
import { ChartEmptyState } from './ChartEmptyState';

const CHART_CARD_HEIGHT = 260;

export interface DashboardChartCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  hasData: boolean;
  emptyMessage?: string;
  height?: number;
  children: React.ReactNode;
}

export const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
  title,
  subtitle,
  actions,
  loading,
  hasData,
  emptyMessage = '暫無數據',
  height = CHART_CARD_HEIGHT,
  children,
}) => (
  <Paper
    sx={{
      p: 2,
      borderRadius: 2,
      minHeight: 320,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
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
        {title}
      </Typography>
      {(subtitle != null || actions != null) && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {subtitle}
          {actions}
        </Box>
      )}
    </Box>
    <Box sx={{ height, minHeight: height }}>
      {loading ? (
        <Skeleton variant="rectangular" width="100%" height="100%" />
      ) : !hasData ? (
        <ChartEmptyState message={emptyMessage} height={height} />
      ) : (
        children
      )}
    </Box>
  </Paper>
);

DashboardChartCard.displayName = 'DashboardChartCard';

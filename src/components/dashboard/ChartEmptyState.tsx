import React from 'react';
import { Box, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useTranslation } from 'react-i18next';

interface ChartEmptyStateProps {
  message?: string;
  height?: number;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({ message, height = 200 }) => {
  const { t } = useTranslation('dashboard');
  const text = message ?? t('common.noData');
  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        color: 'text.secondary',
      }}
    >
      <BarChartIcon sx={{ fontSize: 48, opacity: 0.5 }} />
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {text}
      </Typography>
    </Box>
  );
};

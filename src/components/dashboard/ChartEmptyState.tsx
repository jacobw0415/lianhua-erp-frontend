import React from 'react';
import { Box, Typography } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';

interface ChartEmptyStateProps {
  message?: string;
  height?: number;
}

export const ChartEmptyState: React.FC<ChartEmptyStateProps> = ({
  message = '暫無數據',
  height = 200,
}) => (
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
      {message}
    </Typography>
  </Box>
);

import React from 'react';
import { Box } from '@mui/material';

interface ChartContainerProps {
  height: number;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ height, children }) => (
  <Box
    sx={{
      width: '100%',
      minHeight: height,
      minWidth: 0,
      overflow: 'hidden',
    }}
  >
    {children}
  </Box>
);

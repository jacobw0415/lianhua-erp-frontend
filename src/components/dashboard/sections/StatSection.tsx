import React from 'react';
import { Box, Typography } from '@mui/material';
import { StatCard } from '../StatCard';
import type { StatCardProps } from '../StatCard';

interface StatSectionProps {
  title: string;
  titleIcon?: React.ReactNode;
  items: StatCardProps[];
}

export const StatSection: React.FC<StatSectionProps> = ({ title, titleIcon, items }) => (
  <>
    <Typography
      variant="h6"
      sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
    >
      {titleIcon}
      {title}
    </Typography>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
      }}
    >
      {items.map((item) => (
        <StatCard key={item.title} {...item} />
      ))}
    </Box>
  </>
);


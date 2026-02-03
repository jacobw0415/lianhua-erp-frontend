import React from 'react';
import { Typography, Box } from '@mui/material';

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  icon,
}) => (
  <>
    <Typography
      variant="h6"
      sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
    >
      {icon}
      {title}
    </Typography>
    {subtitle != null && (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 2 }}
      >
        {subtitle}
      </Typography>
    )}
  </>
);

SectionHeader.displayName = 'SectionHeader';

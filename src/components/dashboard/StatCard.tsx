import React from 'react';
import { Card, CardContent, Box, Typography, Skeleton, alpha } from '@mui/material';

export interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  iconColor: string;
  loading?: boolean;
  onClick?: () => void;
}

export const StatCard = React.memo<StatCardProps>(
  ({ icon, title, value, iconColor, loading, onClick }) => (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 2,
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out' : 'none',
        '&:hover': onClick ? { boxShadow: 6, transform: 'translateY(-4px)' } : {},
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              color: iconColor,
              bgcolor: alpha(iconColor, 0.12),
              p: 1.5,
              borderRadius: '50%',
              mr: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width="80%" height={40} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  ),
);

StatCard.displayName = 'StatCard';


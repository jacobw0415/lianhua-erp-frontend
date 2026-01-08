import { type ReactNode } from 'react';
import { Box, Fade } from '@mui/material';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

interface DashboardLayoutProps {
  isLoading: boolean;
  hasData?: boolean;
  children: ReactNode;
}

export const DashboardLayout = ({
  isLoading,
  hasData = false,
  children,
}: DashboardLayoutProps) => {
  
  const showSkeleton = isLoading && !hasData;

  if (showSkeleton) {
    return <DashboardSkeleton />;
  }

  return (
    <Fade in={!showSkeleton} timeout={500}>
      {/* ★ 修改重點：將 padding 縮小至 1 (8px) */}
      <Box sx={{ width: '100%', p: 1, pb: 4 }}>
        {children}
      </Box>
    </Fade>
  );
};
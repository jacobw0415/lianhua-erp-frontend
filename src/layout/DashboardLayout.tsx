import { type ReactNode } from 'react';
import { Box, Fade } from '@mui/material';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { CONTENT_BOX_SX } from '@/constants/layoutConstants';

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
      <Box
        sx={{
          ...CONTENT_BOX_SX,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          mt: { xs: 1, sm: 1 },
          pb: 4,
        }}
      >
        {children}
      </Box>
    </Fade>
  );
};
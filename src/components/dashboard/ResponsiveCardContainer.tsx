import React from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { CONTENT_BOX_SX } from '@/constants/layoutConstants';

/**
 * 響應式字卡容器
 * 
 * 在 RWD 下確保所有卡片都是垂直堆疊（直立式），沒有寬度限制
 * - 手機版 (xs): 單欄，全寬
 * - 平板版 (sm): 單欄，全寬
 * - 桌面版 (md+): 可配置多欄
 */
export interface ResponsiveCardContainerProps {
  children: React.ReactNode;
  /** Grid 欄數配置，預設手機版單欄，桌面版雙欄 */
  columns?: { xs?: number | string; sm?: number | string; md?: number | string; lg?: number | string };
  /** Grid 間距，預設 2 */
  gap?: number;
  /** 底部間距，預設 4 */
  mb?: number;
  /** 自訂樣式 */
  sx?: SxProps<Theme>;
}

export const ResponsiveCardContainer: React.FC<ResponsiveCardContainerProps> = ({
  children,
  columns = { xs: '1fr', sm: '1fr', md: '1fr 1fr' },
  gap = 2,
  mb = 4,
  sx,
}) => {
  // 將 columns 物件轉換為 gridTemplateColumns 字串
  const gridTemplateColumns = typeof columns === 'object' && columns !== null
    ? {
        xs: typeof columns.xs === 'number' ? `repeat(${columns.xs}, 1fr)` : columns.xs || '1fr',
        sm: typeof columns.sm === 'number' ? `repeat(${columns.sm}, 1fr)` : columns.sm || '1fr',
        md: typeof columns.md === 'number' ? `repeat(${columns.md}, 1fr)` : columns.md || '1fr 1fr',
        lg: typeof columns.lg === 'number' ? `repeat(${columns.lg}, 1fr)` : columns.lg,
      }
    : { xs: '1fr', sm: '1fr', md: '1fr 1fr' };

  return (
    <Box
      sx={{
        ...CONTENT_BOX_SX,
        display: 'grid',
        gridTemplateColumns: gridTemplateColumns,
        gap,
        mb,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

ResponsiveCardContainer.displayName = 'ResponsiveCardContainer';

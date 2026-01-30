import type { CSSProperties } from 'react';
import type { Theme } from '@mui/material/styles';

/**
 * Recharts Tooltip 共用 contentStyle，與 MUI 主題一致（含深色模式）
 */
export function getChartTooltipContentStyle(theme: Theme): CSSProperties {
  const isDark = theme.palette.mode === 'dark';
  return {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    padding: '8px 12px',
    boxShadow: theme.shadows[4],
  };
}

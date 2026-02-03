import type { CSSProperties } from 'react';
import type { Theme } from '@mui/material/styles';

const textColor = (theme: Theme): string => theme.palette.text.primary;

/**
 * Recharts Tooltip 共用 contentStyle，與 MUI 主題一致（含深色模式）
 */
export function getChartTooltipContentStyle(theme: Theme): CSSProperties {
  return {
    backgroundColor: theme.palette.background.paper,
    color: textColor(theme),
    borderRadius: 8,
    border: `1px solid ${theme.palette.divider}`,
    padding: '8px 12px',
    boxShadow: theme.shadows[4],
  };
}

/**
 * Recharts Tooltip 內文與標籤文字顏色（暗黑模式下避免黑字）
 */
export function getChartTooltipLabelStyle(theme: Theme): CSSProperties {
  return { color: textColor(theme), fill: textColor(theme) };
}

export function getChartTooltipItemStyle(theme: Theme): CSSProperties {
  return { color: textColor(theme), fill: textColor(theme) };
}

/**
 * Recharts Legend 文字顏色（暗黑模式下可讀）
 */
export function getChartLegendStyle(theme: Theme): CSSProperties {
  return { color: textColor(theme) };
}

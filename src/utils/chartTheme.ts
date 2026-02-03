import type { Theme } from '@mui/material/styles';

/**
 * Recharts 圖表線條顏色，依 MUI 主題（亮/暗）回傳，避免硬編碼
 */
export function getChartGridStroke(theme: Theme): string {
  const isDark = theme.palette.mode === 'dark';
  return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
}

/**
 * Recharts 參考線（如 y=0）顏色
 */
export function getChartReferenceLineStroke(theme: Theme): string {
  const isDark = theme.palette.mode === 'dark';
  return isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)';
}

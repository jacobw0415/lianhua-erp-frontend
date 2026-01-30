/**
 * 儀表板圖表與字卡共用顏色常數（與 designSystem 語意一致）
 */
import { DESIGN_SUCCESS, DESIGN_WARNING_DANGER, DESIGN_CASHFLOW_LINE } from './designSystem';

export const CHART_COLORS = {
  revenue: DESIGN_SUCCESS,
  expense: DESIGN_WARNING_DANGER,
  netProfit: '#1565C0',
  secondary: '#7B1FA2',
  /** 現金流／流入語意，用於現金流預測圖 */
  cashflowInflow: DESIGN_CASHFLOW_LINE,
} as const;

/** 圓餅圖／環圖分類色，避免重複色相（紅、綠、藍、橙、青、紫、黃綠、深紅） */
export const PIE_COLORS = [
  '#2E7D32', // 綠
  '#1565C0', // 藍
  '#C62828', // 紅
  '#F57C00', // 橙
  '#00838F', // 青
  '#6A1B9A', // 紫
  '#558B2F', // 黃綠
  '#AD1457', // 深粉
];

/** StatCard 圖示色：營收／採購／費用／淨利／AR／AP／通用 */
export const STAT_CARD_COLORS = {
  revenue: CHART_COLORS.revenue,
  purchase: '#FB8C00',
  expense: '#8E24AA',
  netProfit: CHART_COLORS.netProfit,
  ar: '#0288D1',
  ap: CHART_COLORS.expense,
  info: '#00796B',
  warning: '#F57C00',
  secondary: CHART_COLORS.secondary,
} as const;

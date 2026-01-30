/**
 * ERP 視覺設計規範 (Design System)
 * 色彩心理學：專業與精準，避免刺眼色彩
 */

/** 主色調 - 海軍藍，用於標題、導航與主要線條 */
export const DESIGN_PRIMARY = '#1A237E';

/** 獲利/正向 - 森林綠，用於營收、流入、活躍狀態 */
export const DESIGN_SUCCESS = '#2E7D32';

/** 預警/負擔 - 磚紅色，用於支出、流出、流失風險 */
export const DESIGN_WARNING_DANGER = '#C62828';

/** 輔助/中性 - 淺灰色，用於背景與邊框 */
export const DESIGN_NEUTRAL = '#F5F5F5';

/** 流動比率儀表：黃色區間 (100%–150%) */
export const DESIGN_GAUGE_WARNING = '#F9A825';

/** Pareto 80% 參考線 - 金色 */
export const DESIGN_PARETO_REF = '#FFB300';

/** 現金流預測階梯線 - 藍色 */
export const DESIGN_CASHFLOW_LINE = '#1565C0';

/** 字體：系統預設黑體 */
export const FONT_FAMILY_BODY = '"Microsoft JhengHei", "Noto Sans TC", sans-serif';

/** 金額數字：等寬字體，確保數字對齊易讀 */
export const FONT_FAMILY_MONO = '"Consolas", "Monaco", "Roboto Mono", monospace';

export const designSystem = {
  primary: DESIGN_PRIMARY,
  success: DESIGN_SUCCESS,
  warningDanger: DESIGN_WARNING_DANGER,
  neutral: DESIGN_NEUTRAL,
  gaugeWarning: DESIGN_GAUGE_WARNING,
  paretoRef: DESIGN_PARETO_REF,
  cashflowLine: DESIGN_CASHFLOW_LINE,
  fontBody: FONT_FAMILY_BODY,
  fontMono: FONT_FAMILY_MONO,
} as const;

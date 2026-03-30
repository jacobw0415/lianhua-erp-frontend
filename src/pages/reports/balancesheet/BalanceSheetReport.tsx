import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import { useBalanceSheetReport } from "@/hooks/useBalanceSheetReport";
import type { BalanceSheetQueryParams } from "@/hooks/useBalanceSheetReport";
import {
  downloadReportExport,
  REPORT_EXPORT_KEYS,
} from "@/api/reportExportDownload";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { logger } from "@/utils/logger";
import { QueryControls } from "./components/QueryControls";
import { BalanceSheetTable } from "./components/BalanceSheetTable";
import { ReportLayout } from "@/layout/ReportLayout";

/* =========================================================
 * Component: 資產負債表 (Balance Sheet Report)
 * ========================================================= */

export const BalanceSheetReport = () => {
  const theme = useTheme();
   const isDark = theme.palette.mode === "dark"; // Layout 內部會處理

  // -------------------------------------------------------
  // 1. 狀態管理 (保持不變)
  // -------------------------------------------------------

  // 查詢類型狀態
  const [queryType, setQueryType] = useState<"month" | "date">("month");

  // 查詢參數狀態
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [periods, setPeriods] = useState<string[]>([]);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // 當前實際查詢的參數
  const [activeQueryParams, setActiveQueryParams] = useState<BalanceSheetQueryParams>(() => {
    return { period: dayjs().format("YYYY-MM") };
  });

  // 是否為首次加載
  const isInitialMount = useRef(true);

  // 導出狀態
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // -------------------------------------------------------
  // 2. 邏輯處理 (保持不變)
  // -------------------------------------------------------

  // 首次加載
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // 獲取數據
  const { data, loading, error, refresh } = useBalanceSheetReport(activeQueryParams);

  // Scrollbar
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 構建查詢參數
  const queryParams: BalanceSheetQueryParams | null = useMemo(() => {
    if (queryType === "month") {
      const normalizedPeriods = [...new Set(periods.map((p) => p?.trim()))].filter(Boolean);
      const limitedPeriods = normalizedPeriods.slice(0, 12);
      if (limitedPeriods.length > 0) {
        const periodRegex = /^\d{4}-\d{2}$/;
        const isValid = limitedPeriods.every((p) => {
          if (!periodRegex.test(p)) return false;
          const [year, month] = p.split("-").map(Number);
          return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
        });
        if (isValid) {
          return { periods: limitedPeriods };
        }
        return null;
      }

      const trimmedPeriod = period?.trim();
      if (trimmedPeriod) {
        const periodRegex = /^\d{4}-\d{2}$/;
        if (periodRegex.test(trimmedPeriod)) {
          const [year, month] = trimmedPeriod.split("-").map(Number);
          if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
            return { period: trimmedPeriod };
          }
        }
      }
    }

    if (queryType === "date" && endDate && endDate.isValid()) {
      return {
        endDate: endDate.format("YYYY-MM-DD"),
      };
    }

    return null;
  }, [queryType, period, periods, endDate]);

  // 處理查詢
  const handleQuery = useCallback(() => {
    if (!queryParams) return;
    setActiveQueryParams(queryParams);
  }, [queryParams]);

  // 處理快速選擇
  const handleQuickSelect = useCallback((params: BalanceSheetQueryParams) => {
    setActiveQueryParams(params);
  }, []);

  // 處理刷新
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Excel / CSV 匯出（後端 GET /api/reports/balance_sheet/export，條件與畫面查詢一致）
  const handleExport = useCallback(async () => {
    if (!data || data.length === 0) {
      setExportError("沒有數據可供匯出");
      return;
    }

    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const filter: {
        periods?: string[];
        periodsCsv?: string;
        period?: string;
        endDate?: string;
      } = {};
      if (activeQueryParams.periods && activeQueryParams.periods.length > 0) {
        filter.periods = activeQueryParams.periods;
        filter.periodsCsv = activeQueryParams.periods.join(",");
      } else if (activeQueryParams.period) {
        filter.period = activeQueryParams.period;
      } else if (activeQueryParams.endDate) {
        filter.endDate = activeQueryParams.endDate;
      }

      await downloadReportExport(REPORT_EXPORT_KEYS.balance_sheet, filter, {
        format: "xlsx",
        scope: "all",
      });
      setExportSuccess(true);
    } catch (error) {
      if (error instanceof Error && error.message === "SESSION_EXPIRED") {
        return;
      }
      logger.devError("匯出失敗：", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "匯出檔案時發生錯誤";
      setExportError(errorMessage);
    } finally {
      setExporting(false);
    }
  }, [data, activeQueryParams]);

  // 獲取顯示文字
  const getQueryDisplayText = (): string => {
    if (activeQueryParams.periods && activeQueryParams.periods.length > 0) {
      const sorted = [...activeQueryParams.periods].sort();
      return sorted.join(", ");
    }
    if (activeQueryParams.period) {
      return activeQueryParams.period;
    } else if (activeQueryParams.endDate) {
      return activeQueryParams.endDate;
    }
    return "";
  };

  // -------------------------------------------------------
  // 3. Render (使用 ReportLayout)
  // -------------------------------------------------------

  return (
    <ReportLayout
      title="資產負債表"
      subtitle="查看企業資產、負債與權益的報表資料"
      
      // ★ Loading 狀態
      isLoading={loading}
      
      // ★ 防抖動關鍵：有舊資料就不顯示骨架屏
      hasData={!!data && data.length > 0}
      
      // ★ 資產負債表使用標準深綠色 (不需特別指定 headerSx，Layout 預設即為綠色)
      // 如果想要強調一致性，也可以明確指定：
       headerSx={{
        backgroundColor: isDark
          ? "rgba(27, 94, 32, 0.85)" // 深綠色 900
          : "rgba(46, 125, 50, 0.85)", // 綠色 800
        backdropFilter: "blur(10px)",
      }}
    >
      
      {/* --- 內容區域 --- */}

      {/* 1. 查詢控制區 */}
      <QueryControls
        queryType={queryType}
        onQueryTypeChange={setQueryType}
        period={period}
        onPeriodChange={setPeriod}
        periods={periods}
        onPeriodsChange={setPeriods}
        endDate={endDate}
        onEndDateChange={setEndDate}
        onQuery={handleQuery}
        onQuickSelect={handleQuickSelect}
        onRefresh={handleRefresh}
        onExport={handleExport}
        loading={loading}
        exporting={exporting}
        hasData={data.length > 0}
        canQuery={!!queryParams}
      />

      {/* 2. 數據表格 (加上上邊距) */}
      <Box sx={{ mt: 3 }}>
        <BalanceSheetTable
          data={data}
          loading={loading}
          error={error}
          onRetry={handleRefresh}
          period={getQueryDisplayText()}
        />
      </Box>

      {/* --- 提示訊息 (Snackbars) --- */}
      <Snackbar
        open={exportSuccess}
        autoHideDuration={3000}
        onClose={() => setExportSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setExportSuccess(false)} severity="success" sx={{ width: "100%" }}>
          Excel 檔案匯出成功！
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!exportError}
        autoHideDuration={5000}
        onClose={() => setExportError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setExportError(null)} severity="error" sx={{ width: "100%" }}>
          {exportError}
        </Alert>
      </Snackbar>
    </ReportLayout>
  );
};
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Box, useTheme, Snackbar, Alert } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

import { useComprehensiveIncomeStatement } from "@/hooks/useComprehensiveIncomeStatement";
import type { ComprehensiveIncomeStatementQueryParams } from "@/hooks/useComprehensiveIncomeStatement";
import { exportExcel } from "@/utils/exportExcel";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { QueryControls } from "./components/QueryControls";
import { ComprehensiveIncomeStatementTable } from "./components/ComprehensiveIncomeStatementTable";
import { ReportLayout } from "@/layout/ReportLayout";

dayjs.extend(quarterOfYear);

/* =========================================================
 * Component: 綜合損益表 (Comprehensive Income Statement)
 * ========================================================= */

// 日期驗證常數
const MAX_DATE_RANGE_DAYS = 730; // 最多查詢 2 年

export const ComprehensiveIncomeStatementReport = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // -------------------------------------------------------
  // 1. 狀態管理 (保持不變)
  // -------------------------------------------------------

  // 查詢參數狀態
  const [queryMode, setQueryMode] = useState<"period" | "dateRange" | "periods">("period");
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [periods, setPeriods] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf("month"));

  // 日期驗證錯誤訊息
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // 當前實際查詢的參數
  const [activeQueryParams, setActiveQueryParams] = useState<ComprehensiveIncomeStatementQueryParams>(() => {
    return { period: dayjs().format("YYYY-MM") };
  });

  // 是否為首次加載
  const isInitialMount = useRef(true);
  // 標記是否正在進行批次更新
  const isBatchUpdating = useRef(false);

  // 導出狀態
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // -------------------------------------------------------
  // 2. 邏輯處理 (保持不變)
  // -------------------------------------------------------

  // 驗證日期範圍
  const validateDateRange = useCallback((start: Dayjs | null, end: Dayjs | null): string | null => {
    if (!start || !end) {
      return null;
    }
    if (!start.isValid() || !end.isValid()) {
      return "日期格式無效";
    }

    const startDay = start.startOf("day");
    const endDay = end.startOf("day");

    if (endDay.isBefore(startDay)) {
      return "結束日期不能早於起始日期";
    }

    const daysDiff = endDay.diff(startDay, "day") + 1;
    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      return `查詢範圍不能超過 ${MAX_DATE_RANGE_DAYS} 天（約 2 年）`;
    }

    return null;
  }, []);

  // 批次更新日期
  const handleBatchDateChange = useCallback((start: Dayjs | null, end: Dayjs | null) => {
    isBatchUpdating.current = true;
    setDateRangeError(null);
    setStartDate(start);
    setEndDate(end);
    if (start && end) {
      const error = validateDateRange(start, end);
      setTimeout(() => {
        setDateRangeError(error);
        isBatchUpdating.current = false;
      }, 0);
    } else {
      setTimeout(() => {
        isBatchUpdating.current = false;
      }, 0);
    }
  }, [validateDateRange]);

  // 處理日期變更
  const handleStartDateChange = useCallback((date: Dayjs | null) => {
    setStartDate(date);
    if (date && endDate) {
      const error = validateDateRange(date, endDate);
      setDateRangeError(error);
    } else {
      setDateRangeError(null);
    }
  }, [endDate, validateDateRange]);

  const handleEndDateChange = useCallback((date: Dayjs | null) => {
    setEndDate(date);
    if (startDate && date) {
      const error = validateDateRange(startDate, date);
      setDateRangeError(error);
    } else {
      setDateRangeError(null);
    }
  }, [startDate, validateDateRange]);

  // 構建查詢參數
  const queryParams: ComprehensiveIncomeStatementQueryParams = useMemo(() => {
    if (queryMode === "periods" && periods.length > 0) {
      return { periods };
    } else if (queryMode === "period" && period && period.trim()) {
      const periodRegex = /^\d{4}-\d{2}$/;
      if (periodRegex.test(period)) {
        const [year, month] = period.split("-").map(Number);
        if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) {
          return { period };
        }
      }
    } else if (
      queryMode === "dateRange" &&
      startDate &&
      endDate &&
      startDate.isValid() &&
      endDate.isValid() &&
      !dateRangeError
    ) {
      const startDay = startDate.startOf("day");
      const endDay = endDate.startOf("day");
      if (!endDay.isBefore(startDay)) {
        return {
          startDate: startDate.format("YYYY-MM-DD"),
          endDate: endDate.format("YYYY-MM-DD"),
        };
      }
    }
    return {};
  }, [queryMode, period, periods, startDate, endDate, dateRangeError]);

  // 首次加載
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // 獲取數據
  const { data, loading, error, refresh } = useComprehensiveIncomeStatement(activeQueryParams);

  // Scrollbar
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 處理查詢
  const handleQuery = useCallback((params?: ComprehensiveIncomeStatementQueryParams) => {
    const paramsToUse = params || queryParams;

    if (!paramsToUse || Object.keys(paramsToUse).length === 0) return;

    if (queryMode === "period" && !paramsToUse.period) return;
    if (queryMode === "periods" && (!paramsToUse.periods || paramsToUse.periods.length === 0)) return;
    
    if (queryMode === "dateRange") {
      if (!paramsToUse.startDate || !paramsToUse.endDate) return;
      
      if (params) {
        const start = dayjs(params.startDate);
        const end = dayjs(params.endDate);
        if (!start.isValid() || !end.isValid()) {
          setDateRangeError("日期格式無效");
          return;
        }
        const error = validateDateRange(start, end);
        if (error) {
          setDateRangeError(error);
          return;
        }
      } else if (dateRangeError) {
        return;
      }
    }

    setActiveQueryParams(paramsToUse);
  }, [queryMode, queryParams, dateRangeError, validateDateRange]);

  // 處理刷新
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Excel 匯出
  const handleExport = useCallback(async () => {
    if (!data || data.length === 0) {
      setExportError("沒有數據可供匯出");
      return;
    }

    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const exportData = data.map((row) => ({
        會計期間: row.accountingPeriod,
        零售銷售: row.retailSales,
        訂單銷售: row.orderSales,
        營業收入: row.totalRevenue,
        營業成本: row.costOfGoodsSold,
        毛利益: row.grossProfit,
        營業費用: row.totalOperatingExpenses,
        營業利益: row.operatingProfit,
        本期淨利: row.netProfit,
        綜合損益: row.comprehensiveIncome,
      }));

      let filename = "綜合損益表";
      if (activeQueryParams.periods && activeQueryParams.periods.length > 0) {
        filename += `_${activeQueryParams.periods.join("-")}`;
      } else if (activeQueryParams.period) {
        filename += `_${activeQueryParams.period}`;
      } else if (activeQueryParams.startDate && activeQueryParams.endDate) {
        filename += `_${activeQueryParams.startDate}_${activeQueryParams.endDate}`;
      }
      filename += `_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}`;

      const columns = [
        { header: "會計期間", key: "會計期間", width: 20 },
        { header: "零售銷售", key: "零售銷售", width: 18 },
        { header: "訂單銷售", key: "訂單銷售", width: 18 },
        { header: "營業收入", key: "營業收入", width: 18 },
        { header: "營業成本", key: "營業成本", width: 18 },
        { header: "毛利益", key: "毛利益", width: 18 },
        { header: "營業費用", key: "營業費用", width: 18 },
        { header: "營業利益", key: "營業利益", width: 18 },
        { header: "本期淨利", key: "本期淨利", width: 18 },
        { header: "綜合損益", key: "綜合損益", width: 18 },
      ];

      await exportExcel(exportData, filename, columns);
      setExportSuccess(true);
    } catch (error) {
      console.error("匯出失敗：", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "匯出 Excel 檔案時發生錯誤";
      setExportError(errorMessage);
    } finally {
      setExporting(false);
    }
  }, [data, activeQueryParams]);

  // -------------------------------------------------------
  // 3. Render (使用 ReportLayout)
  // -------------------------------------------------------

  return (
    <ReportLayout
      title="綜合損益表"
      subtitle="查看特定期間的收入、成本、費用與淨利明細"
      
      // ★ Loading 狀態
      isLoading={loading}
      
      // ★ 防抖動關鍵：有舊資料就不顯示骨架屏
      hasData={!!data && data.length > 0}
      
      // ★ 保留原本的綠色透明度樣式
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
        queryMode={queryMode}
        onQueryModeChange={setQueryMode}
        period={period}
        onPeriodChange={setPeriod}
        periods={periods}
        onPeriodsChange={setPeriods}
        startDate={startDate}
        onStartDateChange={handleStartDateChange}
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
        onBatchDateChange={handleBatchDateChange}
        onQuery={() => handleQuery()}
        onQuickSelectQuery={(params) => handleQuery(params)}
        onRefresh={handleRefresh}
        onExport={handleExport}
        loading={loading}
        exporting={exporting}
        hasData={data.length > 0}
        dateRangeError={dateRangeError}
        canQuery={queryParams && Object.keys(queryParams).length > 0}
      />

      {/* 2. 數據表格 (加上上邊距) */}
      <Box sx={{ mt: 3 }}>
        <ComprehensiveIncomeStatementTable
          data={data}
          loading={loading}
          error={error}
          onRetry={handleRefresh}
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
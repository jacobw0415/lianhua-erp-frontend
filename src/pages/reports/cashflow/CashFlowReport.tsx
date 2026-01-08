import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Box, useTheme, Snackbar, Alert } from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

import { useCashFlowReport } from "@/hooks/useCashFlowReport";
import type { CashFlowQueryParams } from "@/hooks/useCashFlowReport";
import { exportExcel } from "@/utils/exportExcel";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { QueryControls } from "./components/QueryControls";
import { CashFlowTable } from "./components/CashFlowTable";
import { ReportLayout } from "@/layout/ReportLayout";

dayjs.extend(quarterOfYear);

/* =========================================================
 * Component: 現金流量表 (Cash Flow Report)
 * ========================================================= */

// 日期驗證常數
const MAX_DATE_RANGE_DAYS = 730; // 最多查詢 2 年

export const CashFlowReport = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // -------------------------------------------------------
  // 1. 狀態管理 (保持不變)
  // -------------------------------------------------------

  // 查詢參數狀態
  const [queryMode, setQueryMode] = useState<"period" | "dateRange">("period");
  const [period, setPeriod] = useState<string>(
    dayjs().format("YYYY-MM")
  );
  const [startDate, setStartDate] = useState<Dayjs | null>(
    dayjs().startOf("month")
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    dayjs().endOf("month")
  );

  // 日期驗證錯誤訊息
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // 當前實際查詢的參數（用於 API 請求）
  const [activeQueryParams, setActiveQueryParams] = useState<CashFlowQueryParams>(() => {
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

  // 追蹤上一次的查詢模式
  const prevQueryModeRef = useRef<"period" | "dateRange">(queryMode);

  // 模式切換同步邏輯
  useEffect(() => {
    if (isBatchUpdating.current) {
      prevQueryModeRef.current = queryMode;
      return;
    }

    const prevMode = prevQueryModeRef.current;
    const modeChanged = prevMode !== queryMode;

    if (queryMode === "dateRange") {
      if (startDate && endDate) {
        const error = validateDateRange(startDate, endDate);
        setDateRangeError(error);
      } else {
        setDateRangeError(null);
      }

      if (modeChanged && prevMode === "period" && period) {
        const periodDate = dayjs(period);
        if (periodDate.isValid()) {
          const periodStart = periodDate.startOf("month");
          const today = dayjs();
          const isCurrentMonth = periodDate.isSame(today, "month") && periodDate.isSame(today, "year");
          const periodEnd = isCurrentMonth ? today.endOf("day") : periodDate.endOf("month");

          if (!startDate || !endDate || !startDate.isSame(periodStart, "day") || !endDate.isSame(periodEnd, "day")) {
            handleBatchDateChange(periodStart, periodEnd);
          }
        }
      }
    } else if (queryMode === "period") {
      setDateRangeError(null);
    }

    prevQueryModeRef.current = queryMode;
  }, [queryMode, startDate, endDate, period, validateDateRange, handleBatchDateChange]);

  // 構建查詢參數
  const queryParams: CashFlowQueryParams = useMemo(() => {
    if (queryMode === "period" && period && period.trim()) {
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
  }, [queryMode, period, startDate, endDate, dateRangeError]);

  // 首次加載
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // 獲取數據
  const { data, loading, error, refresh } = useCashFlowReport(activeQueryParams);

  // Scrollbar
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 處理查詢
  const handleQuery = useCallback((params?: CashFlowQueryParams) => {
    const paramsToUse = params || queryParams;

    if (!paramsToUse || Object.keys(paramsToUse).length === 0) return;

    if (queryMode === "period" && !paramsToUse.period) return;
    
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
        零售收入: row.totalSales,
        訂單收款: row.totalReceipts,
        採購付款: row.totalPayments,
        營運費用: row.totalExpenses,
        總流入: row.totalInflow,
        總流出: row.totalOutflow,
        淨現金流: row.netCashFlow,
      }));

      let filename = "現金流量表";
      if (activeQueryParams.period) {
        filename += `_${activeQueryParams.period}`;
      } else if (activeQueryParams.startDate && activeQueryParams.endDate) {
        filename += `_${activeQueryParams.startDate}_${activeQueryParams.endDate}`;
      }
      filename += `_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}`;

      const columns = [
        { header: "會計期間", key: "會計期間", width: 20 },
        { header: "零售收入", key: "零售收入", width: 18 },
        { header: "訂單收款", key: "訂單收款", width: 18 },
        { header: "採購付款", key: "採購付款", width: 18 },
        { header: "營運費用", key: "營運費用", width: 18 },
        { header: "總流入", key: "總流入", width: 18 },
        { header: "總流出", key: "總流出", width: 18 },
        { header: "淨現金流", key: "淨現金流", width: 18 },
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
      title="現金流量表"
      subtitle="查看零售收入、訂單收款、採購付款、營運費用等現金流動情況"
      
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
        <CashFlowTable
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
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import { useARSummaryReport } from "@/hooks/useARSummaryReport";
import type { ARSummaryQueryParams } from "@/hooks/useARSummaryReport";
import { exportExcel } from "@/utils/exportExcel";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { ARSummaryQueryControls } from "./components/QueryControls";
import { ARSummaryReportTable } from "./components/ARSummaryReportTable";
import { ReportLayout } from "@/layout/ReportLayout";

dayjs.extend(quarterOfYear);

/* =========================================================
 * Component: 應收帳款總表 (Accounts Receivable Summary)
 * ========================================================= */

export const ARSummaryReport = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // -------------------------------------------------------
  // 1. 狀態管理 (保持不變)
  // -------------------------------------------------------

  // 查詢參數狀態
  const [queryMode, setQueryMode] = useState<"period" | "periods" | "specificDate">("period");
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [periods, setPeriods] = useState<string[]>([]);
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [dateError, setDateError] = useState<string | null>(null);

  // 當前實際查詢的參數
  const [activeQueryParams, setActiveQueryParams] = useState<ARSummaryQueryParams>(() => {
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

  // 處理截止日期變更
  const handleEndDateChange = useCallback((date: Dayjs | null) => {
    setEndDate(date);
    if (date && !date.isValid()) {
      setDateError("日期格式無效");
    } else {
      setDateError(null);
    }
  }, []);

  // 構建查詢參數
  const queryParams: ARSummaryQueryParams = useMemo(() => {
    if (queryMode === "periods" && periods.length > 0) {
      return { periods };
    } else if (queryMode === "period" && period && period.trim()) {
      const periodRegex = /^\d{4}-\d{2}$/;
      if (periodRegex.test(period)) {
        return { period };
      }
    } else if (queryMode === "specificDate" && endDate && endDate.isValid()) {
      return {
        endDate: endDate.format("YYYY-MM-DD"),
        period: endDate.format("YYYY-MM") 
      };
    }
    return {};
  }, [queryMode, period, periods, endDate]);

  // 首次加載
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // 獲取數據 Hook
  const { data, loading, error, refresh } = useARSummaryReport(activeQueryParams);

  // Scrollbar
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 處理查詢
  const handleQuery = useCallback((params?: ARSummaryQueryParams) => {
      const paramsToUse = params || queryParams;

      if (!paramsToUse || Object.keys(paramsToUse).length === 0) return;
      if (queryMode === "period" && !paramsToUse.period) return;
      if (queryMode === "periods" && (!paramsToUse.periods || paramsToUse.periods.length === 0)) return;
      
      if (queryMode === "specificDate") {
        if (params?.endDate) {
           // Pass
        } else if (!endDate || !endDate.isValid()) {
           setDateError("請選擇有效的截止日期");
           return;
        }
      }

      setActiveQueryParams(paramsToUse);
  }, [queryMode, queryParams, endDate]);

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
        總應收金額: row.totalReceivable,
        已收金額: row.totalReceived,
        未收餘額: row.totalOutstanding,
      }));

      let filename = "應收帳款總表";
      if (activeQueryParams.periods && activeQueryParams.periods.length > 0) {
        filename += `_多月趨勢`;
      } else if (activeQueryParams.endDate) {
        filename += `_截至_${activeQueryParams.endDate}`;
      } else if (activeQueryParams.period) {
        filename += `_${activeQueryParams.period}`;
      }
      filename += `_${dayjs().format("YYYY-MM-DD_HH-mm")}`;

      const columns = [
        { header: "會計期間", key: "會計期間", width: 25 },
        { header: "總應收金額", key: "總應收金額", width: 20 },
        { header: "已收金額", key: "已收金額", width: 20 },
        { header: "未收餘額", key: "未收餘額", width: 20 },
      ];

      await exportExcel(exportData, filename, columns);
      setExportSuccess(true);
    } catch (error) {
      console.error("匯出失敗：", error);
      const errorMessage = error instanceof Error ? error.message : "匯出 Excel 檔案時發生錯誤";
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
      title="應收帳總表"
      subtitle="檢視特定時間點的應收帳款餘額與未收金額"
      
      // ★ Loading 狀態
      isLoading={loading}
      
      // ★ 防抖動關鍵：有舊資料就不顯示骨架屏
      hasData={!!data && data.length > 0}
      
      // ★ 設定 AR 專屬顏色 (Teal 藍綠色)
      headerSx={{
        backgroundColor: isDark
          ? "rgba(0, 77, 64, 0.85)" // Dark Teal
          : "rgba(0, 105, 92, 0.85)", // Teal
        backdropFilter: "blur(10px)",
      }}
    >
      {/* --- 內容區域 --- */}

      {/* 1. 查詢控制區 */}
      <ARSummaryQueryControls
        queryMode={queryMode}
        onQueryModeChange={setQueryMode}
        period={period}
        onPeriodChange={setPeriod}
        periods={periods}
        onPeriodsChange={setPeriods}
        endDate={endDate}
        onEndDateChange={handleEndDateChange}
        onQuery={() => handleQuery()}
        onQuickSelectQuery={(params) => handleQuery(params)}
        onRefresh={handleRefresh}
        onExport={handleExport}
        loading={loading}
        exporting={exporting}
        hasData={data.length > 0}
        error={dateError}
        canQuery={queryParams && Object.keys(queryParams).length > 0}
      />

      {/* 2. 數據表格 (加上上邊距) */}
      <Box sx={{ mt: 3 }}>
        <ARSummaryReportTable
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
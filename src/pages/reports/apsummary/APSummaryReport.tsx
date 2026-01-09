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
import { useAPSummaryReport } from "@/hooks/useAPSummaryReport";
import type { APSummaryQueryParams } from "@/hooks/useAPSummaryReport";
import { exportExcel } from "@/utils/exportExcel";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { APSummaryQueryControls } from "./components/QueryControls";
import { APSummaryReportTable } from "./components/APSummaryReportTable";
import { ReportLayout } from "@/layout/ReportLayout";

dayjs.extend(quarterOfYear);

/* =========================================================
 * Component: 應付帳款總表 (Accounts Payable Summary)
 * ========================================================= */

export const APSummaryReport = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // -------------------------------------------------------
  // 1. 狀態管理 (保留原本邏輯)
  // -------------------------------------------------------
  
  // 查詢模式與參數
  const [queryMode, setQueryMode] = useState<"period" | "periods" | "specificDate">("period");
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [periods, setPeriods] = useState<string[]>([]);
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
  const [dateError, setDateError] = useState<string | null>(null);

  // 實際用於 API 的參數
  const [activeQueryParams, setActiveQueryParams] = useState<APSummaryQueryParams>(() => {
      return { period: dayjs().format("YYYY-MM") };
  });

  // 首次加載標記
  const isInitialMount = useRef(true);

  // 導出狀態
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // -------------------------------------------------------
  // 2. 邏輯處理 (保留原本邏輯)
  // -------------------------------------------------------

  // 處理截止日期變更與驗證
  const handleEndDateChange = useCallback((date: Dayjs | null) => {
    setEndDate(date);
    if (date && !date.isValid()) {
      setDateError("日期格式無效");
    } else {
      setDateError(null);
    }
  }, []);

  // 構建查詢參數物件 (僅用於 UI 驗證)
  const queryParams: APSummaryQueryParams = useMemo(() => {
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

  // 首次 Mounting 標記移除
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // ★ API Hook (建議 Hook 內部要實作 keepPreviousData: true)
  const { data, loading, error, refresh } = useAPSummaryReport(activeQueryParams);

  // Scrollbar 樣式修正
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 執行查詢
  const handleQuery = useCallback((params?: APSummaryQueryParams) => {
      const paramsToUse = params || queryParams;

      if (!paramsToUse || Object.keys(paramsToUse).length === 0) return;
      if (queryMode === "period" && !paramsToUse.period) return;
      if (queryMode === "periods" && (!paramsToUse.periods || paramsToUse.periods.length === 0)) return;
      
      if (queryMode === "specificDate") {
        if (params?.endDate) {
           // Pass check
        } else if (!endDate || !endDate.isValid()) {
           setDateError("請選擇有效的截止日期");
           return;
        }
      }

      setActiveQueryParams(paramsToUse);
  }, [queryMode, queryParams, endDate]);

  // 執行刷新
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // 執行 Excel 匯出
  const handleExport = useCallback(async () => {
    if (!data || data.length === 0) {
      setExportError("沒有數據可供匯出");
      return;
    }

    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      // 準備匯出數據
      const exportData = data.map((row) => ({
        會計期間: row.accountingPeriod,
        總應付金額: row.totalPayable,
        已付金額: row.totalPaid,
        未付餘額: row.totalOutstanding,
      }));

      // 生成檔名
      let filename = "應付帳款總表";
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
        { header: "總應付金額", key: "總應付金額", width: 20 },
        { header: "已付金額", key: "已付金額", width: 20 },
        { header: "未付餘額", key: "未付餘額", width: 20 },
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
  // 3. Render 畫面渲染 (使用 ReportLayout)
  // -------------------------------------------------------

  return (
    <ReportLayout
      title="應付帳總表"
      subtitle="檢視特定時間點的應付帳款餘額與未付金額"
      
      // ★ Loading 狀態控制
      isLoading={loading}
      
      // ★ 關鍵防抖動：只要畫面上有舊資料，就不顯示全頁骨架屏
      hasData={!!data && data.length > 0}
      
      // ★ 自定義 Header 顏色 (保留您原本的紅色負債警示風格)
      // 注意：需確保 ReportLayout 支援 headerSx 屬性
      headerSx={{
        backgroundColor: isDark 
          ? "rgba(183, 28, 28, 0.85)" // Dark Red
          : "rgba(198, 40, 40, 0.85)", // Light Red
        backdropFilter: "blur(10px)",
      }}
    >
      
      {/* --- 內容區域 (Children) --- */}
      
      {/* 1. 查詢控制區 */}
      <APSummaryQueryControls
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

      {/* 2. 數據表格 */}
      {/* 加上 mt: 3 保持與查詢區塊的間距 */}
      <Box sx={{ mt: 3 }}>
        <APSummaryReportTable
          data={data}
          loading={loading} // 這裡傳入 loading，讓表格內部處理透明度變化
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
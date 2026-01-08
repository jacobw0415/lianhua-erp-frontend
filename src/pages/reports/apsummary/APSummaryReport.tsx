import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Fade,
  Snackbar,
  Alert,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/zh-tw";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import AssessmentIcon from "@mui/icons-material/Assessment"; 

import { useAPSummaryReport } from "@/hooks/useAPSummaryReport";
import type { APSummaryQueryParams } from "@/hooks/useAPSummaryReport";
import { exportExcel } from "@/utils/exportExcel";
import { APSummaryQueryControls } from "./components/QueryControls";
import { APSummaryReportTable } from "./components/APSummaryReportTable";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

dayjs.extend(quarterOfYear);

/* =========================================================
 * Component
 * ========================================================= */

export const APSummaryReport = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // 查詢參數狀態
  // AP 報表模式：單月(period) | 多月(periods) | 指定截止日(specificDate)
  const [queryMode, setQueryMode] = useState<"period" | "periods" | "specificDate">("period");
  
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [periods, setPeriods] = useState<string[]>([]);
  
  // AP 報表只需要截止日 (As Of Date)，不需要起始日
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());

  // 日期驗證錯誤訊息
  const [dateError, setDateError] = useState<string | null>(null);

  // 當前實際查詢的參數（用於 API 請求）
  const [activeQueryParams, setActiveQueryParams] =
    useState<APSummaryQueryParams>(() => {
      // 初始值：使用當月作為默認查詢
      return { period: dayjs().format("YYYY-MM") };
    });

  // 是否為首次加載
  const isInitialMount = useRef(true);

  // 導出狀態
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // 處理截止日期變更
  const handleEndDateChange = useCallback(
    (date: Dayjs | null) => {
      setEndDate(date);
      if (date && !date.isValid()) {
        setDateError("日期格式無效");
      } else {
        setDateError(null);
      }
    },
    []
  );

  // 構建查詢參數（僅用於驗證，不自動觸發查詢）
  const queryParams: APSummaryQueryParams = useMemo(() => {
    if (queryMode === "periods" && periods.length > 0) {
      // 多月份比較
      return { periods };
    } else if (queryMode === "period" && period && period.trim()) {
      // 單一月份 (月底餘額)
      const periodRegex = /^\d{4}-\d{2}$/;
      if (periodRegex.test(period)) {
        return { period };
      }
    } else if (
      queryMode === "specificDate" &&
      endDate &&
      endDate.isValid()
    ) {
      // 指定截止日
      return {
        endDate: endDate.format("YYYY-MM-DD"),
        // 同時帶入月份，方便後端或前端顯示參考
        period: endDate.format("YYYY-MM") 
      };
    }
    return {};
  }, [queryMode, period, periods, endDate]);

  // 首次加載時自動查詢一次
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, []);

  // 獲取數據（使用 hook）
  const { data, loading, error, refresh, lastUpdated } =
    useAPSummaryReport(activeQueryParams);

  // 套用 body scrollbar 樣式
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 處理查詢按鈕點擊
  const handleQuery = useCallback(
    (params?: APSummaryQueryParams) => {
      const paramsToUse = params || queryParams;

      // 基礎驗證
      if (!paramsToUse || Object.keys(paramsToUse).length === 0) {
        return;
      }

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

      // 更新查詢參數，觸發 Hook 查詢
      setActiveQueryParams(paramsToUse);
    },
    [queryMode, queryParams, endDate]
  );

  // 處理刷新
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Excel 匯出功能
  const handleExport = useCallback(async () => {
    if (!data || data.length === 0) {
      setExportError("沒有數據可供匯出");
      return;
    }

    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      // 1. 準備匯出數據 (對應 AP 欄位)
      const exportData = data.map((row) => ({
        會計期間: row.accountingPeriod,
        總應付金額: row.totalPayable,
        已付金額: row.totalPaid,
        未付餘額: row.totalOutstanding, // 負債欄位
      }));

      // 2. 生成檔案名稱
      let filename = "應付帳款總表";
      if (activeQueryParams.periods && activeQueryParams.periods.length > 0) {
        filename += `_多月趨勢`;
      } else if (activeQueryParams.endDate) {
        filename += `_截至_${activeQueryParams.endDate}`;
      } else if (activeQueryParams.period) {
        filename += `_${activeQueryParams.period}`;
      }
      filename += `_${dayjs().format("YYYY-MM-DD_HH-mm")}`;

      // 3. 定義欄位寬度
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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "匯出 Excel 檔案時發生錯誤";
      setExportError(errorMessage);
    } finally {
      setExporting(false);
    }
  }, [data, activeQueryParams]);

  return (
    <Box sx={{ padding: 3, position: "relative" }}>
      {/* 標題區 */}
      <Fade in timeout={500}>
        <Card
          sx={{
            backdropFilter: "blur(10px)",
            // 使用紅色系主題 (Red) 來區分應付帳款 (負債)
            background: isDark
              ? "rgba(183, 28, 28, 0.85)" // Dark Red 900
              : "rgba(198, 40, 40, 0.85)", // Red 800
            color: "#fff",
            borderRadius: 3,
            boxShadow: isDark ? 4 : 3,
            mb: 3,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <CardContent sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              {/* 使用 AssignmentLateIcon (警示/待辦) 或 MoneyOffIcon */}
              <AssessmentIcon sx={{ fontSize: 32, mr: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                應付帳款總表
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
              檢視特定時間點的應付帳款餘額與未付金額
            </Typography>
            {lastUpdated && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                最後更新：{dayjs(lastUpdated).format("YYYY-MM-DD HH:mm:ss")}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* 查詢控制區 */}
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

      {/* 導出成功提示 */}
      <Snackbar
        open={exportSuccess}
        autoHideDuration={3000}
        onClose={() => setExportSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setExportSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Excel 檔案匯出成功！
        </Alert>
      </Snackbar>

      {/* 導出錯誤提示 */}
      <Snackbar
        open={!!exportError}
        autoHideDuration={5000}
        onClose={() => setExportError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setExportError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {exportError}
        </Alert>
      </Snackbar>

      {/* 數據表格 */}
      <APSummaryReportTable
        data={data}
        loading={loading}
        error={error}
        onRetry={handleRefresh}
      />
    </Box>
  );
};
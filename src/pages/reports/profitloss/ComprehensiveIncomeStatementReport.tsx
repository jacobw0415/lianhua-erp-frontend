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
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useComprehensiveIncomeStatement } from "@/hooks/useComprehensiveIncomeStatement";
import type { ComprehensiveIncomeStatementQueryParams } from "@/hooks/useComprehensiveIncomeStatement";
import { exportExcel } from "@/utils/exportExcel";
import { QueryControls } from "./components/QueryControls";
import { ComprehensiveIncomeStatementTable } from "./components/ComprehensiveIncomeStatementTable";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

dayjs.extend(quarterOfYear);

/* =========================================================
 * Component
 * ========================================================= */

// 日期驗證常數
const MAX_DATE_RANGE_DAYS = 730; // 最多查詢 2 年

export const ComprehensiveIncomeStatementReport = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // 查詢參數狀態
  const [queryMode, setQueryMode] = useState<"period" | "dateRange" | "periods">("period");
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [periods, setPeriods] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().endOf("month"));

  // 日期驗證錯誤訊息
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // 當前實際查詢的參數（用於 API 請求）
  const [activeQueryParams, setActiveQueryParams] =
    useState<ComprehensiveIncomeStatementQueryParams>(() => {
      // 初始值：使用當月作為默認查詢
      return { period: dayjs().format("YYYY-MM") };
    });

  // 是否為首次加載
  const isInitialMount = useRef(true);
  // 標記是否正在進行批次更新（避免 useEffect 覆蓋批次更新的驗證結果）
  const isBatchUpdating = useRef(false);

  // 導出狀態
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // 驗證日期範圍
  const validateDateRange = useCallback(
    (start: Dayjs | null, end: Dayjs | null): string | null => {
      if (!start || !end) {
        return null;
      }

      // 確保日期對象有效
      if (!start.isValid() || !end.isValid()) {
        return "日期格式無效";
      }

      // 使用標準化的日期（去除時間部分）進行比較
      const startDay = start.startOf("day");
      const endDay = end.startOf("day");

      if (endDay.isBefore(startDay)) {
        return "結束日期不能早於起始日期";
      }

      // 計算天數差（包含起始和結束日期）
      const daysDiff = endDay.diff(startDay, "day") + 1;
      if (daysDiff > MAX_DATE_RANGE_DAYS) {
        return `查詢範圍不能超過 ${MAX_DATE_RANGE_DAYS} 天（約 2 年）`;
      }

      return null;
    },
    []
  );

  // 批次更新日期（用於快速選擇，避免中間狀態的驗證錯誤）
  const handleBatchDateChange = useCallback(
    (start: Dayjs | null, end: Dayjs | null) => {
      // 標記正在進行批次更新
      isBatchUpdating.current = true;
      // 先清除錯誤，避免中間狀態觸發驗證
      setDateRangeError(null);
      // 批次更新兩個日期
      setStartDate(start);
      setEndDate(end);
      // 然後統一驗證（同步驗證，不依賴狀態）
      if (start && end) {
        const error = validateDateRange(start, end);
        // 使用 setTimeout 確保在狀態更新後再設置錯誤（避免競態條件）
        setTimeout(() => {
          setDateRangeError(error);
          isBatchUpdating.current = false;
        }, 0);
      } else {
        // 如果日期為空，直接重置標記
        setTimeout(() => {
          isBatchUpdating.current = false;
        }, 0);
      }
    },
    [validateDateRange]
  );

  // 處理日期變更（帶驗證）
  const handleStartDateChange = useCallback(
    (date: Dayjs | null) => {
      setStartDate(date);
      if (date && endDate) {
        const error = validateDateRange(date, endDate);
        setDateRangeError(error);
      } else {
        setDateRangeError(null);
      }
    },
    [endDate, validateDateRange]
  );

  const handleEndDateChange = useCallback(
    (date: Dayjs | null) => {
      setEndDate(date);
      if (startDate && date) {
        const error = validateDateRange(startDate, date);
        setDateRangeError(error);
      } else {
        setDateRangeError(null);
      }
    },
    [startDate, validateDateRange]
  );

  // 構建查詢參數（僅用於驗證，不自動觸發查詢）
  const queryParams: ComprehensiveIncomeStatementQueryParams = useMemo(() => {
    if (queryMode === "periods" && periods.length > 0) {
      // 多月份比較（優先）
      return { periods };
    } else if (queryMode === "period" && period && period.trim()) {
      // 驗證月份格式是否正確 (YYYY-MM)
      const periodRegex = /^\d{4}-\d{2}$/;
      if (periodRegex.test(period)) {
        // 進一步驗證月份是否有效（1-12月）
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
      // 確保日期順序正確且無錯誤
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

  // 首次加載時自動查詢一次（確保使用初始查詢參數）
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // 初始加載時使用默認參數查詢（activeQueryParams 已有初始值，useComprehensiveIncomeStatement 會自動查詢）
    }
  }, []);

  // 獲取數據（使用主動查詢參數）
  const { data, loading, error, refresh, lastUpdated } =
    useComprehensiveIncomeStatement(activeQueryParams);

  // 套用 body scrollbar 樣式（與 dashboard 一致）
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 處理查詢按鈕點擊
  const handleQuery = useCallback(
    (params?: ComprehensiveIncomeStatementQueryParams) => {
      // 如果提供了參數，直接使用；否則使用當前查詢條件
      const paramsToUse = params || queryParams;

      // 驗證查詢條件
      if (!paramsToUse || Object.keys(paramsToUse).length === 0) {
        return;
      }

      if (queryMode === "period" && !paramsToUse.period) {
        return;
      }
      if (queryMode === "periods" && (!paramsToUse.periods || paramsToUse.periods.length === 0)) {
        return;
      }
      if (queryMode === "dateRange") {
        if (!paramsToUse.startDate || !paramsToUse.endDate) {
          return;
        }
        // 對於日期區間，如果提供了直接參數（快速選擇），需要驗證日期範圍
        if (params) {
          // 驗證快速選擇的日期範圍
          const start = dayjs(params.startDate);
          const end = dayjs(params.endDate);
          // 驗證日期是否有效
          if (!start.isValid() || !end.isValid()) {
            setDateRangeError("日期格式無效");
            return;
          }
          const error = validateDateRange(start, end);
          if (error) {
            // 如果有錯誤，設置錯誤並返回
            setDateRangeError(error);
            return;
          }
        } else if (dateRangeError) {
          // 對於手動查詢，如果有錯誤則不允許查詢
          return;
        }
      }

      // 更新查詢參數，觸發查詢
      setActiveQueryParams(paramsToUse);
    },
    [queryMode, queryParams, dateRangeError, validateDateRange]
  );

  // 處理刷新（使用當前查詢參數重新查詢）
  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Excel 匯出功能（帶進度提示和錯誤處理）
  const handleExport = useCallback(async () => {
    if (!data || data.length === 0) {
      setExportError("沒有數據可供匯出");
      return;
    }

    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      // 準備匯出數據（包含所有行，包括合計行）
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

      // 生成檔案名稱（使用實際查詢的參數）
      let filename = "綜合損益表";
      if (activeQueryParams.periods && activeQueryParams.periods.length > 0) {
        filename += `_${activeQueryParams.periods.join("-")}`;
      } else if (activeQueryParams.period) {
        filename += `_${activeQueryParams.period}`;
      } else if (activeQueryParams.startDate && activeQueryParams.endDate) {
        filename += `_${activeQueryParams.startDate}_${activeQueryParams.endDate}`;
      }
      filename += `_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}`;

      // 定義欄位
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

  return (
    <Box sx={{ padding: 3, position: "relative" }}>
      {/* 標題區 */}
      <Fade in timeout={500}>
        <Card
          sx={{
            backdropFilter: "blur(10px)",
            background: isDark
              ? "rgba(27, 94, 32, 0.85)"
              : "rgba(46, 125, 50, 0.85)",
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
              <TrendingUpIcon sx={{ fontSize: 32, mr: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                綜合損益表
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
              查看特定期間的收入、成本、費用與淨利明細
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
      <ComprehensiveIncomeStatementTable
        data={data}
        loading={loading}
        error={error}
        onRetry={handleRefresh}
      />
    </Box>
  );
};


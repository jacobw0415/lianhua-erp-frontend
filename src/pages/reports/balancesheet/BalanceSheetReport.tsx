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
import TableViewIcon from "@mui/icons-material/TableView";

import { useBalanceSheetReport } from "@/hooks/useBalanceSheetReport";
import type { BalanceSheetQueryParams } from "@/hooks/useBalanceSheetReport";
import { exportExcel } from "@/utils/exportExcel";
import { QueryControls } from "./components/QueryControls";
import { BalanceSheetTable } from "./components/BalanceSheetTable";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

/* =========================================================
 * Component
 * ========================================================= */

export const BalanceSheetReport = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // 查詢類型狀態
  const [queryType, setQueryType] = useState<"month" | "date">("month");

  // 查詢參數狀態
  const [period, setPeriod] = useState<string>(dayjs().format("YYYY-MM"));
  const [periods, setPeriods] = useState<string[]>([]);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  // 當前實際查詢的參數（用於 API 請求）
  const [activeQueryParams, setActiveQueryParams] = useState<BalanceSheetQueryParams>(() => {
    // 初始值：使用當月作為默認查詢
    return { period: dayjs().format("YYYY-MM") };
  });

  // 是否為首次加載
  const isInitialMount = useRef(true);

  // 導出狀態
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  // 首次加載時自動查詢一次（確保使用初始查詢參數）
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // 初始加載時使用默認參數查詢（activeQueryParams 已有初始值，useBalanceSheetReport 會自動查詢）
    }
  }, []);

  // 獲取數據（使用主動查詢參數）
  const { data, loading, error, refresh, lastUpdated } =
    useBalanceSheetReport(activeQueryParams);

  // 套用 body scrollbar 樣式（與 dashboard 一致）
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 構建查詢參數（僅用於驗證，不自動觸發查詢）
  const queryParams: BalanceSheetQueryParams | null = useMemo(() => {
    // 月份模式：優先 periods（多個月份並列），其次單一 period
    if (queryType === "month") {
      // 先檢查 periods（多月份查詢）
      const normalizedPeriods = [...new Set(periods.map((p) => p?.trim()))].filter(Boolean);
      const limitedPeriods = normalizedPeriods.slice(0, 12); // 與後端限制一致，避免過多查詢
      if (limitedPeriods.length > 0) {
        // 基本格式驗證
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

      // 如果 periods 為空，檢查單一 period
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

    // 日期模式：使用 endDate
    if (queryType === "date" && endDate && endDate.isValid()) {
      return {
        endDate: endDate.format("YYYY-MM-DD"),
      };
    }

    return null;
  }, [queryType, period, periods, endDate]);

  // 處理查詢按鈕點擊
  const handleQuery = useCallback(() => {
    if (!queryParams) {
      return;
    }

    // 更新查詢參數，觸發查詢
    setActiveQueryParams(queryParams);
  }, [queryParams]);

  // 處理快速選擇（立即觸發查詢）
  const handleQuickSelect = useCallback((params: BalanceSheetQueryParams) => {
    setActiveQueryParams(params);
  }, []);

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
      // 準備匯出數據（過濾掉合計行，只匯出實際數據）
      const reportData = data.filter(
        (item) => !item.accountingPeriod.includes("合計")
      );

      const exportData = reportData.map((row) => ({
        會計期間: row.accountingPeriod,
        應收帳款: row.accountsReceivable,
        現金: row.cash,
        應付帳款: row.accountsPayable,
        總資產: row.totalAssets,
        總負債: row.totalLiabilities,
        業主權益: row.equity,
      }));

      // 如果有合計行，也加入匯出
      const totalRow = data.find((item) => item.accountingPeriod.includes("合計"));
      if (totalRow) {
        exportData.push({
          會計期間: totalRow.accountingPeriod,
          應收帳款: totalRow.accountsReceivable,
          現金: totalRow.cash,
          應付帳款: totalRow.accountsPayable,
          總資產: totalRow.totalAssets,
          總負債: totalRow.totalLiabilities,
          業主權益: totalRow.equity,
        });
      }

      // 生成檔案名稱（使用實際查詢的參數）
      let filename = "資產負債表";
      if (activeQueryParams.periods && activeQueryParams.periods.length > 0) {
        const sorted = [...activeQueryParams.periods].sort();
        const rangeLabel =
          sorted.length > 1
            ? `${sorted[0]}-${sorted[sorted.length - 1]}`
            : sorted[0];
        filename += `_${rangeLabel}`;
      } else if (activeQueryParams.period) {
        filename += `_${activeQueryParams.period}`;
      } else if (activeQueryParams.endDate) {
        filename += `_${activeQueryParams.endDate}`;
      }
      filename += `_${dayjs().format("YYYY-MM-DD_HH-mm-ss")}`;

      // 定義欄位
      const columns = [
        { header: "會計期間", key: "會計期間", width: 20 },
        { header: "應收帳款", key: "應收帳款", width: 18 },
        { header: "現金", key: "現金", width: 18 },
        { header: "應付帳款", key: "應付帳款", width: 18 },
        { header: "總資產", key: "總資產", width: 18 },
        { header: "總負債", key: "總負債", width: 18 },
        { header: "業主權益", key: "業主權益", width: 18 },
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

  // 獲取當前查詢的顯示文字（用於無數據提示）
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
              <TableViewIcon sx={{ fontSize: 32, mr: 1.5 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                資產負債表
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
              查看企業資產、負債與權益的報表資料
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

      {/* 導出成功提示 */}
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
      <BalanceSheetTable
        data={data}
        loading={loading}
        error={error}
        onRetry={handleRefresh}
        period={getQueryDisplayText()}
      />
    </Box>
  );
};

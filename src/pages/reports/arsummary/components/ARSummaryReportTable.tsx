import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  TableSortLabel,
  useTheme,
  Button,
  Box,
} from "@mui/material";
// 引入我們剛建立的 Hook 中的型別
import type { ARSummaryReportDto } from "@/hooks/useARSummaryReport";
import { PlainCurrency } from "@/components/money/PlainCurrency";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";
import { LoadingPlaceholder } from "@/components/common/LoadingPlaceholder";

interface ARSummaryReportTableProps {
  data: ARSummaryReportDto[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

// 定義 AR 報表專用的排序欄位
type SortField =
  | "accountingPeriod"
  | "totalReceivable"
  | "totalReceived"
  | "totalOutstanding";

type SortOrder = "asc" | "desc";

export const ARSummaryReportTable = ({
  data,
  loading,
  error,
  onRetry,
}: ARSummaryReportTableProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  
  // 排序狀態管理
  const [sortField, setSortField] = useState<SortField>("accountingPeriod");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc"); // 預設降序 (最新的月份在最上面)

  // 保存上一次的數據，避免加載時顯示骨架屏造成畫面抖動
  const previousDataRef = useRef<ARSummaryReportDto[]>(data);
  const [displayData, setDisplayData] = useState<ARSummaryReportDto[]>(data);
  const isFirstLoadRef = useRef(true);

  // 當數據更新且不在加載中時，更新顯示數據
  useEffect(() => {
    if (!loading) {
      setDisplayData(data);
      if (data.length > 0) {
        previousDataRef.current = data;
      }
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    }
  }, [data, loading]);

  // 使用顯示數據而不是原始數據
  const effectiveData =
    loading && previousDataRef.current.length > 0 && !isFirstLoadRef.current && displayData.length > 0
      ? previousDataRef.current
      : displayData;

  // 分離合計行和數據行 (若後端有回傳 "合計" 或 "總計" 的列)
  const { dataRows, summaryRow } = useMemo(() => {
    if (!effectiveData || effectiveData.length === 0) {
      return { dataRows: [], summaryRow: null };
    }

    const lastRow = effectiveData[effectiveData.length - 1];
    const isSummaryRow =
      lastRow.accountingPeriod.includes("合計") ||
      lastRow.accountingPeriod.includes("總計") ||
      lastRow.accountingPeriod === "Total";

    if (isSummaryRow) {
      return {
        dataRows: effectiveData.slice(0, -1),
        summaryRow: lastRow,
      };
    }

    return { dataRows: effectiveData, summaryRow: null };
  }, [effectiveData]);

  // 取得排序值
  const getSortValue = (
    row: ARSummaryReportDto,
    field: SortField
  ): string | number => {
    switch (field) {
      case "accountingPeriod":
        return row.accountingPeriod;
      case "totalReceivable":
        return row.totalReceivable;
      case "totalReceived":
        return row.totalReceived;
      case "totalOutstanding":
        return row.totalOutstanding;
      default:
        return "";
    }
  };

  // 執行排序
  const sortedDataRows = useMemo(() => {
    if (!dataRows.length) return [];

    const sorted = [...dataRows].sort((a, b) => {
      const aValue = getSortValue(a, sortField);
      const bValue = getSortValue(b, sortField);

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue, "zh-TW")
          : bValue.localeCompare(aValue, "zh-TW");
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [dataRows, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc"); // 金額或日期通常預設降序看比較直觀
    }
  };

  // 可排序表頭組件
  const SortableHeader = ({
    field,
    children,
    align = "right",
  }: {
    field: SortField;
    children: React.ReactNode;
    align?: "left" | "right" | "center";
  }) => (
    <TableCell align={align} sx={{ fontWeight: 600 }}>
      <TableSortLabel
        active={sortField === field}
        direction={sortField === field ? sortOrder : "asc"}
        onClick={() => handleSort(field)}
      >
        {children}
      </TableSortLabel>
    </TableCell>
  );

  return (
    <Card>
      <CardContent>
        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={onRetry}>
                重試
              </Button>
            }
          >
            載入數據時發生錯誤：{error.message}
          </Alert>
        ) : loading && effectiveData.length === 0 && isFirstLoadRef.current ? (
          <LoadingPlaceholder />
        ) : effectiveData.length === 0 && !loading ? (
          <Alert severity="info">目前沒有符合條件的應收帳款數據</Alert>
        ) : (
          <Box
            sx={{
              position: "relative",
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                maxHeight: "70vh",
                overflow: "auto",
                ...getScrollbarStyles(theme),
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <SortableHeader field="accountingPeriod" align="left">
                      會計期間
                    </SortableHeader>
                    
                    <SortableHeader field="totalReceivable">
                      總應收金額
                    </SortableHeader>
                    
                    <SortableHeader field="totalReceived">
                      已收金額
                    </SortableHeader>
                    
                    {/* 未收金額是重點，可以使用較明顯的顏色標示 */}
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'error.main' }}>
                      <TableSortLabel
                        active={sortField === "totalOutstanding"}
                        direction={sortField === "totalOutstanding" ? sortOrder : "asc"}
                        onClick={() => handleSort("totalOutstanding")}
                      >
                        未收餘額
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {sortedDataRows.map((row) => (
                    <TableRow key={row.accountingPeriod} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {row.accountingPeriod}
                      </TableCell>
                      
                      <TableCell align="right">
                        <PlainCurrency value={row.totalReceivable} showDecimal />
                      </TableCell>
                      
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        <PlainCurrency value={row.totalReceived} showDecimal />
                      </TableCell>
                      
                      <TableCell 
                        align="right" 
                        sx={{ 
                          fontWeight: 700,
                          // 如果未收金額 > 0，顯示紅色，否則顯示一般顏色或綠色
                          color: row.totalOutstanding > 0 ? 'error.main' : 'success.main'
                        }}
                      >
                        <PlainCurrency value={row.totalOutstanding} showDecimal />
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* 合計行渲染 */}
                  {summaryRow && (
                    <TableRow
                      key={`summary-${summaryRow.accountingPeriod}`}
                      sx={{
                        backgroundColor: isDark
                          ? "rgba(46, 125, 50, 0.2)"
                          : "rgba(46, 125, 50, 0.1)",
                        "& td": {
                          fontWeight: 600,
                          borderTop: `2px solid ${theme.palette.divider}`,
                        },
                      }}
                    >
                      <TableCell>{summaryRow.accountingPeriod}</TableCell>
                      <TableCell align="right">
                        <PlainCurrency value={summaryRow.totalReceivable} showDecimal />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency value={summaryRow.totalReceived} showDecimal />
                      </TableCell>
                      <TableCell align="right" sx={{ color: summaryRow.totalOutstanding > 0 ? 'error.main' : 'inherit' }}>
                        <PlainCurrency value={summaryRow.totalOutstanding} showDecimal />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
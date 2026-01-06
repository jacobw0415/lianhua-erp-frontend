import { useMemo, useState, useRef, useEffect } from "react";
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
  Skeleton,
  LinearProgress,
  TableSortLabel,
  useTheme,
  Button,
  Fade,
  Box,
} from "@mui/material";
import type { CashFlowReportDto } from "@/hooks/useCashFlowReport";
import { PlainCurrency } from "@/components/money/PlainCurrency";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";

interface CashFlowTableProps {
  data: CashFlowReportDto[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

type SortField =
  | "accountingPeriod"
  | "totalSales"
  | "totalReceipts"
  | "totalPayments"
  | "totalExpenses"
  | "totalInflow"
  | "totalOutflow"
  | "netCashFlow";

type SortOrder = "asc" | "desc";

export const CashFlowTable = ({
  data,
  loading,
  error,
  onRetry,
}: CashFlowTableProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [sortField, setSortField] = useState<SortField>("accountingPeriod");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  
  // 保存上一次的數據，避免加載時顯示骨架屏造成抖動
  const previousDataRef = useRef<CashFlowReportDto[]>(data);
  const [displayData, setDisplayData] = useState<CashFlowReportDto[]>(data);
  const isFirstLoadRef = useRef(true);
  
  // 當數據更新且不在加載中時，更新顯示數據
  useEffect(() => {
    if (!loading) {
      // 數據加載完成，更新顯示數據
      previousDataRef.current = data;
      setDisplayData(data);
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    }
    // 當數據變化時，也更新引用（即使正在加載）
    if (data.length > 0 && !loading) {
      previousDataRef.current = data;
    }
  }, [data, loading]);
  
  // 使用顯示數據而不是原始數據（避免加載時數據突然消失）
  // 如果正在加載且有舊數據，顯示舊數據；否則顯示當前數據
  const effectiveData = loading && previousDataRef.current.length > 0 && !isFirstLoadRef.current
    ? previousDataRef.current 
    : displayData;

  // 分離合計行和數據行（使用有效數據）
  const { dataRows, summaryRow } = useMemo(() => {
    if (!effectiveData || effectiveData.length === 0) {
      return { dataRows: [], summaryRow: null };
    }

    // 最後一行通常是合計行
    const lastRow = effectiveData[effectiveData.length - 1];
    const isSummaryRow =
      lastRow.accountingPeriod.includes("合計") ||
      lastRow.accountingPeriod.includes("總計");

    if (isSummaryRow) {
      return {
        dataRows: effectiveData.slice(0, -1),
        summaryRow: lastRow,
      };
    }

    return { dataRows: effectiveData, summaryRow: null };
  }, [effectiveData]);

  // 通用排序函數
  const getSortValue = (row: CashFlowReportDto, field: SortField): string | number => {
    switch (field) {
      case "accountingPeriod":
        return row.accountingPeriod;
      case "totalSales":
        return row.totalSales;
      case "totalReceipts":
        return row.totalReceipts;
      case "totalPayments":
        return row.totalPayments;
      case "totalExpenses":
        return row.totalExpenses;
      case "totalInflow":
        return row.totalInflow;
      case "totalOutflow":
        return row.totalOutflow;
      case "netCashFlow":
        return row.netCashFlow;
      default:
        return "";
    }
  };

  // 排序數據
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
      setSortOrder("asc");
    }
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableCell align="right" sx={{ fontWeight: 600 }}>
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
        ) : effectiveData.length === 0 && !loading ? (
          <Alert severity="info">目前沒有符合條件的數據</Alert>
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
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      <TableSortLabel
                        active={sortField === "accountingPeriod"}
                        direction={
                          sortField === "accountingPeriod" ? sortOrder : "asc"
                        }
                        onClick={() => handleSort("accountingPeriod")}
                      >
                        會計期間
                      </TableSortLabel>
                    </TableCell>
                    <SortableHeader field="totalSales">零售收入</SortableHeader>
                    <SortableHeader field="totalReceipts">訂單收款</SortableHeader>
                    <SortableHeader field="totalPayments">採購付款</SortableHeader>
                    <SortableHeader field="totalExpenses">營運費用</SortableHeader>
                    <SortableHeader field="totalInflow">總流入</SortableHeader>
                    <SortableHeader field="totalOutflow">總流出</SortableHeader>
                    <SortableHeader field="netCashFlow">淨現金流</SortableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* 數據行 */}
                  {sortedDataRows.map((row) => (
                    <TableRow key={row.accountingPeriod} hover>
                      <TableCell>{row.accountingPeriod}</TableCell>
                      <TableCell align="right">
                        <PlainCurrency value={row.totalSales} showDecimal />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={row.totalReceipts}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={row.totalPayments}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={row.totalExpenses}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={row.totalInflow}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={row.totalOutflow}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          color:
                            row.netCashFlow >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        <PlainCurrency
                          value={row.netCashFlow}
                          showDecimal
                        />
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* 合計行 */}
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
                        <PlainCurrency
                          value={summaryRow.totalSales}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalReceipts}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalPayments}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalExpenses}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalInflow}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalOutflow}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            summaryRow.netCashFlow >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        <PlainCurrency
                          value={summaryRow.netCashFlow}
                          showDecimal
                        />
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


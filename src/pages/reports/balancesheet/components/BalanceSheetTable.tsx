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
  TableSortLabel,
  useTheme,
  Button,
  Box,
  Typography,
} from "@mui/material";
import type { BalanceSheetReportDto } from "@/hooks/useBalanceSheetReport";
import { PlainCurrency } from "@/components/money/PlainCurrency";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";

interface BalanceSheetTableProps {
  data: BalanceSheetReportDto[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
  period?: string; // 选择的月份，用于无数据提示
}

type SortField =
  | "accountingPeriod"
  | "accountsReceivable"
  | "cash"
  | "accountsPayable"
  | "totalAssets"
  | "totalLiabilities"
  | "equity";

type SortOrder = "asc" | "desc";

export const BalanceSheetTable = ({
  data,
  loading,
  error,
  onRetry,
  period,
}: BalanceSheetTableProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [sortField, setSortField] = useState<SortField>("accountingPeriod");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 分組色彩集中管理，使用更專業柔和的色調
  // 資產類：藍灰色調（專業、穩重）
  const assetHeaderColor = isDark ? "#546E7A" : "#607D8B";
  // 負債類：暖灰色調（溫和、不刺眼）
  const liabilityHeaderColor = isDark ? "#8D6E63" : "#A1887F";
  // 權益類：綠色系（與現金流量表一致，代表正向）
  const equityHeaderColor = isDark ? "#2E7D32" : "#388E3C";
  // 第二行表頭顏色：統一使用現金流量表表格內的淡綠色風格
  const cashFlowHeaderBg = isDark
    ? "rgba(46, 125, 50, 0.2)"
    : "rgba(46, 125, 50, 0.1)";
  const cashFlowHeaderText = isDark ? "#C8E6C9" : "#2E7D32";

  // 保存上一次的數據，避免加載時顯示骨架屏造成抖動
  const previousDataRef = useRef<BalanceSheetReportDto[]>(data);
  const [displayData, setDisplayData] = useState<BalanceSheetReportDto[]>(data);
  const isFirstLoadRef = useRef(true);

  // 當數據更新且不在加載中時，更新顯示數據
  useEffect(() => {
    if (!loading) {
      // 數據加載完成，更新顯示數據
      setDisplayData(data);
      // 只有當有數據時才更新 previousDataRef（避免無數據時顯示舊數據）
      if (data.length > 0) {
        previousDataRef.current = data;
      }
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
      }
    }
  }, [data, loading]);

  // 使用顯示數據而不是原始數據（避免加載時數據突然消失）
  // 如果正在加載且有舊數據，顯示舊數據；否則顯示當前數據
  // 但如果是首次加載或當前數據為空，不顯示舊數據
  const effectiveData = loading && previousDataRef.current.length > 0 && !isFirstLoadRef.current && displayData.length > 0
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
  const getSortValue = (row: BalanceSheetReportDto, field: SortField): string | number => {
    switch (field) {
      case "accountingPeriod":
        return row.accountingPeriod;
      case "accountsReceivable":
        return row.accountsReceivable;
      case "cash":
        return row.cash;
      case "accountsPayable":
        return row.accountsPayable;
      case "totalAssets":
        return row.totalAssets;
      case "totalLiabilities":
        return row.totalLiabilities;
      case "equity":
        return row.equity;
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
    sticky = false,
    minWidth,
    backgroundColor,
    textColor,
    fontWeight,
  }: {
    field: SortField;
    children: React.ReactNode;
    sticky?: boolean;
    minWidth?: number;
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: number;
  }) => (
    <TableCell
      align="right"
      sx={{
        fontWeight: fontWeight ?? 600,
        position: sticky ? "sticky" : "static",
        left: sticky ? 0 : undefined,
        zIndex: sticky ? 3 : 1,
        backgroundColor: sticky
          ? theme.palette.background.paper
          : backgroundColor,
        minWidth: minWidth || 120,
        whiteSpace: "nowrap",
        color: textColor,
      }}
    >
      <TableSortLabel
        active={sortField === field}
        direction={sortField === field ? sortOrder : "asc"}
        onClick={() => handleSort(field)}
        sx={{
          "& .MuiTableSortLabel-icon": {
            opacity: sortField === field ? 1 : 0.3,
          },
          "&:hover .MuiTableSortLabel-icon": {
            opacity: 1,
          },
        }}
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
          <Alert severity="info" sx={{ "& .MuiAlert-message": { width: "100%" } }}>
            {period ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  所選期間 <strong>{period}</strong> 目前沒有資產負債表數據
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  請選擇其他期間或確認該期間是否已結帳
                </Typography>
              </Box>
            ) : (
              "目前沒有符合條件的數據"
            )}
          </Alert>
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
                  {/* 分組表頭 */}
                  <TableRow
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <TableCell
                      rowSpan={2}
                      sx={{
                        fontWeight: 600,
                        position: "sticky",
                        left: 0,
                        zIndex: 4,
                        backgroundColor: theme.palette.background.paper,
                        minWidth: 120,
                        verticalAlign: "bottom",
                      }}
                    >
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
                    <TableCell
                      align="center"
                      colSpan={3}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: assetHeaderColor,
                        color: "#FFFFFF",
                        verticalAlign: "bottom",
                      }}
                    >
                      資產類
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={2}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: liabilityHeaderColor,
                        color: "#FFFFFF",
                        verticalAlign: "bottom",
                      }}
                    >
                      負債類
                    </TableCell>
                    <TableCell
                      align="center"
                      colSpan={1}
                      sx={{
                        fontWeight: 600,
                        backgroundColor: equityHeaderColor,
                        color: "#FFFFFF",
                        verticalAlign: "bottom",
                      }}
                    >
                      權益類
                    </TableCell>
                  </TableRow>
                  {/* 詳細列標題 */}
                  <TableRow
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    {/* 資產類列 */}
                    <SortableHeader
                      field="accountsReceivable"
                      minWidth={130}
                      backgroundColor={cashFlowHeaderBg}
                      textColor={cashFlowHeaderText}
                    >
                      應收帳款
                    </SortableHeader>
                    <SortableHeader
                      field="cash"
                      minWidth={120}
                      backgroundColor={cashFlowHeaderBg}
                      textColor={cashFlowHeaderText}
                    >
                      現金
                    </SortableHeader>
                    <SortableHeader
                      field="totalAssets"
                      minWidth={140}
                      backgroundColor={cashFlowHeaderBg}
                      textColor={cashFlowHeaderText}
                    >
                      總資產
                    </SortableHeader>
                    {/* 負債類列 */}
                    <SortableHeader
                      field="accountsPayable"
                      minWidth={130}
                      backgroundColor={cashFlowHeaderBg}
                      textColor={cashFlowHeaderText}
                    >
                      應付帳款
                    </SortableHeader>
                    <SortableHeader
                      field="totalLiabilities"
                      minWidth={140}
                      backgroundColor={cashFlowHeaderBg}
                      textColor={cashFlowHeaderText}
                    >
                      總負債
                    </SortableHeader>
                    {/* 權益類列 */}
                    <SortableHeader
                      field="equity"
                      minWidth={140}
                      backgroundColor={cashFlowHeaderBg}
                      textColor={cashFlowHeaderText}
                    >
                      業主權益
                    </SortableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* 數據行 */}
                  {sortedDataRows.map((row) => (
                    <TableRow
                      key={row.accountingPeriod}
                      hover
                    >
                      <TableCell>
                        {row.accountingPeriod}
                      </TableCell>
                      {/* 資產類列 */}
                      <TableCell align="right">
                        <PlainCurrency value={row.accountsReceivable} showDecimal />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency value={row.cash} showDecimal />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency value={row.totalAssets} showDecimal />
                      </TableCell>
                      {/* 負債類列 */}
                      <TableCell align="right">
                        <PlainCurrency value={row.accountsPayable} showDecimal />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency value={row.totalLiabilities} showDecimal />
                      </TableCell>
                      {/* 權益類列 */}
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          color:
                            row.equity >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        <PlainCurrency value={row.equity} showDecimal />
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
                      <TableCell>
                        {summaryRow.accountingPeriod}
                      </TableCell>
                      {/* 資產類列 */}
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.accountsReceivable}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.cash}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalAssets}
                          showDecimal
                        />
                      </TableCell>
                      {/* 負債類列 */}
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.accountsPayable}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalLiabilities}
                          showDecimal
                        />
                      </TableCell>
                      {/* 權益類列 */}
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            summaryRow.equity >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        <PlainCurrency
                          value={summaryRow.equity}
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


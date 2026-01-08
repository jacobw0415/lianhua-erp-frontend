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
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import type {
  ComprehensiveIncomeStatementDto,
  ExpenseCategoryDetail,
} from "@/hooks/useComprehensiveIncomeStatement";
import { PlainCurrency } from "@/components/money/PlainCurrency";
import { getScrollbarStyles } from "@/utils/scrollbarStyles";
import { LoadingPlaceholder } from "@/components/common/LoadingPlaceholder";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface ComprehensiveIncomeStatementTableProps {
  data: ComprehensiveIncomeStatementDto[];
  loading: boolean;
  error: Error | null;
  onRetry: () => void;
}

type SortField =
  | "accountingPeriod"
  | "retailSales"
  | "orderSales"
  | "totalRevenue"
  | "costOfGoodsSold"
  | "grossProfit"
  | "totalOperatingExpenses"
  | "operatingProfit"
  | "netProfit"
  | "comprehensiveIncome";

type SortOrder = "asc" | "desc";

// 費用明細行組件
const ExpenseDetailsRow = ({
  expenseDetails,
}: {
  expenseDetails: ExpenseCategoryDetail[];
  period: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!expenseDetails || expenseDetails.length === 0) {
    return null;
  }

  return (
    <>
      <TableRow
        onClick={() => setExpanded(!expanded)}
        sx={{
          cursor: "pointer",
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.02)"
            : "rgba(0, 0, 0, 0.01)",
          "&:hover": {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.03)",
          },
        }}
      >
        <TableCell colSpan={10} sx={{ py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton size="small" onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              費用明細（共 {expenseDetails.length} 項）
            </Typography>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={10} sx={{ py: 0, border: 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, pl: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>類別名稱</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>會計代碼</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      金額
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      是否薪資
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {expenseDetails.map((expense) => (
                    <TableRow key={expense.categoryId} hover>
                      <TableCell>{expense.categoryName}</TableCell>
                      <TableCell>{expense.accountCode}</TableCell>
                      <TableCell align="right">
                        <PlainCurrency value={expense.amount} showDecimal />
                      </TableCell>
                      <TableCell align="center">
                        {expense.isSalary ? "是" : "否"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const ComprehensiveIncomeStatementTable = ({
  data,
  loading,
  error,
  onRetry,
}: ComprehensiveIncomeStatementTableProps) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [sortField, setSortField] = useState<SortField>("accountingPeriod");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 保存上一次的數據，避免加載時顯示骨架屏造成抖動
  const previousDataRef = useRef<ComprehensiveIncomeStatementDto[]>(data);
  const [displayData, setDisplayData] = useState<ComprehensiveIncomeStatementDto[]>(data);
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
  const effectiveData =
    loading && previousDataRef.current.length > 0 && !isFirstLoadRef.current && displayData.length > 0
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
  const getSortValue = (
    row: ComprehensiveIncomeStatementDto,
    field: SortField
  ): string | number => {
    switch (field) {
      case "accountingPeriod":
        return row.accountingPeriod;
      case "retailSales":
        return row.retailSales;
      case "orderSales":
        return row.orderSales;
      case "totalRevenue":
        return row.totalRevenue;
      case "costOfGoodsSold":
        return row.costOfGoodsSold;
      case "grossProfit":
        return row.grossProfit;
      case "totalOperatingExpenses":
        return row.totalOperatingExpenses;
      case "operatingProfit":
        return row.operatingProfit;
      case "netProfit":
        return row.netProfit;
      case "comprehensiveIncome":
        return row.comprehensiveIncome;
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
        ) : loading && effectiveData.length === 0 && isFirstLoadRef.current ? (
          // 初次載入且沒有資料時，顯示載入中效果
          <LoadingPlaceholder />
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
                    <SortableHeader field="retailSales">零售銷售</SortableHeader>
                    <SortableHeader field="orderSales">訂單銷售</SortableHeader>
                    <SortableHeader field="totalRevenue">營業收入</SortableHeader>
                    <SortableHeader field="costOfGoodsSold">營業成本</SortableHeader>
                    <SortableHeader field="grossProfit">毛利益</SortableHeader>
                    <SortableHeader field="totalOperatingExpenses">
                      營業費用
                    </SortableHeader>
                    <SortableHeader field="operatingProfit">營業利益</SortableHeader>
                    <SortableHeader field="netProfit">本期淨利</SortableHeader>
                    <SortableHeader field="comprehensiveIncome">
                      綜合損益
                    </SortableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* 數據行 */}
                  {sortedDataRows.map((row) => (
                    <React.Fragment key={row.accountingPeriod}>
                      <TableRow hover>
                        <TableCell>{row.accountingPeriod}</TableCell>
                        <TableCell align="right">
                          <PlainCurrency value={row.retailSales} showDecimal />
                        </TableCell>
                        <TableCell align="right">
                          <PlainCurrency value={row.orderSales} showDecimal />
                        </TableCell>
                        <TableCell align="right">
                          <PlainCurrency value={row.totalRevenue} showDecimal />
                        </TableCell>
                        <TableCell align="right">
                          <PlainCurrency
                            value={row.costOfGoodsSold}
                            showDecimal
                          />
                        </TableCell>
                        <TableCell align="right">
                          <PlainCurrency value={row.grossProfit} showDecimal />
                        </TableCell>
                        <TableCell align="right">
                          <PlainCurrency
                            value={row.totalOperatingExpenses}
                            showDecimal
                          />
                        </TableCell>
                        <TableCell align="right">
                          <PlainCurrency
                            value={row.operatingProfit}
                            showDecimal
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 600,
                            color:
                              row.netProfit >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          <PlainCurrency value={row.netProfit} showDecimal />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 600,
                            color:
                              row.comprehensiveIncome >= 0
                                ? "success.main"
                                : "error.main",
                          }}
                        >
                          <PlainCurrency
                            value={row.comprehensiveIncome}
                            showDecimal
                          />
                        </TableCell>
                      </TableRow>
                      {/* 費用明細（如果有） */}
                      {row.expenseDetails && row.expenseDetails.length > 0 && (
                        <ExpenseDetailsRow
                          expenseDetails={row.expenseDetails}
                          period={row.accountingPeriod}
                        />
                      )}
                    </React.Fragment>
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
                          value={summaryRow.retailSales}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.orderSales}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalRevenue}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.costOfGoodsSold}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.grossProfit}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.totalOperatingExpenses}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell align="right">
                        <PlainCurrency
                          value={summaryRow.operatingProfit}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            summaryRow.netProfit >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        <PlainCurrency
                          value={summaryRow.netProfit}
                          showDecimal
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            summaryRow.comprehensiveIncome >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        <PlainCurrency
                          value={summaryRow.comprehensiveIncome}
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


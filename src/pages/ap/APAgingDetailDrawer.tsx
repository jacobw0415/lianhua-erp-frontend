import { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Button,
  useTheme,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useDataProvider, useRedirect } from "react-admin";
import dayjs from "dayjs";

import { PlainCurrency } from "@/components/money/PlainCurrency";
import { getDrawerScrollableStyles } from "@/theme/LianhuaTheme";
import { useIsMobile, useIsSmallScreen } from "@/hooks/useIsMobile";

/* ================= 型別 ================= */

interface SupplierLite {
  supplierId: number;
  supplierName: string;
}

interface APAgingPurchaseRow {
  purchaseId: number;
  purchaseNo: string;
  purchaseDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  agingBucket: string;
}

interface APAgingDetailResponse {
  data: APAgingPurchaseRow[];
}

/* ================= Component ================= */

export const APAgingDetailDrawer = ({
  open,
  onClose,
  supplier,
}: {
  open: boolean;
  onClose: () => void;
  supplier?: SupplierLite;
}) => {
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();

  const [rows, setRows] = useState<APAgingPurchaseRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !supplier) return;

    setLoading(true);
    dataProvider
      .get(`ap/${supplier.supplierId}/purchases`)
      .then((res: APAgingDetailResponse) => {
        setRows(res.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [open, supplier, dataProvider]);

  return (
    <Drawer
      anchor={isSmallScreen ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isSmallScreen ? "100%" : { xs: "100%", sm: 750 },
          maxWidth: isSmallScreen ? "100%" : { xs: "100%", sm: 750 },
          ...(isSmallScreen && {
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }),
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 3 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            mb: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              {supplier?.supplierName} — 未付進貨明細
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ flexShrink: 0 }}
          >
            <CloseIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: { xs: 1.5, sm: 2 }, flexShrink: 0 }} />

        {/* ================= Content Area (Scrollable) ================= */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pr: { xs: 0.5, sm: 0 },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.palette.action.disabled,
            },
          }}
        >
          {/* Table */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              ...getDrawerScrollableStyles(theme, isMobile ? 300 : 260, true),
              overflowX: "auto",
              "&::-webkit-scrollbar": {
                height: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.divider,
                borderRadius: "4px",
              },
            }}
          >
            <Table
              stickyHeader
              size="small"
              sx={{
                tableLayout: { xs: "auto", sm: "fixed" },
                width: "100%",
                minWidth: { xs: "600px", sm: "auto" },
              }}
            >
              {/* ⭐ 關鍵：欄寬定義（僅桌面端） */}
              {!isMobile && (
                <colgroup>
                  <col style={{ width: 180 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 100 }} />
                </colgroup>
              )}

              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      padding: { xs: "6px 8px", sm: "8px 16px" },
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    進貨單號
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      padding: { xs: "6px 8px", sm: "8px 16px" },
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    日期
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      padding: { xs: "6px 8px", sm: "8px 16px" },
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    總金額
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      padding: { xs: "6px 8px", sm: "8px 16px" },
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    已付款
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      padding: { xs: "6px 8px", sm: "8px 16px" },
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    未付款
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      padding: { xs: "6px 8px", sm: "8px 16px" },
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    帳齡區間
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.purchaseId} hover>
                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px", sm: "16px" },
                      }}
                    >
                      <Button
                        variant="text"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          redirect(`/purchases/${row.purchaseId}`);
                        }}
                        sx={{
                          color: "primary.main",
                          fontWeight: 600,
                          textTransform: "none",
                          px: 0.5,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          minWidth: "auto",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {row.purchaseNo}
                      </Button>
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px", sm: "16px" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dayjs(row.purchaseDate).format("YYYY-MM-DD")}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px", sm: "16px" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      <PlainCurrency value={row.totalAmount} />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px", sm: "16px" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      <PlainCurrency value={row.paidAmount} />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px", sm: "16px" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      <PlainCurrency value={row.balance} />
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "8px", sm: "16px" },
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.agingBucket}
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && rows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        padding: { xs: "24px", sm: "32px" },
                        color: "text.secondary",
                      }}
                    >
                      無未付進貨單
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Drawer>
  );
};
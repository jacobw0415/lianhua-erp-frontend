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
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 750, p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            {supplier?.supplierName} — 未付進貨明細
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Table */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={getDrawerScrollableStyles(theme, 260, true)}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              tableLayout: "fixed",
              width: "100%",
            }}
          >
            {/* ⭐ 關鍵：欄寬定義 */}
            <colgroup>
              <col style={{ width: 180 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
            </colgroup>

            <TableHead>
              <TableRow>
                <TableCell>進貨單號</TableCell>
                <TableCell>日期</TableCell>
                <TableCell>總金額</TableCell>
                <TableCell>已付款</TableCell>
                <TableCell>未付款</TableCell>
                <TableCell>帳齡區間</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.purchaseId} hover>
                  <TableCell>
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
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {row.purchaseNo}
                    </Button>
                  </TableCell>

                  <TableCell>
                    {dayjs(row.purchaseDate).format("YYYY-MM-DD")}
                  </TableCell>

                  <TableCell>
                    <PlainCurrency value={row.totalAmount} />
                  </TableCell>

                  <TableCell>
                    <PlainCurrency value={row.paidAmount} />
                  </TableCell>

                  <TableCell>
                    <PlainCurrency value={row.balance} />
                  </TableCell>

                  <TableCell>{row.agingBucket}</TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    無未付進貨單
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Drawer>
  );
};
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

interface CustomerLite {
  customerId: number;
  customerName: string;
}

interface ARAgingOrderRow {
  orderId: number;
  orderNo: string;
  orderDate: string;
  totalAmount: number;
  receivedAmount: number;
  balance: number;
  agingBucket: string;
}

interface ARAgingDetailResponse {
  data: ARAgingOrderRow[];
}

/* ================= Component ================= */

export const ARAgingDetailDrawer = ({
  open,
  onClose,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  customer?: CustomerLite;
}) => {
  const dataProvider = useDataProvider();
  const redirect = useRedirect();
  const theme = useTheme();

  const [rows, setRows] = useState<ARAgingOrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customer) return;

    setLoading(true);
    dataProvider
      .get(`ar/${customer.customerId}/orders`)
      .then((res: ARAgingDetailResponse) => {
        setRows(res.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [open, customer, dataProvider]);

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
            {customer?.customerName} — 未收訂單明細
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
                <TableCell>訂單編號</TableCell>
                <TableCell>日期</TableCell>
                <TableCell>總金額</TableCell>
                <TableCell>已收款</TableCell>
                <TableCell>未收款</TableCell>
                <TableCell>帳齡區間</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.orderId} hover>
                  <TableCell>
                    <Button
                      variant="text"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        redirect(`/orders/${row.orderId}`);
                      }}
                      sx={{
                        color: "primary.main",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 0.5,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {row.orderNo}
                    </Button>
                  </TableCell>

                  <TableCell>
                    {dayjs(row.orderDate).format("YYYY-MM-DD")}
                  </TableCell>

                  <TableCell>
                    <PlainCurrency value={row.totalAmount} />
                  </TableCell>

                  <TableCell>
                    <PlainCurrency value={row.receivedAmount} />
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
                    無未收訂單
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


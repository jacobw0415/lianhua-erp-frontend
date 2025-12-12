import React, { useEffect, useState } from "react";
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
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useDataProvider, useRedirect } from "react-admin";
import dayjs from "dayjs";

import { PlainCurrency } from "@/components/money/PlainCurrency";

export const APAgingDetailDrawer = ({
  open,
  onClose,
  supplier,
}: {
  open: boolean;
  onClose: () => void;
  supplier: any;
}) => {
  const dataProvider = useDataProvider();
  const redirect = useRedirect();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !supplier) return;

    setLoading(true);
    dataProvider
      .get(`ap/${supplier.supplierId}/purchases`)
      .then((res: any) => setRows(res.data || []))
      .finally(() => setLoading(false));
  }, [open, supplier, dataProvider]);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 750, p: 3 }}>
        {/* ================= Header ================= */}
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

        {/* ================= Table (Sticky Header + Scroll) ================= */}
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            maxHeight: 260,          // ⭐ 約 3 筆後開始捲動
            overflowY: "auto",
            scrollbarGutter: "stable",
          }}
        >
          <Table stickyHeader size="small">
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
              {rows.map((row, i) => (
                <TableRow key={i} hover>
                  {/* 採購單號（可點擊） */}
                  <TableCell>
                    <Typography
                      sx={{
                        color: "primary.main",
                        cursor: "pointer",
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() =>
                        redirect(`/purchases/${row.purchaseId}`)
                      }
                    >
                      #{row.purchaseId}
                    </Typography>
                  </TableCell>

                  {/* 日期格式統一 */}
                  <TableCell>
                    {dayjs(row.purchaseDate).format("YYYY-MM-DD")}
                  </TableCell>

                  {/* 金額欄位（正確用法：PlainCurrency） */}
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
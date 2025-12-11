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
import { useDataProvider } from "react-admin";
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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">
            {supplier?.supplierName} — 未付進貨明細
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* MUI Table, 無 React-Admin 元件 */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>採購單</TableCell>
                <TableCell>日期</TableCell>
                <TableCell>總金額</TableCell>
                <TableCell>已付款</TableCell>
                <TableCell>未付款</TableCell>
                <TableCell>帳齡區間</TableCell>
                <TableCell>逾期天數</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>#{row.purchaseId}</TableCell>
                  <TableCell>{row.purchaseDate}</TableCell>
                  <TableCell><PlainCurrency value={row.totalAmount} /></TableCell>
                  <TableCell><PlainCurrency value={row.paidAmount} /></TableCell>
                  <TableCell><PlainCurrency value={row.balance} /></TableCell>
                  <TableCell>{row.agingBucket}</TableCell>
                  <TableCell>{row.daysOverdue}</TableCell>
                </TableRow>
              ))}

              {rows.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Chip,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  RecordContextProvider,
} from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";

/* =========================================================
 * 型別定義
 * ========================================================= */

interface PaymentRow {
  amount: number;
  payDate: string;
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  note?: string;
}

interface PurchaseDetailRow {
  id: number;
  item: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
  note?: string;
}

type PurchaseStatus = "PENDING" | "PARTIAL" | "PAID";

interface PurchaseDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  purchase?: {
    purchaseNo: string;
    supplierName: string;
    purchaseDate: string;
    status: PurchaseStatus;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    details?: PurchaseDetailRow[];
    payments?: PaymentRow[];
  };
}

/* =========================================================
 * 狀態顯示設定
 * ========================================================= */

const statusConfig: Record<
  PurchaseStatus,
  { label: string; color: "default" | "warning" | "success" }
> = {
  PENDING: { label: "未付款", color: "default" },
  PARTIAL: { label: "部分付款", color: "warning" },
  PAID: { label: "已付款", color: "success" },
};

/* =========================================================
 * Component
 * ========================================================= */

export const PurchaseDetailDrawer: React.FC<PurchaseDetailDrawerProps> = ({
  open,
  onClose,
  purchase,
}) => {
  if (!purchase) return null;

  const {
    supplierName,
    purchaseNo,
    purchaseDate,
    status,
    totalAmount,
    paidAmount,
    details = [],
    payments = [],
  } = purchase;

  const totalQty = details.reduce((sum, d) => sum + d.qty, 0);
  const detailTotalAmount = details.reduce(
    (sum, d) => sum + d.totalAmount,
    0
  );

  const progress =
    totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;

  const statusMeta = statusConfig[status];
  const enablePaymentScroll = payments.length > 3;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 560 } }}
    >
      <Box p={2}>
        {/* ================= Header ================= */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            📦 進貨明細 — {supplierName}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box display="flex" justifyContent="space-between" mt={1}>
          <Chip
            size="small"
            label={statusMeta.label}
            color={statusMeta.color}
            sx={{ fontWeight: 600 }}
          />
          <RecordContextProvider value={purchase}>
            <Typography color="success.main" fontWeight={700}>
              總金額：<CurrencyField source="totalAmount" />
            </Typography>
          </RecordContextProvider>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ================= 單據資訊（UI 強化） ================= */}
        <Paper
          variant="outlined"
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "background.default",
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="caption" color="text.secondary">
                進貨單號
              </Typography>
              <Typography fontWeight={600}>
                {purchaseNo}
              </Typography>
            </Box>

            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                進貨日期
              </Typography>
              <Typography fontWeight={600}>
                {purchaseDate}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* ================= 付款進度 ================= */}
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary">
            付款進度
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 0.5,
              height: 10,
              borderRadius: 5,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ================= 進貨項目明細 ================= */}
        {details.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              📄 進貨項目明細
            </Typography>

            <Datagrid data={details} bulkActionButtons={false} rowClick={false}>
              <TextField source="item" label="品項" />
              <NumberField source="qty" label="數量" />
              <CurrencyField source="unitPrice" label="單價" />
              <CurrencyField source="totalAmount" label="小計" />
              <TextField source="note" label="備註" />
            </Datagrid>

            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">
                總數量：{totalQty}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                明細合計：NT${detailTotalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* ================= 已付款紀錄 ================= */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            💰 已付款紀錄
          </Typography>

          {payments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              尚未有付款紀錄
            </Typography>
          ) : (
            <Box
              sx={{
                maxHeight: enablePaymentScroll ? 180 : "auto",
                overflowY: enablePaymentScroll ? "auto" : "visible",
              }}
            >
              <Datagrid data={payments} bulkActionButtons={false} rowClick={false}>
                <DateField source="payDate" label="付款日期" />
                <CurrencyField source="amount" label="金額" />
                <TextField source="method" label="方式" />
                <TextField source="note" label="備註" />
              </Datagrid>
            </Box>
          )}
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* ================= 金額摘要（UI 強化） ================= */}
        <RecordContextProvider value={purchase}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Box display="flex" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  已付款
                </Typography>
                <Typography
                  fontWeight={700}
                  fontSize={18}
                  color="success.main"
                >
                  <CurrencyField source="paidAmount" />
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  尚欠款
                </Typography>
                <Typography
                  fontWeight={700}
                  fontSize={18}
                  color="error.main"
                >
                  <CurrencyField source="balance" />
                </Typography>
              </Box>
            </Box>
          </Paper>
        </RecordContextProvider>
      </Box>
    </Drawer>
  );
};

import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  RecordContextProvider,
  useDataProvider,
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

interface OrderDetailRow {
  id: number;
  productId: number;
  productName: string;
  qty: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OrderDetailResponse {
  data:
    | OrderDetailRow[]
    | { content: OrderDetailRow[]; totalElements?: number };
}

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

interface OrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  order?: {
    orderNo: string;
    id: number;
    customerName: string;
    orderDate: string;
    deliveryDate?: string;
    status: OrderStatus;
    totalAmount: number;
    paidAmount?: number;
    balance?: number;
    note?: string;
    payments?: PaymentRow[];
  };
}

/* =========================================================
 * 狀態顯示設定
 * ========================================================= */

const statusConfig: Record<
  OrderStatus,
  { label: string; color: "default" | "primary" | "info" | "success" | "error" }
> = {
  PENDING: { label: "待處理", color: "default" },
  CONFIRMED: { label: "已確認", color: "primary" },
  SHIPPED: { label: "已出貨", color: "info" },
  COMPLETED: { label: "已完成", color: "success" },
  CANCELLED: { label: "已取消", color: "error" },
};

/* =========================================================
 * Component
 * ========================================================= */

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  open,
  onClose,
  order,
}) => {
  const dataProvider = useDataProvider();
  const [details, setDetails] = useState<OrderDetailRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !order?.id) {
      setDetails([]);
      return;
    }

    setLoading(true);
    const apiPath = `orders/${order.id}/items`;
    dataProvider
      .get(apiPath)
      .then((res: OrderDetailResponse) => {
        let content: OrderDetailRow[] = [];
        if (Array.isArray(res.data)) {
          content = res.data;
        } else if (
          res.data &&
          typeof res.data === "object" &&
          "content" in res.data
        ) {
          content = (res.data as { content: OrderDetailRow[] }).content ?? [];
        }
        console.log("Order details fetched:", {
          apiPath,
          contentLength: content.length,
          content,
        });
        setDetails(content);
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch order details from:", apiPath, error);
        setDetails([]);
      })
      .finally(() => setLoading(false));
  }, [open, order?.id, dataProvider]);

  if (!order) return null;

  const {
    orderNo,
    customerName,
    orderDate,
    status,
    totalAmount,
    paidAmount = 0,
    payments = [],
  } = order;

  const totalQty = details.reduce((sum, d) => sum + d.qty, 0);
  const detailTotalAmount = details.reduce((sum, d) => sum + d.subtotal, 0);

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
          <Typography variant="h6">📋 訂單明細 — {customerName}</Typography>
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
          <RecordContextProvider value={order}>
            <Typography color="success.main" fontWeight={700}>
              總金額：
              <CurrencyField source="totalAmount" />
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
                訂單編號
              </Typography>
              <Typography fontWeight={600}>{orderNo}</Typography>
            </Box>

            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                訂單日期
              </Typography>
              <Typography fontWeight={600}>{orderDate}</Typography>
            </Box>
          </Box>
        </Paper>

        {/* ================= 收款進度 ================= */}
        <Box mb={2}>
          <Typography variant="caption" color="text.secondary">
            收款進度
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

        {/* ================= 訂單項目明細 ================= */}
        {loading ? (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={100}
            >
              <CircularProgress size={24} />
            </Box>
          </Paper>
        ) : details.length > 0 ? (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              📄 訂單項目明細
            </Typography>

            <Datagrid data={details} bulkActionButtons={false} rowClick={false}>
              <TextField source="productName" label="品項" />
              <NumberField
                source="qty"
                label="數量"
                textAlign="left"
                options={{ minimumFractionDigits: 0 }}
              />
              <CurrencyField source="unitPrice" label="單價" />
              <CurrencyField source="subtotal" label="小計" />
              <TextField source="note" label="備註" />
            </Datagrid>

            <Divider sx={{ my: 1 }} />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">總數量：{totalQty}</Typography>
              <Typography variant="body2" fontWeight={600}>
                明細合計：NT${detailTotalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              尚無訂單項目明細
            </Typography>
          </Paper>
        )}

        {/* ================= 已收款紀錄 ================= */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            💰 已收款紀錄
          </Typography>

          {payments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              尚未有收款紀錄
            </Typography>
          ) : (
            <Box
              sx={{
                maxHeight: enablePaymentScroll ? 180 : "auto",
                overflowY: enablePaymentScroll ? "auto" : "visible",
              }}
            >
              <Datagrid
                data={payments}
                bulkActionButtons={false}
                rowClick={false}
              >
                <DateField source="payDate" label="收款日期" />
                <CurrencyField source="amount" label="金額" />
                <TextField source="method" label="方式" />
                <TextField source="note" label="備註" />
              </Datagrid>
            </Box>
          )}
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* ================= 金額摘要（UI 強化） ================= */}
        <RecordContextProvider value={order}>
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
                  已收款
                </Typography>
                <Typography fontWeight={700} fontSize={18} color="success.main">
                  <CurrencyField source="paidAmount" />
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  尚欠款
                </Typography>
                <Typography fontWeight={700} fontSize={18} color="error.main">
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

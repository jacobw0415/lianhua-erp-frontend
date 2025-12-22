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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import {
  Datagrid,
  TextField,
  NumberField,
  RecordContextProvider,
  useDataProvider,
  useNotify,
} from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";

/* =========================================================
 * 型別定義
 * ========================================================= */

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

// 與 OrderList / OrderEdit 對齊
type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

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
    paymentStatus?: PaymentStatus;
    note?: string;
  };
}

/* =========================================================
 * 狀態顯示設定
 * ========================================================= */

const statusConfig: Record<
  OrderStatus,
  { label: string; color: "default" | "primary" | "info" | "success" | "error" }
> = {
  PENDING: { label: "待確認", color: "default" },
  CONFIRMED: { label: "已確認", color: "primary" },
  DELIVERED: { label: "已交付", color: "info" },
  CANCELLED: { label: "已取消", color: "error" },
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  UNPAID: "未收款",
  PARTIAL: "部分收款",
  PAID: "已全額收款",
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
  const notify = useNotify();
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
        notify("載入訂單明細失敗，請稍後再試。", { type: "error" });
      })
      .finally(() => setLoading(false));
  }, [open, order?.id, dataProvider, notify]);

  if (!order) return null;

  const {
    orderNo,
    customerName,
    orderDate,
    status,
    paymentStatus,
  } = order;

  const totalQty = details.reduce((sum, d) => sum + d.qty, 0);
  const detailTotalAmount = details.reduce((sum, d) => sum + d.subtotal, 0);

  const statusMeta = statusConfig[status];

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
          <Box display="flex" gap={1}>
            <Chip
              size="small"
              label={statusMeta.label}
              color={statusMeta.color}
              sx={{ fontWeight: 600 }}
            />
            {paymentStatus && (
              <Chip
                size="small"
                label={paymentStatusLabel[paymentStatus]}
                color={
                  paymentStatus === "PAID"
                    ? "success"
                    : paymentStatus === "PARTIAL"
                      ? "warning"
                      : "default"
                }
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
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
      </Box>
    </Drawer>
  );
};

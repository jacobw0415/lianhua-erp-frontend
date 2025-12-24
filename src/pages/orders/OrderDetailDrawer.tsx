import React, { useEffect, useState, useMemo } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Chip,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";

import {
  Datagrid,
  TextField,
  NumberField,
  useDataProvider,
  useNotify,
  useRefresh,
  useRedirect,
  RecordContextProvider,
} from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";
import { ReceiptStatusField } from "@/components/common/ReceiptStatusField";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

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

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
type ReceiptStatus = "ACTIVE" | "VOIDED";
type ReceiptMethod = "CASH" | "TRANSFER" | "CARD" | "CHECK" | "SYSTEM_AUTO";

interface ReceiptItem {
  id: number;
  receivedDate: string;
  amount: number;
  method: ReceiptMethod;
  status?: ReceiptStatus;
  note?: string;
}

interface ReceiptListResponse {
  data: ReceiptItem[] | { content: ReceiptItem[]; totalElements?: number };
}

const receiptMethodMap: Record<ReceiptMethod, string> = {
  CASH: "現金",
  TRANSFER: "轉帳",
  CARD: "刷卡",
  CHECK: "支票",
  SYSTEM_AUTO: "系統產生",
};

interface OrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  order?: {
    id: number;
    orderNo: string;
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
  const refresh = useRefresh();
  const redirect = useRedirect();
  const { showAlert } = useGlobalAlert();

  const [details, setDetails] = useState<OrderDetailRow[]>([]);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  const [openVoidConfirm, setOpenVoidConfirm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(
    null
  );
  const [voiding, setVoiding] = useState(false);

  /* ================= 訂單明細 ================= */
  useEffect(() => {
    if (!open || !order?.id) return;

    setLoading(true);

    dataProvider
      .get(`orders/${order.id}/items`, { meta: { includeVoided: true } })
      .then((res: OrderDetailResponse) => {
        const content = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        setDetails(content);
      })
      .catch(() => {
        setDetails([]);
        notify("載入訂單明細失敗", { type: "error" });
      })
      .finally(() => setLoading(false));
  }, [open, order?.id]);

  /* ================= 收款紀錄 ================= */
  useEffect(() => {
    if (!open || !order?.orderNo) return;

    setReceiptsLoading(true);

    dataProvider
      .getList("receipts", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "receivedDate", order: "DESC" },
        filter: { orderNo: order.orderNo, includeVoided: true },
      })
      .then((res: ReceiptListResponse) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        setReceipts(list);
      })
      .finally(() => setReceiptsLoading(false));
  }, [open, order?.orderNo]);

  const hasVoidedReceipts = useMemo(() => {
    if (!receipts || receipts.length === 0) return false;
    return receipts.some((r) => {
      const status = r?.status?.toUpperCase();
      return status === "VOIDED";
    });
  }, [receipts]);

  // 計算實際付款狀態：如果有作廢的收款記錄，表示曾經付款過，應該顯示為 PAID
  const displayPaymentStatus = useMemo(() => {
    const currentStatus = order?.paymentStatus || "UNPAID";
    // 如果有作廢的收款記錄，且當前狀態不是 PAID，則強制顯示為 PAID
    if (hasVoidedReceipts && currentStatus !== "PAID") {
      return "PAID";
    }
    return currentStatus;
  }, [order?.paymentStatus, hasVoidedReceipts]);

  const handleVoidReceipt = async () => {
    if (!selectedReceipt) return;

    try {
      setVoiding(true);

      await dataProvider.update("receipts", {
        id: selectedReceipt.id,
        data: {},
        previousData: selectedReceipt,
        meta: { endpoint: "void" },
      });

      showAlert({
        title: "作廢成功",
        message: "收款已成功作廢",
        severity: "success",
        hideCancel: true,
      });

      setOpenVoidConfirm(false);
      setSelectedReceipt(null);
      refresh();

      // 關閉 Drawer 並重定向到訂單列表
      onClose();
      setTimeout(() => {
        redirect("list", "orders");
      }, 100);
    } catch {
      showAlert({
        title: "作廢失敗",
        message: "作廢操作失敗，請稍後再試",
        severity: "error",
        hideCancel: true,
      });
    } finally {
      setVoiding(false);
    }
  };

  if (!order) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 560 } }}
    >
      <Box p={2}>
        {/* ================= Header ================= */}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">
            📋 訂單明細 — {order.customerName}
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* ================= Chips ================= */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Box display="flex" gap={1}>
            <Chip
              size="small"
              label={statusConfig[order.status].label}
              color={statusConfig[order.status].color}
              sx={{ fontWeight: 600 }}
            />
            <Chip
              size="small"
              label={paymentStatusLabel[displayPaymentStatus]}
              color={displayPaymentStatus === "PAID" ? "success" : "default"}
              sx={{ fontWeight: 600 }}
            />
            {hasVoidedReceipts && (
              <Chip
                size="small"
                label="含作廢收款"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
          <RecordContextProvider value={order}>
            <Typography color="success.main" fontWeight={700}>
              總金額：<CurrencyField source="totalAmount" />
            </Typography>
          </RecordContextProvider>
        </Box>

        {/* ======== 訂單編號 / 訂單日期（加回來的區塊） ======== */}
        <Paper
          variant="outlined"
          sx={{ mt: 2, mb: 1.5, p: 1.5, borderRadius: 2 }}
        >
          <Box display="flex" justifyContent="space-between">
            <Box>
              <Typography variant="caption" color="text.secondary">
                訂單編號
              </Typography>
              <Typography fontWeight={600}>
                {order.orderNo}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">
                訂單日期
              </Typography>
              <Typography fontWeight={600}>
                {order.orderDate}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* ================= 訂單項目 ================= */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            📄 訂單項目
          </Typography>

          {loading ? (
            <CircularProgress size={24} />
          ) : details.length > 0 ? (
            <>
              <Box
                sx={{
                  maxHeight: details.length > 4 ? 200 : "auto",
                  overflowY: details.length > 4 ? "auto" : "visible",
                }}
              >
                <Datagrid data={details} bulkActionButtons={false} rowClick={false}>
                  <TextField source="productName" label="品項" />
                  <NumberField source="qty" label="數量" />
                  <CurrencyField source="unitPrice" label="單價" />
                  <CurrencyField source="subtotal" label="小計" />
                </Datagrid>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">
                  總數量：{details.reduce((sum, d) => sum + (d.qty || 0), 0)}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  明細合計：NT${details.reduce((sum, d) => sum + (d.subtotal || 0), 0).toLocaleString()}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              尚無訂單項目
            </Typography>
          )}
        </Paper>

        {/* ================= 收款紀錄 ================= */}
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            💰 收款紀錄
          </Typography>

          {receiptsLoading ? (
            <CircularProgress size={24} />
          ) : receipts.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>日期</TableCell>
                  <TableCell align="right">金額</TableCell>
                  <TableCell>方式</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell align="center">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.receivedDate}</TableCell>
                    <TableCell align="right">
                      NT${r.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{receiptMethodMap[r.method]}</TableCell>
                    <TableCell>
                      <ReceiptStatusField record={r} />
                    </TableCell>
                    <TableCell align="center">
                      {r.status !== "VOIDED" && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => {
                            setSelectedReceipt(r);
                            setOpenVoidConfirm(true);
                          }}
                          disabled={voiding}
                        >
                          作廢
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body2" color="text.secondary">
              尚無收款記錄
            </Typography>
          )}
        </Paper>
      </Box>

      <GlobalAlertDialog
        open={openVoidConfirm}
        title="確認作廢"
        description="確定要作廢此筆收款嗎？此操作無法復原。"
        severity="warning"
        confirmLabel="確認作廢"
        cancelLabel="取消"
        onClose={() => {
          setOpenVoidConfirm(false);
          setSelectedReceipt(null);
        }}
        onConfirm={handleVoidReceipt}
      />
    </Drawer>
  );
};

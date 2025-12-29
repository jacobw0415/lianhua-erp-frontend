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
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";

import {
  Datagrid,
  TextField,
  NumberField,
  useDataProvider,
  useNotify,
  useRefresh,
  useRedirect,
  RecordContextProvider,
  useUpdate,
} from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";
import { ReceiptStatusField } from "@/components/common/ReceiptStatusField";
import { VoidReasonDialog } from "@/components/common/VoidReasonDialog";
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
  voidReason?: string;
  voidedAt?: string;
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
  const [update, { isLoading: isVoiding }] = useUpdate();

  const [details, setDetails] = useState<OrderDetailRow[]>([]);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [receiptsLoading, setReceiptsLoading] = useState(false);

  const [openVoidConfirm, setOpenVoidConfirm] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptItem | null>(
    null
  );

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

  // ⭐ 直接使用後端計算的 paymentStatus
  // 後端已在 OrderServiceImpl.calculatePaymentStatus() 中處理了所有邏輯：
  // - 計算有效收款金額（排除已作廢的收款）
  // - 如果訂單曾經有收款記錄（包括已作廢的），即使現在有效收款為0，也保持 PAID 狀態
  // - 根據收款金額和訂單總金額計算付款狀態（UNPAID, PARTIAL, PAID）
  const displayPaymentStatus = order?.paymentStatus || "UNPAID";

  // 計算已作廢收款總金額
  const voidedReceiptsTotal = useMemo(() => {
    if (!receipts || receipts.length === 0) return 0;
    return receipts
      .filter((r) => {
        const status = r?.status?.toUpperCase();
        return status === "VOIDED";
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [receipts]);

  // 計算有效收款金額（排除已作廢的收款）
  const validReceiptsTotal = useMemo(() => {
    if (!receipts || receipts.length === 0) return 0;
    return receipts
      .filter((r) => {
        const status = r?.status?.toUpperCase();
        return status !== "VOIDED";
      })
      .reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [receipts]);

  // 計算餘額
  const balance = useMemo(() => {
    if (!order?.totalAmount) return 0;
    return Math.max(0, order.totalAmount - validReceiptsTotal);
  }, [order?.totalAmount, validReceiptsTotal]);

  // 判斷是否為"被作廢的已收款訂單"（有已作廢收款且原本應為已收款狀態）
  const isVoidedPaidOrder = hasVoidedReceipts && displayPaymentStatus === "PAID";

  // 判斷是否為"已交付已全額收款"的訂單（不顯示金額摘要）
  const isDeliveredAndPaid = order?.status === "DELIVERED" && displayPaymentStatus === "PAID" && !isVoidedPaidOrder;

  // 獲取第一個有效的收款記錄（用於作廢按鈕）
  const firstActiveReceipt = useMemo(() => {
    if (!receipts || receipts.length === 0) return null;
    return receipts.find((r) => {
      const status = r?.status?.toUpperCase();
      return status !== "VOIDED";
    }) || null;
  }, [receipts]);

  // 判斷是否有有效的收款記錄（用於顯示作廢按鈕）
  const hasActiveReceipts = firstActiveReceipt !== null;

  // 獲取已作廢收款的作廢原因（取第一個已作廢收款的 voidReason）
  const voidedReceiptReason = useMemo(() => {
    if (!receipts || receipts.length === 0) return null;
    const voidedReceipt = receipts.find((r) => {
      const status = r?.status?.toUpperCase();
      return status === "VOIDED";
    });
    return voidedReceipt?.voidReason || null;
  }, [receipts]);

  // 獲取已作廢收款的作廢時間（取第一個已作廢收款的 voidedAt）
  const voidedReceiptTime = useMemo(() => {
    if (!receipts || receipts.length === 0) return null;
    const voidedReceipt = receipts.find((r) => {
      const status = r?.status?.toUpperCase();
      return status === "VOIDED";
    });
    return voidedReceipt?.voidedAt || null;
  }, [receipts]);

  // 限制作廢原因的顯示長度（最多顯示 50 個字元）
  const displayVoidReason = useMemo(() => {
    if (!voidedReceiptReason) return null;
    const maxLength = 50;
    if (voidedReceiptReason.length > maxLength) {
      return voidedReceiptReason.substring(0, maxLength) + "...";
    }
    return voidedReceiptReason;
  }, [voidedReceiptReason]);

  const handleVoidReceipt = (reason?: string) => {
    if (!selectedReceipt) return;

    update(
      "receipts",
      {
        id: selectedReceipt.id,
        data: { reason },
        previousData: selectedReceipt,
        meta: { endpoint: "void" },
      },
      {
        onSuccess: () => {
          showAlert({
            title: "作廢成功",
            message: `訂單編號：（${order?.orderNo || ""}）已成功作廢`,
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
        },
        onError: (error) => {
          const errorMessage =
            (error as any)?.body?.message ||
            (error as any)?.message ||
            "作廢操作失敗，請稍後再試";
          showAlert({
            title: "作廢失敗",
            message: errorMessage,
            severity: "error",
            hideCancel: true,
          });
        },
      }
    );
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
                label="作廢"
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

        {/* 作廢資訊顯示 */}
        {isVoidedPaidOrder && (
          <Alert
            severity="error"
            sx={{
              mt: 2,
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Box sx={{ display: "flex", gap: 2, width: "100%", alignItems: "stretch" }}>
              {/* 左側：作廢資訊 */}
              <Box sx={{ flex: "0 0 auto", minWidth: 170, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography variant="body2" fontWeight={600}>
                  此訂單的收款記錄已作廢
                </Typography>
                {voidedReceiptTime && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    作廢時間：{voidedReceiptTime}
                  </Typography>
                )}
                {voidedReceiptsTotal > 0 && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    已作廢收款：NT${voidedReceiptsTotal.toLocaleString()}
                  </Typography>
                )}
              </Box>
              {/* 右側：作廢原因 */}
              {displayVoidReason && (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    py: 0,
                    px: 1,
                    bgcolor: "rgba(0, 0, 0, 0.05)",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.5 }}>
                    作廢原因
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 0,
                      wordBreak: "break-word",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {displayVoidReason}
                  </Typography>
                </Box>
              )}
            </Box>
          </Alert>
        )}

        {/* 作廢按鈕 - 只有在有有效收款紀錄時才能作廢 */}
        {!isVoidedPaidOrder && hasActiveReceipts && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="error"
              startIcon={<BlockIcon />}
              onClick={() => {
                if (firstActiveReceipt) {
                  setSelectedReceipt(firstActiveReceipt);
                  setOpenVoidConfirm(true);
                }
              }}
              disabled={isVoiding}
            >
              {isVoiding ? "處理中..." : "作廢訂單"}
            </Button>
          </Box>
        )}

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
                  maxHeight: details.length > 3 ? 140 : "auto",
                  overflowY: details.length > 3 ? "auto" : "visible",
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
        {!isVoidedPaidOrder && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
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
        )}

        {!isVoidedPaidOrder && !isDeliveredAndPaid && <Divider sx={{ my: 2 }} />}

        {/* ================= 金額摘要（UI 強化） ================= */}
        {!isDeliveredAndPaid && (
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
                <Typography
                  fontWeight={700}
                  fontSize={18}
                  color={isVoidedPaidOrder ? "text.secondary" : "success.main"}
                >
                  NT${validReceiptsTotal.toLocaleString()}
                </Typography>
                {isVoidedPaidOrder && voidedReceiptsTotal > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    （已作廢收款：NT${voidedReceiptsTotal.toLocaleString()}）
                  </Typography>
                )}
                {isVoidedPaidOrder && voidedReceiptsTotal === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    （作廢後所有收款已取消）
                  </Typography>
                )}
              </Box>

              <Box textAlign="right">
                <Typography variant="caption" color="text.secondary">
                  尚欠款
                </Typography>
                <Typography
                  fontWeight={700}
                  fontSize={18}
                  color={isVoidedPaidOrder ? "text.secondary" : "error.main"}
                >
                  NT${balance.toLocaleString()}
                </Typography>
                {isVoidedPaidOrder && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    （等於總金額）
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      <VoidReasonDialog
        open={openVoidConfirm}
        title="作廢收款"
        description="確定要作廢此筆收款嗎？此操作無法復原。"
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

import React, { useState, useMemo, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Chip,
  LinearProgress,
  CircularProgress,
  Button,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";

import {
  Datagrid,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  RecordContextProvider,
  useUpdate,
  useDataProvider,
  useNotify,
} from "react-admin";

import { CurrencyField } from "@/components/money/CurrencyField";
import { VoidReasonDialog } from "@/components/common/VoidReasonDialog";
import { PurchaseStatusField } from "@/components/common/PurchaseStatusField";
import { PaymentStatusField } from "@/components/common/PaymentStatusField";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

/* =========================================================
 * 型別定義
 * ========================================================= */

interface PaymentRow {
  amount: number;
  payDate: string;
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  note?: string;
  status?: "ACTIVE" | "VOIDED";
  voidedAt?: string;
  voidReason?: string;
}

interface PurchaseItemRow {
  id: number;
  purchaseId: number;
  item: string;
  unit: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  note?: string;
}

interface PurchaseItemsResponse {
  data: PurchaseItemRow[] | { content: PurchaseItemRow[] };
}

type PurchaseStatus = "PENDING" | "PARTIAL" | "PAID";

interface PurchaseDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  purchase?: {
    id?: number;
    purchaseNo: string;
    supplierName: string;
    purchaseDate: string;
    status: PurchaseStatus;
    totalAmount: number;
    paidAmount: number;
    balance: number;
    recordStatus?: "ACTIVE" | "VOIDED";
    voidedAt?: string;
    voidReason?: string;
    items?: PurchaseItemRow[];
    payments?: PaymentRow[];
  };
  onRefresh?: () => void;
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
  onRefresh,
}) => {
  const [openVoidDialog, setOpenVoidDialog] = useState(false);
  const [update, { isLoading: isVoiding }] = useUpdate();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { showAlert } = useGlobalAlert();
  const [items, setItems] = useState<PurchaseItemRow[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // 確保所有 hooks 都在早期返回之前調用
  const payments = purchase?.payments || [];

  /* ================= 進貨項目明細 ================= */
  useEffect(() => {
    if (!open || !purchase?.id) return;

    setItemsLoading(true);

    dataProvider
      .get(`purchases/${purchase.id}/items`, { meta: { includeVoided: true } })
      .then((res: PurchaseItemsResponse) => {
        const content = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        setItems(content);
      })
      .catch(() => {
        setItems([]);
        notify("載入進貨項目明細失敗", { type: "error" });
      })
      .finally(() => setItemsLoading(false));
  }, [open, purchase?.id, dataProvider, notify]);

  // 計算已作廢付款的總金額
  const voidedPaymentsTotal = useMemo(() => {
    if (!payments || payments.length === 0) return 0;
    return payments
      .filter((p) => {
        const status = p?.status?.toUpperCase();
        return status === "VOIDED";
      })
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments]);

  // 獲取已作廢付款的作廢原因（取第一個已作廢付款的 voidReason）
  const voidedPaymentReason = useMemo(() => {
    if (!payments || payments.length === 0) return null;
    const voidedPayment = payments.find((p) => {
      const status = p?.status?.toUpperCase();
      return status === "VOIDED";
    });
    return voidedPayment?.voidReason || null;
  }, [payments]);

  // 優先使用進貨單本身的作廢原因，如果沒有則使用已作廢付款的作廢原因
  const voidReasonToDisplay = purchase?.voidReason || voidedPaymentReason;

  // 限制作廢原因的顯示長度（最多顯示 50 個字元）
  const displayVoidReason = useMemo(() => {
    if (!voidReasonToDisplay) return null;
    const maxLength = 50;
    if (voidReasonToDisplay.length > maxLength) {
      return voidReasonToDisplay.substring(0, maxLength) + "...";
    }
    return voidReasonToDisplay;
  }, [voidReasonToDisplay]);

  if (!purchase) return null;

  const {
    id,
    supplierName,
    purchaseNo,
    purchaseDate,
    status,
    totalAmount,
    paidAmount,
    recordStatus,
    voidedAt,
  } = purchase;

  const isVoided = recordStatus === "VOIDED";

  // 檢查是否有付款紀錄（至少有一筆付款紀錄才能作廢）
  const hasPayments = payments && payments.length > 0;

  const progress =
    totalAmount > 0 ? Math.min((paidAmount / totalAmount) * 100, 100) : 0;

  const statusMeta = statusConfig[status];
  const enablePaymentScroll = payments.length > 3;

  const handleVoid = (reason?: string) => {
    if (!id) {
      notify("無法取得進貨單 ID", { type: "error" });
      return;
    }

    update(
      "purchases",
      {
        id,
        data: { reason },
        meta: { endpoint: "void" },
      },
      {
        onSuccess: () => {
          showAlert({
            title: "作廢成功",
            message: `進貨單編號：（${purchase?.purchaseNo || ""}）已成功作廢`,
            severity: "success",
            hideCancel: true,
          });

          setOpenVoidDialog(false);
          // 重新載入資料
          if (onRefresh) {
            onRefresh();
          } else {
            // 如果沒有提供 onRefresh，則重新取得資料
            dataProvider
              .getOne("purchases", { id })
              .then(() => {
                // 可以通過 callback 更新父組件的資料
              })
              .catch(() => {
                // 錯誤處理
              });
          }
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

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Box display="flex" gap={1} alignItems="center">
            <Chip
              size="small"
              label={statusMeta.label}
              color={statusMeta.color}
              sx={{ fontWeight: 600 }}
            />
            {recordStatus && (
              <PurchaseStatusField
                source="recordStatus"
                record={purchase}
              />
            )}
          </Box>
          <RecordContextProvider value={purchase}>
            <Typography color="success.main" fontWeight={700}>
              總金額：<CurrencyField source="totalAmount" />
            </Typography>
          </RecordContextProvider>
        </Box>

        {/* 作廢資訊顯示 */}
        {isVoided && (
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
                  此進貨單已作廢
                </Typography>
                {voidedAt && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    作廢時間：{voidedAt}
                  </Typography>
                )}
                {voidedPaymentsTotal > 0 && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    已作廢付款：NT${voidedPaymentsTotal.toLocaleString()}
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
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    overflow: "hidden",
                  }}
                >
                  <Typography variant="body2" fontWeight={600} color="text.secondary" display="block" sx={{ lineHeight: 1.3, mb: 0.5 }}>
                    作廢原因
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.3,
                    }}
                  >
                    {displayVoidReason}
                  </Typography>
                </Box>
              )}
            </Box>
          </Alert>
        )}

        {/* 作廢按鈕 - 只有在有付款紀錄時才能作廢 */}
        {!isVoided && id && hasPayments && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="error"
              startIcon={<BlockIcon />}
              onClick={() => setOpenVoidDialog(true)}
              disabled={isVoiding}
            >
              {isVoiding ? "處理中..." : "作廢進貨單"}
            </Button>
          </Box>
        )}

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
        {!isVoided && (
          <>
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
          </>
        )}

        {/* ================= 進貨項目明細 ================= */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            📄 進貨項目明細
          </Typography>

          {itemsLoading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : items.length > 0 ? (
            <>
              <Box
                sx={{
                  maxHeight: items.length > 3 ? 200 : "auto",
                  overflowY: items.length > 3 ? "auto" : "visible",
                }}
              >
                <Datagrid data={items} bulkActionButtons={false} rowClick={false}>
                  <TextField source="item" label="品項" />
                  <NumberField source="qty" label="數量" />
                  <TextField source="unit" label="單位" />
                  <CurrencyField source="unitPrice" label="單價" />
                  <CurrencyField source="subtotal" label="小計" />
                </Datagrid>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2">
                  總數量：{items.reduce((sum, d) => sum + (d.qty || 0), 0)}
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  明細合計：NT${Math.round(
                    items.reduce((sum, d) => sum + (d.subtotal || 0), 0)
                  ).toLocaleString()}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              尚無進貨項目
            </Typography>
          )}
        </Paper>

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
                maxHeight: enablePaymentScroll ? 150 : "auto",
                overflowY: enablePaymentScroll ? "auto" : "visible",
              }}
            >
              <Datagrid data={payments} bulkActionButtons={false} rowClick={false}>
                <DateField source="payDate" label="付款日期" />
                <CurrencyField source="amount" label="金額" />
                <TextField source="method" label="方式" />
                <FunctionField
                  label="狀態"
                  render={(record: PaymentRow) => (
                    <PaymentStatusField
                      source="status"
                      record={record}
                    />
                  )}
                />
                <TextField source="note" label="備註" />
              </Datagrid>
            </Box>
          )}
        </Paper>

        <Divider sx={{ my: 1 }} />

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
                  color={isVoided ? "text.secondary" : "success.main"}
                >
                  <CurrencyField source="paidAmount" />
                </Typography>
                {isVoided && voidedPaymentsTotal > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    （已作廢付款：NT${voidedPaymentsTotal.toLocaleString()}）
                  </Typography>
                )}
                {isVoided && voidedPaymentsTotal === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    （作廢後所有付款已取消）
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
                  color={isVoided ? "text.secondary" : "error.main"}
                >
                  <CurrencyField source="balance" />
                </Typography>
                {isVoided && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    （等於總金額）
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>
        </RecordContextProvider>
      </Box>

      {/* 作廢原因輸入對話框 */}
      <VoidReasonDialog
        open={openVoidDialog}
        title="作廢進貨單"
        description="確定要作廢此進貨單嗎？作廢後將自動作廢所有相關的有效付款單。"
        confirmLabel="確認作廢"
        cancelLabel="取消"
        onClose={() => setOpenVoidDialog(false)}
        onConfirm={handleVoid}
      />
    </Drawer>
  );
};

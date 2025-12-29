import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Chip,
  LinearProgress,
  Button,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";

import {
  Datagrid,
  TextField,
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
    details?: PurchaseDetailRow[];
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
    voidReason,
    details = [],
    payments = [],
  } = purchase;

  const isVoided = recordStatus === "VOIDED";



  // 計算已作廢付款的總金額
  const voidedPaymentsTotal = payments
    .filter((p) => p.status === "VOIDED")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

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
          notify("進貨單已成功作廢", { type: "success" });
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
            (error as any)?.body?.message || (error as any)?.message || "作廢失敗";
          notify(errorMessage, { type: "error" });
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
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              此進貨單已作廢
            </Typography>
            {voidedAt && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                作廢時間：{voidedAt}
              </Typography>
            )}
            {voidReason && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                作廢原因：{voidReason}
              </Typography>
            )}
          </Alert>
        )}

        {/* 作廢按鈕 */}
        {!isVoided && id && (
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
        {details.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              📄 進貨項目明細
            </Typography>

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
                maxHeight: enablePaymentScroll ? 140 : "auto",
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

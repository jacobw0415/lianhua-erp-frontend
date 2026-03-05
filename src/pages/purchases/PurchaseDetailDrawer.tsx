import React, { useState, useMemo } from "react";
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
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import ListIcon from "@mui/icons-material/List";

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
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { PurchaseItemDetailDrawer } from "./PurchaseItemDetailDrawer";
import { getDrawerScrollableStyles } from "@/theme/LianhuaTheme";
import { useIsMobile, useIsSmallScreen } from "@/hooks/useIsMobile";
import { getEnumLabel } from "@/utils/enumValueMap";

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
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();
  const [openVoidDialog, setOpenVoidDialog] = useState(false);
  const [openItemDrawer, setOpenItemDrawer] = useState(false);
  const [update, { isLoading: isVoiding }] = useUpdate();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { showAlert } = useGlobalAlert();

  // 確保所有 hooks 都在早期返回之前調用
  const payments = purchase?.payments || [];

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
      anchor={isSmallScreen ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isSmallScreen ? "100%" : { xs: "100%", sm: 560 },
          maxWidth: isSmallScreen ? "100%" : { xs: "100%", sm: 560 },
          ...(isSmallScreen && {
            maxHeight: "85vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }),
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ================= Header ================= */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            mb: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.25rem" },
                fontWeight: 600,
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              📦 進貨付款明細 — {supplierName}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ flexShrink: 0 }}
          >
            <CloseIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
            mb: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            <Chip
              size="small"
              label={statusMeta.label}
              color={statusMeta.color}
              sx={{
                fontWeight: 600,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                height: { xs: "24px", sm: "auto" },
              }}
            />
            {recordStatus && (
              <PurchaseStatusField
                source="recordStatus"
                record={purchase}
              />
            )}
          </Box>
          <RecordContextProvider value={purchase}>
            <Typography
              color="success.main"
              fontWeight={700}
              sx={{
                fontSize: { xs: "0.9rem", sm: "1rem" },
                mt: { xs: 0.5, sm: 0 },
              }}
            >
              總金額：<CurrencyField source="totalAmount" />
            </Typography>
          </RecordContextProvider>
        </Box>

        {/* 作廢資訊顯示 */}
        {isVoided && (
          <Alert
            severity="error"
            sx={{
              mt: { xs: 1.5, sm: 2 },
              mb: { xs: 1.5, sm: 2 },
              flexShrink: 0,
              "& .MuiAlert-message": {
                width: "100%",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: { xs: 1.5, sm: 2 },
                width: "100%",
                alignItems: { xs: "flex-start", sm: "stretch" },
              }}
            >
              {/* 左側：作廢資訊 */}
              <Box
                sx={{
                  flex: { xs: "none", sm: "0 0 auto" },
                  minWidth: { xs: "100%", sm: 170 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                >
                  此進貨單已作廢
                </Typography>
                {voidedAt && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    作廢時間：{voidedAt}
                  </Typography>
                )}
                {voidedPaymentsTotal > 0 && (
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{
                      mt: 0.5,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
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
                    px: { xs: 0, sm: 1 },
                    borderLeft: { xs: "none", sm: `1px solid ${theme.palette.divider}` },
                    borderTop: { xs: `1px solid ${theme.palette.divider}`, sm: "none" },
                    pt: { xs: 1, sm: 0 },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    display="block"
                    sx={{
                      lineHeight: 1.3,
                      mb: 0.5,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    }}
                  >
                    作廢原因
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.3,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
                  >
                    {displayVoidReason}
                  </Typography>
                </Box>
              )}
            </Box>
          </Alert>
        )}

        {/* 操作按鈕 */}
        {!isVoided && id && (
          <Box
            sx={{
              mt: { xs: 1.5, sm: 2 },
              mb: { xs: 1.5, sm: 2 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              gap: { xs: 1, sm: 1 },
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ListIcon />}
              onClick={() => setOpenItemDrawer(true)}
              fullWidth={isMobile}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                minHeight: { xs: "40px", sm: "auto" },
              }}
            >
              查看進貨項目明細
            </Button>
            {hasPayments && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                onClick={() => setOpenVoidDialog(true)}
                disabled={isVoiding}
                fullWidth={isMobile}
                sx={{
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  minHeight: { xs: "40px", sm: "auto" },
                }}
              >
                {isVoiding ? "處理中..." : "作廢進貨單"}
              </Button>
            )}
          </Box>
        )}

        <Divider sx={{ my: { xs: 1.5, sm: 2 }, flexShrink: 0 }} />

        {/* ================= Content Area (Scrollable) ================= */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            pr: { xs: 0.5, sm: 0 },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.palette.action.disabled,
            },
          }}
        >
          {/* ================= 單據資訊（UI 強化） ================= */}
          <Paper
            variant="outlined"
            sx={{
              mb: { xs: 1.5, sm: 2 },
              p: { xs: 1.25, sm: 1.5 },
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              gap={{ xs: 1.5, sm: 0 }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  進貨單號
                </Typography>
                <Typography
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {purchaseNo}
                </Typography>
              </Box>

              <Box textAlign={{ xs: "left", sm: "right" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  進貨日期
                </Typography>
                <Typography
                  fontWeight={600}
                  sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                >
                  {purchaseDate}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* ================= 付款進度 ================= */}
          {!isVoided && (
            <>
              <Box mb={{ xs: 1.5, sm: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                >
                  付款進度
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    mt: 0.5,
                    height: { xs: 8, sm: 10 },
                    borderRadius: 5,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
            </>
          )}

          {/* ================= 已付款紀錄 ================= */}
          <Paper
            variant="outlined"
            sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}
          >
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                fontSize: { xs: "0.85rem", sm: "0.875rem" },
                fontWeight: 600,
              }}
            >
              💰 已付款紀錄
            </Typography>

            {payments.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                尚未有付款紀錄
              </Typography>
            ) : (
              <Box
                sx={getDrawerScrollableStyles(
                  theme,
                  isMobile ? 200 : 150,
                  enablePaymentScroll
                )}
              >
                <Datagrid
                  data={payments}
                  bulkActionButtons={false}
                  rowClick={false}
                  sx={{
                    "& th": {
                      textAlign: "left",
                      height: { xs: "36px", sm: "32px" },
                      minHeight: { xs: "36px", sm: "32px" },
                      maxHeight: { xs: "36px", sm: "32px" },
                      padding: { xs: "6px 8px", sm: "4px 8px" },
                      lineHeight: { xs: "36px", sm: "32px" },
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    },
                    "& td": {
                      textAlign: "left",
                      height: { xs: "44px", sm: "42px" },
                      minHeight: { xs: "44px", sm: "42px" },
                      maxHeight: { xs: "44px", sm: "42px" },
                      padding: { xs: "4px 8px", sm: "0 8px" },
                      lineHeight: { xs: "44px", sm: "42px" },
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    },
                    "& .RaDatagrid-row": {
                      height: { xs: "44px", sm: "42px" },
                      minHeight: { xs: "44px", sm: "42px" },
                      maxHeight: { xs: "44px", sm: "42px" },
                    },
                  }}
                >
                  <DateField source="payDate" label="付款日期" />
                  <CurrencyField source="amount" label="金額" />
                  <FunctionField
                    label="付款方式"
                    render={(record: PaymentRow) =>
                      getEnumLabel("method", record.method)
                    }
                  />
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

          <Divider sx={{ my: { xs: 1, sm: 1 } }} />

          {/* ================= 金額摘要（UI 強化） ================= */}
          <RecordContextProvider value={purchase}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                gap={{ xs: 1.5, sm: 0 }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    已付款
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: "1rem", sm: "18px" },
                      color: isVoided ? "text.secondary" : "success.main",
                    }}
                  >
                    <CurrencyField source="paidAmount" />
                  </Typography>
                  {isVoided && voidedPaymentsTotal > 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        display: "block",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      （已作廢付款：NT${voidedPaymentsTotal.toLocaleString()}）
                    </Typography>
                  )}
                  {isVoided && voidedPaymentsTotal === 0 && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        display: "block",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      （作廢後所有付款已取消）
                    </Typography>
                  )}
                </Box>

                <Box textAlign={{ xs: "left", sm: "right" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    尚欠款
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: "1rem", sm: "18px" },
                      color: isVoided ? "text.secondary" : "error.main",
                    }}
                  >
                    <CurrencyField source="balance" />
                  </Typography>
                  {isVoided && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        display: "block",
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                      }}
                    >
                      （等於總金額）
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </RecordContextProvider>
        </Box>
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

      {/* 進貨項目明細 Drawer */}
      <PurchaseItemDetailDrawer
        open={openItemDrawer}
        onClose={() => setOpenItemDrawer(false)}
        purchaseId={purchase?.id}
        purchaseNo={purchase?.purchaseNo}
        supplierName={purchase?.supplierName}
      />
    </Drawer>
  );
};

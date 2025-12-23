import React, { useMemo } from "react";
import {
  TextInput,
  SelectInput,
  required,
  useRedirect,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { Box, Typography, Paper, Alert } from "@mui/material";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { useActiveOrders } from "@/hooks/useActiveOrders";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { useOrderReceipts } from "@/hooks/useOrderReceipts";

/* =========================================================
 * 型別定義
 * ========================================================= */
interface Receipt {
  id: number;
  orderId: number;
  orderNo: string;
  receivedDate?: string;
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  note?: string;
}

/* =========================================================
 * 表單內容
 * ========================================================= */
const ReceiptFormContent: React.FC = () => {
  const { orders, loading: ordersLoading } = useActiveOrders();

  const availableOrders = useMemo(
    () => orders.filter((o) => o.paymentStatus !== "PAID"),
    [orders]
  );

  const selectedOrderId = useWatch({ name: "orderId" });

  const stableOrderId = useMemo(
    () =>
      typeof selectedOrderId === "number" && selectedOrderId > 0
        ? selectedOrderId
        : null,
    [selectedOrderId]
  );

  const { order, loading: orderLoading } = useOrderDetail(stableOrderId);
  const { paidAmount, loading: receiptsLoading } =
    useOrderReceipts(stableOrderId, order?.orderNo);

  const receivableAmount = useMemo(() => {
    if (!order || !order.totalAmount) return 0;
    return Math.max(0, order.totalAmount - paidAmount);
  }, [order, paidAmount]);

  const isPaid = receivableAmount <= 0 && !!order;

  return (
    <>
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
        💰 新增收款記錄
      </Typography>

      {/* ================= 主版型 ================= */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            lg: "1fr 1fr",
          },
          alignItems: "stretch",
        }}
      >
        {/* ================= 左側 ================= */}
        <Box
          sx={{
            position: "relative", // ⭐ 給提示定位
            minHeight: 260,        // ⭐ 未選訂單時高度穩定
            pb: 7,                 // ⭐ 預留提示空間
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 訂單選擇 */}
          <Box mb={2}>
            <SelectInput
              source="orderId"
              label="訂單 *"
              choices={availableOrders}
              optionText={(r: { orderNo: string; customerName?: string }) =>
                `${r.orderNo}${r.customerName ? ` - ${r.customerName}` : ""}`
              }
              optionValue="id"
              fullWidth
              isLoading={ordersLoading}
              validate={[required()]}
              emptyText={
                availableOrders.length === 0 && !ordersLoading
                  ? "目前沒有可收款的訂單"
                  : undefined
              }
            />
          </Box>

          {/* 訂單資訊 */}
          {selectedOrderId && (
            <Box mb={2}>
              <Paper
                elevation={0}
                sx={(theme) => ({
                  p: 1.5,
                  bgcolor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                })}
              >
                {orderLoading || receiptsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    載入中...
                  </Typography>
                ) : order ? (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      訂單資訊
                    </Typography>

                    <InfoRow label="訂單編號" value={order.orderNo} />
                    {order.customerName && (
                      <InfoRow label="客戶" value={order.customerName} />
                    )}
                    <InfoRow
                      label="訂單總金額"
                      value={order.totalAmount.toLocaleString("zh-TW", {
                        style: "currency",
                        currency: "TWD",
                        minimumFractionDigits: 0,
                      })}
                    />
                    <InfoRow
                      label="已收款金額"
                      value={paidAmount.toLocaleString("zh-TW", {
                        style: "currency",
                        currency: "TWD",
                        minimumFractionDigits: 0,
                      })}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        pt: 1,
                        mt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        可收款金額：
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: isPaid
                            ? "error.main"
                            : "success.main",
                        }}
                      >
                        {receivableAmount.toLocaleString("zh-TW", {
                          style: "currency",
                          currency: "TWD",
                          minimumFractionDigits: 0,
                        })}
                      </Typography>
                    </Box>

                    {isPaid && (
                      <Alert severity="warning" sx={{ mt: 1.5 }}>
                        此訂單已完成收款，無法再新增收款記錄
                      </Alert>
                    )}
                  </>
                ) : (
                  <Typography variant="body2" color="error">
                    無法載入訂單資訊
                  </Typography>
                )}
              </Paper>
            </Box>
          )}

          {/* ⭐ 固定左側底部提示（最關鍵） */}
          <Alert
            severity="info"
            icon={<span>💡</span>}
            sx={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              py: 1,
              px: 2,
              borderRadius: 1,
            }}
          >
            收款金額將由系統自動計算（可收款金額），無需手動輸入
          </Alert>
        </Box>

        {/* ================= 右側 ================= */}
        <Box
          sx={(theme) => ({
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.divider}`,
            p: 2.5,
            minHeight: 260,
            display: "flex",
            flexDirection: "column",
          })}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
            📝 收款資訊
          </Typography>

          <Box mb={1.5}>
            <LhDateInput
              source="receivedDate"
              label="收款日期"
              fullWidth
            />
            <Typography variant="caption" color="text.secondary">
              未填寫時將預設為今日
            </Typography>
          </Box>

          <Box mb={1.5}>
            <SelectInput
              source="method"
              label="收款方式 *"
              fullWidth
              validate={[required()]}
              choices={[
                { id: "CASH", name: "現金" },
                { id: "TRANSFER", name: "轉帳" },
                { id: "CARD", name: "刷卡" },
                { id: "CHECK", name: "支票" },
              ]}
            />
          </Box>

          <TextInput
            source="note"
            label="備註"
            fullWidth
            multiline
            minRows={2}
          />
        </Box>
      </Box>
    </>
  );
};

/* =========================================================
 * 共用顯示列
 * ========================================================= */
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
    <Typography variant="body2" color="text.secondary">
      {label}：
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Box>
);

/* =========================================================
 * 建立頁
 * ========================================================= */
export const ReceiptCreate: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="receipts"
      title="新增收款記錄"
      width="970px"
      onSuccess={(data) => {
        const receipt = data as Receipt;
        showAlert({
          title: "新增成功",
          message: `收款記錄「${receipt.orderNo}」已成功建立`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "receipts"));
      }}
    >
      <ReceiptFormContent />
    </GenericCreatePage>
  );
};

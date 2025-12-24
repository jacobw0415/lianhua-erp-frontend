import React, { useMemo, useState, useEffect } from "react";
import {
  TextInput,
  SelectInput,
  required,
  useRedirect,
  useDataProvider,
} from "react-admin";
import { useWatch, useFormContext } from "react-hook-form";
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
  const { setError, clearErrors } = useFormContext();
  const dataProvider = useDataProvider();
  const [ordersWithReceipts, setOrdersWithReceipts] = useState<Set<number>>(
    new Set()
  );
  const [loadingReceiptsCheck, setLoadingReceiptsCheck] = useState(false);

  // 獲取所有收款記錄，找出有收款記錄的訂單ID
  useEffect(() => {
    if (orders.length === 0) return;

    setLoadingReceiptsCheck(true);
    dataProvider
      .getList("receipts", {
        pagination: { page: 1, perPage: 10000 },
        sort: { field: "id", order: "ASC" },
        filter: {},
      })
      .then((res: { data: Array<{ orderId: number }> | { content: Array<{ orderId: number }> } }) => {
        const receiptList = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        // 提取所有有收款記錄的訂單ID（無論是ACTIVE還是VOIDED）
        const orderIdsWithReceipts = new Set(
          receiptList.map((r) => r.orderId).filter((id) => id != null)
        );
        setOrdersWithReceipts(orderIdsWithReceipts);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入收款記錄失敗：", error);
        setOrdersWithReceipts(new Set());
      })
      .finally(() => setLoadingReceiptsCheck(false));
  }, [orders.length, dataProvider]);

  // 過濾掉有收款記錄的訂單（包括作廢的）
  const availableOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.paymentStatus !== "PAID" && !ordersWithReceipts.has(o.id)
      ),
    [orders, ordersWithReceipts]
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
  const { paidAmount, receipts, loading: receiptsLoading } =
    useOrderReceipts(stableOrderId, order?.orderNo);

  // 檢查是否已有收款記錄（一個訂單只能有一條收款記錄）
  const hasExistingReceipt = useMemo(() => {
    return receipts && receipts.length > 0;
  }, [receipts]);

  // 檢查是否有作廢的收款記錄
  const hasVoidedReceipt = useMemo(() => {
    return receipts && receipts.some((r) => r.status === "VOIDED");
  }, [receipts]);

  // 獲取現有的收款記錄（如果有的話）
  const existingReceipt = useMemo(() => {
    return receipts && receipts.length > 0 ? receipts[0] : null;
  }, [receipts]);

  const receivableAmount = useMemo(() => {
    if (!order || !order.totalAmount) return 0;
    return Math.max(0, order.totalAmount - paidAmount);
  }, [order, paidAmount]);

  const isPaid = receivableAmount <= 0 && !!order;

  // 當檢測到已有收款記錄時（包括作廢的），設置表單錯誤以阻止提交
  useEffect(() => {
    if (hasExistingReceipt && selectedOrderId) {
      const errorMessage = hasVoidedReceipt
        ? "此訂單的收款記錄已作廢，無法重新建立"
        : "此訂單已有收款記錄，無法重複建立";
      setError("orderId", {
        type: "manual",
        message: errorMessage,
      });
    } else {
      clearErrors("orderId");
    }
  }, [hasExistingReceipt, hasVoidedReceipt, selectedOrderId, setError, clearErrors]);

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
              isLoading={ordersLoading || loadingReceiptsCheck}
              validate={[required()]}
              emptyText={
                availableOrders.length === 0 &&
                !ordersLoading &&
                !loadingReceiptsCheck
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

                    {hasExistingReceipt && (
                      <Alert severity="error" sx={{ mt: 1.5 }}>
                        {hasVoidedReceipt
                          ? `此訂單的收款記錄已作廢（ID: ${existingReceipt?.id}），無法重新建立。`
                          : `此訂單已有收款記錄（ID: ${existingReceipt?.id}），無法重複建立。請至收款列表編輯現有記錄。`}
                      </Alert>
                    )}
                    {isPaid && !hasExistingReceipt && (
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
      onError={(error: unknown) => {
        // 檢查是否為唯一約束錯誤
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes("uk_receipts_order_id") || errorMessage.includes("已存在")) {
          showAlert({
            title: "建立失敗",
            message: "此訂單已有收款記錄，無法重複建立。請至收款列表查看或編輯現有記錄。",
            severity: "error",
            hideCancel: true,
          });
        }
      }}
    >
      <ReceiptFormContent />
    </GenericCreatePage>
  );
};

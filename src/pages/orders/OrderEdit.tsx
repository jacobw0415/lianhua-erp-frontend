import { TextInput, useRecordContext } from "react-admin";
import { Box, Typography } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { LhDateInput } from "@/components/inputs/LhDateInput";

/* =======================================================
 * 型別
 * ======================================================= */
type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

interface Order {
  id: number;
  customerId: number;
  customerName?: string;
  orderStatus: OrderStatus;
  orderDate?: string;
  deliveryDate?: string;
  note?: string;
}

/* =======================================================
 * 狀態中文對照
 * ======================================================= */
const orderStatusMap: Record<OrderStatus, string> = {
  PENDING: "尚未確認",
  CONFIRMED: "已確認",
  DELIVERED: "已交付",
  CANCELLED: "已取消",
};

/* =======================================================
 * 權限判斷
 * ======================================================= */
interface OrderRecord {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
}

const useOrderEditPermission = () => {
  const record = useRecordContext<OrderRecord>();
  if (!record) return { editable: false };

  const { orderStatus, paymentStatus } = record;

  const editable =
    orderStatus !== "DELIVERED" &&
    orderStatus !== "CANCELLED" &&
    paymentStatus !== "PAID";

  return { editable, orderStatus };
};

/* =======================================================
 * Form
 * ======================================================= */
const OrderEditForm = () => {
  const { editable } = useOrderEditPermission();
  const record = useRecordContext<Order>();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
        ✏️ 編輯訂單
      </Typography>

      {/* 客戶 / 狀態（唯讀盒子，對齊 SaleEdit 風格） */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* 客戶 */}
        <Box
          flex={1}
          sx={(theme) => ({
            position: "relative",
            border: `2px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            pt: 2.5,
            bgcolor: theme.palette.background.paper,
          })}
        >
          <Typography
            variant="caption"
            sx={(theme) => ({
              position: "absolute",
              top: -10,
              left: 8,
              bgcolor: theme.palette.background.paper,
              px: 1,
              fontWeight: 600,
              color: "text.primary",
            })}
          >
            客戶
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: "1rem",
              color: "text.primary",
            }}
          >
            {record.customerName || "-"}
          </Typography>
        </Box>

        {/* 訂單狀態 */}
        <Box
          flex={1}
          sx={(theme) => ({
            position: "relative",
            border: `2px solid ${theme.palette.divider}`,
            borderRadius: 1,
            p: 2,
            pt: 2.5,
            bgcolor: theme.palette.background.paper,
          })}
        >
          <Typography
            variant="caption"
            sx={(theme) => ({
              position: "absolute",
              top: -10,
              left: 8,
              bgcolor: theme.palette.background.paper,
              px: 1,
              fontWeight: 600,
              color: "text.primary",
            })}
          >
            訂單狀態
          </Typography>
          <Typography
            sx={{
              mt: 1,
              fontSize: "1rem",
              color: "text.primary",
            }}
          >
            {orderStatusMap[record.orderStatus] || record.orderStatus}
          </Typography>
        </Box>
      </Box>

      {/* 日期 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <LhDateInput
          source="orderDate"
          label="訂單日期"
          fullWidth
          size="small"
          disabled={!editable}
        />

        <LhDateInput
          source="deliveryDate"
          label="交貨日期"
          fullWidth
          size="small"
          disabled={!editable}
        />
      </Box>

      {/* 備註 */}
      <TextInput
        source="note"
        label="備註"
        fullWidth
        size="small"
        multiline
        minRows={2}
        disabled={!editable}
      />

      {/* 提示 */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          📄 訂單明細不可編輯（請使用作廢 / 重建流程）
        </Typography>
      </Box>
    </Box>
  );
};

/* =======================================================
 * Page
 * ======================================================= */
export const OrderEdit = () => {
  return (
    <GenericEditPage resource="orders" title="編輯訂單">
      <OrderEditForm />
    </GenericEditPage>
  );
};

import React from "react";
import { Chip } from "@mui/material";
import { useRecordContext } from "react-admin";

type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

interface OrderPaymentStatusFieldProps {
  source?: string;
  record?: Record<string, any>;
  label?: string;
}

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: "default" | "warning" | "success" }
> = {
  UNPAID: { label: "未收款", color: "default" },
  PARTIAL: { label: "部分收款", color: "warning" },
  PAID: { label: "已收款", color: "success" },
};

/**
 * 訂單付款狀態顯示組件
 * 
 *  注意：此組件直接使用後端返回的 paymentStatus 字段
 * 後端已在 OrderServiceImpl.calculatePaymentStatus() 中處理了所有邏輯：
 * - 計算有效收款金額（排除已作廢的收款）
 * - 如果訂單曾經有收款記錄（包括已作廢的），即使現在有效收款為0，也保持 PAID 狀態
 * - 根據收款金額和訂單總金額計算付款狀態（UNPAID, PARTIAL, PAID）
 * 
 * 因此前端無需再額外調用 API 檢查收款記錄，直接使用後端計算的結果即可
 */
export const OrderPaymentStatusField: React.FC<OrderPaymentStatusFieldProps> = ({
  source = "paymentStatus",
  record: recordProp,
}) => {
  const recordContext = useRecordContext();
  const record = recordProp || recordContext;

  if (!record) return null;

  const statusValue = record[source];
  const status = statusValue
    ? (String(statusValue).toUpperCase() as PaymentStatus)
    : "UNPAID";

  const config = paymentStatusConfig[status] || paymentStatusConfig.UNPAID;

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant="outlined"
    />
  );
};


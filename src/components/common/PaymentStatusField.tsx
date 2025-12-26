import React from "react";
import { Chip } from "@mui/material";
import { useRecordContext } from "react-admin";

type PaymentStatus = "ACTIVE" | "VOIDED";

interface PaymentStatusFieldProps {
  source?: string;
  record?: Record<string, any>;
  label?: string;
}

export const PaymentStatusField: React.FC<PaymentStatusFieldProps> = ({
  source = "status",
  record: recordProp,
}) => {
  const recordContext = useRecordContext();
  // 優先使用傳入的 record prop，否則使用 context 中的 record
  const record = recordProp || recordContext;

  if (!record) return null;

  const statusValue = record[source];
  // 處理可能的 null、undefined、空字符串，並轉換為大寫以匹配類型
  const status = statusValue
    ? (String(statusValue).toUpperCase() as PaymentStatus)
    : undefined;

  const statusConfig: Record<
    PaymentStatus,
    { label: string; color: "success" | "default" | "error" }
  > = {
    ACTIVE: { label: "有效", color: "success" },
    VOIDED: { label: "作廢", color: "error" },
  };

  // 檢查狀態是否在配置中存在
  const config = status && status in statusConfig
    ? statusConfig[status]
    : { label: "未知", color: "default" as const };

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant="outlined"
    />
  );
};


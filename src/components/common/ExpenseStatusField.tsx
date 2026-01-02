import React from "react";
import { Chip } from "@mui/material";
import { useRecordContext } from "react-admin";

type ExpenseStatus = "ACTIVE" | "VOIDED";

interface ExpenseStatusFieldProps {
  source?: string;
  record?: Record<string, any>;
  label?: string;
}

export const ExpenseStatusField: React.FC<ExpenseStatusFieldProps> = ({
  source = "status",
  record: recordProp,
}) => {
  const recordContext = useRecordContext();
  // 優先使用傳入的 record prop，否則使用 context 中的 record
  const record = recordProp || recordContext;

  if (!record) return null;

  const statusValue = record[source];
  
  // 處理可能的 null、undefined、空字符串，並轉換為大寫以匹配類型
  // 如果沒有狀態值，默認視為 ACTIVE
  let status: ExpenseStatus = "ACTIVE";
  
  if (statusValue !== null && statusValue !== undefined && statusValue !== "") {
    const upperStatus = String(statusValue).trim().toUpperCase();
    if (upperStatus === "ACTIVE" || upperStatus === "VOIDED") {
      status = upperStatus as ExpenseStatus;
    } else {
      // 調試：如果狀態值不匹配，在開發環境下輸出
      if (import.meta.env.DEV) {
        console.warn(`[ExpenseStatusField] 未知的狀態值: "${statusValue}" (轉換後: "${upperStatus}")`, record);
      }
    }
  }

  const statusConfig: Record<
    ExpenseStatus,
    { label: string; color: "success" | "default" | "error" }
  > = {
    ACTIVE: { label: "有效", color: "success" },
    VOIDED: { label: "作廢", color: "error" },
  };

  // 檢查狀態是否在配置中存在
  const config = statusConfig[status];

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant="outlined"
    />
  );
};


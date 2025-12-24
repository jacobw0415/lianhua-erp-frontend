import React, { useEffect, useState } from "react";
import { Chip } from "@mui/material";
import { useRecordContext, useDataProvider } from "react-admin";

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

export const OrderPaymentStatusField: React.FC<OrderPaymentStatusFieldProps> = ({
  source = "paymentStatus",
  record: recordProp,
}) => {
  const recordContext = useRecordContext();
  const record = recordProp || recordContext;
  const dataProvider = useDataProvider();
  const [hasVoidedReceipt, setHasVoidedReceipt] = useState(false);
  const [loading, setLoading] = useState(false);

  const orderNo = record?.orderNo;

  // 檢查是否有作廢的收款記錄（總是檢查，因為作廢後狀態會變為 UNPAID）
  useEffect(() => {
    if (!orderNo) {
      setHasVoidedReceipt(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    dataProvider
      .getList("receipts", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "id", order: "ASC" },
        filter: { orderNo, includeVoided: true },
      })
      .then((res: { data: Array<{ status?: string }> | { content: Array<{ status?: string }> } }) => {
        let receiptList: Array<{ status?: string }> = [];
        if (Array.isArray(res.data)) {
          receiptList = res.data;
        } else if (res.data && typeof res.data === "object" && "content" in res.data) {
          receiptList = (res.data as { content: Array<{ status?: string }> }).content ?? [];
        }

        // 檢查是否有作廢的收款記錄
        const hasVoided = receiptList.some((r: { status?: string }) => r?.status === "VOIDED");
        // 檢查是否有任何收款記錄（包括作廢的）
        const hasAnyReceipt = receiptList.length > 0;

        // 如果有作廢的收款記錄，表示曾經付款過，應該顯示為 PAID
        setHasVoidedReceipt(hasVoided && hasAnyReceipt);
      })
      .catch(() => {
        setHasVoidedReceipt(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderNo, record, source, dataProvider]);

  if (!record) return null;

  const statusValue = record[source];
  const status = statusValue
    ? (String(statusValue).toUpperCase() as PaymentStatus)
    : "UNPAID";

  // 如果有作廢的收款記錄，強制顯示為 PAID
  const displayStatus = hasVoidedReceipt && status !== "PAID" ? "PAID" : status;

  const config = paymentStatusConfig[displayStatus] || paymentStatusConfig.UNPAID;

  if (loading) {
    return <Chip size="small" label="載入中..." color="default" />;
  }

  return (
    <Chip
      size="small"
      label={config.label}
      color={config.color}
      variant="outlined"
    />
  );
};


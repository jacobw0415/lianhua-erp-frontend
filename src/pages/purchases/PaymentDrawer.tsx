import React from "react";
import { GenericSubTableDrawer } from "@/components/common/GenericSubTableDrawer";

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  purchase: any | null;
}

export const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  open,
  onClose,
  purchase,
}) => {
  if (!purchase) return null;

  const payments = purchase.payments ?? [];

  return (
    <GenericSubTableDrawer
      open={open}
      onClose={onClose}
      title={`💰 付款紀錄 — ${purchase.supplierName}`}
      rows={payments}
      showTotal
      totalField="amount"
      columns={[
        { source: "amount", label: "金額", type: "currency" },
        { source: "payDate", label: "付款日期", type: "date" },
        { source: "method", label: "付款方式", type: "text" },
        { source: "note", label: "備註", type: "text" },
      ]}
    />
  );
};

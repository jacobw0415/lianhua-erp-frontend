import { GenericSubTableDrawer } from "@/components/common/GenericSubTableDrawer";

/* =========================================================
 * 型別定義
 * ========================================================= */

interface PaymentRow {
  amount: number;
  payDate: string; // yyyy-MM-dd
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  note?: string;
}

interface PurchaseWithPayments {
  supplierName: string;
  payments: PaymentRow[];
}

interface PaymentDrawerProps {
  open: boolean;
  onClose: () => void;
  purchase?: PurchaseWithPayments;
}

/* =========================================================
 * Component
 * ========================================================= */

export const PaymentDrawer = ({
  open,
  onClose,
  purchase,
}: PaymentDrawerProps) => {
  if (!purchase) return null;

  return (
    <GenericSubTableDrawer
      open={open}
      onClose={onClose}
      title={`💰 付款紀錄 — ${purchase.supplierName}`}
      rows={purchase.payments}
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

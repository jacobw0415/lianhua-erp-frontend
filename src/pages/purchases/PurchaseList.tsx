import { useState } from "react";
import {
  List,
  TextField,
  DateField,
  FunctionField,
  useRefresh,
} from "react-admin";

import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { CurrencyField } from "@/components/money/CurrencyField";
import { ActionColumns } from "@/components/common/ActionColumns";

import { PurchaseDetailDrawer } from "./PurchaseDetailDrawer";

/* =========================================================
 * 型別定義
 * ========================================================= */

interface PaymentRow {
  amount: number;
  payDate: string;
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  note?: string;
}

interface PurchaseItemRow {
  id: number;
  purchaseId: number;
  item: string;
  unit: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  note?: string;
}

interface PurchaseListRow {
  id: number;
  purchaseNo: string;
  supplierName: string;
  purchaseDate: string;

  totalAmount: number;
  paidAmount: number;
  balance: number;

  status: "PENDING" | "PARTIAL" | "PAID";
  note?: string;

  payments?: PaymentRow[];
}

/* =========================================================
 * Drawer 資料來源
 * ========================================================= */

type SelectedPurchase = {
  id: number;
  purchaseNo: string;
  supplierName: string;
  purchaseDate: string;
  status: "PENDING" | "PARTIAL" | "PAID";

  totalAmount: number;
  paidAmount: number;
  balance: number;

  recordStatus?: "ACTIVE" | "VOIDED";
  voidedAt?: string;
  voidReason?: string;

  items: PurchaseItemRow[];
  payments: PaymentRow[];
};

/* =========================================================
 * Component
 * ========================================================= */

export const PurchaseList = () => {
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<SelectedPurchase | null>(null);
  const refresh = useRefresh();

  const openDetails = (record: PurchaseListRow) => {
    setSelectedPurchase({
      id: record.id,
      purchaseNo: record.purchaseNo,
      supplierName: record.supplierName,
      purchaseDate: record.purchaseDate,
      status: record.status,
      totalAmount: record.totalAmount,
      paidAmount: record.paidAmount,
      balance: record.balance,
      recordStatus: (record as any).recordStatus,
      voidedAt: (record as any).voidedAt,
      voidReason: (record as any).voidReason,
      items: [],                    // 明細由 Drawer 內補
      payments: record.payments ?? [],
    });

    setOpenDetailDrawer(true);
  };

  const handleRefresh = () => {
    refresh();
    // 如果抽屜打開，重新載入選中的進貨單資料
    if (selectedPurchase?.id) {
      // 這裡可以選擇重新打開抽屜或關閉它
      // 為了簡單起見，我們關閉抽屜並刷新列表
      setOpenDetailDrawer(false);
    }
  };

  return (
    <>
      <List
        title="進貨紀錄"
        actions={false}
        perPage={10}
        pagination={<CustomPaginationBar showPerPage />}
      >
        <StyledListWrapper
          quickFilters={[
            { type: "text", source: "purchaseNo", label: "進貨單號" },
            { type: "text", source: "supplierName", label: "供應商名稱" },
          ]}
          advancedFilters={[
            {
              type: "select",
              source: "status",
              label: "狀態",
              choices: [
                { id: "PENDING", name: "未付款" },
                { id: "PARTIAL", name: "部分付款" },
                { id: "PAID", name: "已付款" },
              ],
            },
            {
              type: "month",
              source: "accountingPeriod",
              label: "會計期間 (YYYY-MM)",
            },
            { type: "date", source: "fromDate", label: "進貨日（起）" },
            { type: "date", source: "toDate", label: "進貨日（迄）" },
          ]}
          exportConfig={{
            filename: "purchase_export",
            format: "excel",
            columns: [
              { header: "進貨單號", key: "purchaseNo", width: 18 },
              { header: "供應商名稱", key: "supplierName", width: 20 },
              { header: "進貨日期", key: "purchaseDate", width: 15 },
              { header: "總金額", key: "totalAmount", width: 15 },
              { header: "已付款", key: "paidAmount", width: 15 },
              { header: "餘額", key: "balance", width: 15 },
              { header: "狀態", key: "status", width: 15 },
              { header: "備註", key: "note", width: 25 },
            ],
          }}
        >
          <StyledListDatagrid>
            <TextField source="purchaseNo" label="進貨單號" />
            <TextField source="supplierName" label="供應商名稱" />
            <DateField source="purchaseDate" label="進貨日期" />
            <CurrencyField source="totalAmount" label="總金額" />
            <CurrencyField source="paidAmount" label="已付款" />
            <CurrencyField source="balance" label="餘額" />
            <FunctionField
              label="狀態"
              render={(record: PurchaseListRow) => {
                const statusMap: Record<string, string> = {
                  PENDING: "未付款",
                  PARTIAL: "部分付款",
                  PAID: "已付款",
                };
                return statusMap[record.status] || record.status;
              }}
            />

            {/* 📦 明細 */}
            <FunctionField
              label="明細"
              render={(record: PurchaseListRow) => (
                <IconButton size="small" onClick={() => openDetails(record)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />

            {/* 🛠 操作 */}
            <FunctionField
              label="操作"
              source="action"
              className="column-action"
              render={() => <ActionColumns />}
            />
          </StyledListDatagrid>
        </StyledListWrapper>
      </List>

      <PurchaseDetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        purchase={selectedPurchase ?? undefined}
        onRefresh={handleRefresh}
      />
    </>
  );
};

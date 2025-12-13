import { useState } from "react";
import {
  List,
  TextField,
  NumberField,
  DateField,
  FunctionField,
} from "react-admin";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { PaymentDrawer } from "./PaymentDrawer";
import { ActionColumns } from "@/components/common/ActionColumns";
import { CurrencyField } from "@/components/money/CurrencyField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";

/* =========================================================
 * 型別定義
 * ========================================================= */

/** PaymentDrawer 需要的付款資料（與 PaymentDrawer.tsx 對齊） */
interface PaymentRow {
  amount: number;
  payDate: string;
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  note?: string;
}

/** PaymentDrawer 真正需要的 Purchase 型別 */
interface PurchaseWithPayments {
  supplierName: string;
  payments: PaymentRow[];
}

/** Purchase List 每一列（Summary + Drawer 所需欄位） */
interface PurchaseListRow extends PurchaseWithPayments {
  id: number;

  purchaseNo: string;
  supplierName: string;
  item: string;

  qty: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;

  status: "PENDING" | "PARTIAL" | "PAID";
  purchaseDate: string;
  note?: string;
}

/* =========================================================
 * Component
 * ========================================================= */

export const PurchaseList = () => {
  const [openDrawer, setOpenDrawer] = useState(false);

  /** ⭐ Drawer 只吃「它需要的結構」 */
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseWithPayments | undefined>(undefined);

  const handleOpen = (record: PurchaseListRow) => {
    setSelectedPurchase({
      supplierName: record.supplierName,
      payments: record.payments ?? [],
    });
    setOpenDrawer(true);
  };

  return (
    <>
      <List
        title="進貨紀錄"
        actions={false}
        pagination={<CustomPaginationBar showPerPage />}
        perPage={10}
      >
        <StyledListWrapper
          /* -----------------------------
           * 🔍 Quick Filters
           * ----------------------------- */
          quickFilters={[
            { type: "text", source: "supplierName", label: "供應商名稱" },
            { type: "text", source: "item", label: "品項" },
          ]}

          /* -----------------------------
           * 📌 Advanced Filters
           * ----------------------------- */
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
            {
              type: "date",
              source: "fromDate",
              label: "進貨日（起）",
            },
            {
              type: "date",
              source: "toDate",
              label: "進貨日（迄）",
            },
          ]}

          /* -----------------------------
           * 📤 Export
           * ----------------------------- */
          exportConfig={{
            filename: "purchase_export",
            format: "excel",
            columns: [
              { header: "進貨單號", key: "purchaseNo", width: 20 },
              { header: "供應商", key: "supplierName", width: 20 },
              { header: "品項", key: "item", width: 20 },
              { header: "數量", key: "qty", width: 10 },
              { header: "單價", key: "unitPrice", width: 12 },
              { header: "總金額", key: "totalAmount", width: 12 },
              { header: "已付款", key: "paidAmount", width: 12 },
              { header: "餘額", key: "balance", width: 12 },
              { header: "狀態", key: "status", width: 10 },
              { header: "進貨日期", key: "purchaseDate", width: 14 },
              { header: "備註", key: "note", width: 20 },
            ],
          }}
        >
          {/* -----------------------------
           * 📄 Datagrid
           * ----------------------------- */}
          <StyledListDatagrid>
            <TextField source="purchaseNo" label="進貨單號" />
            <TextField source="supplierName" label="供應商名稱" />
            <TextField source="item" label="品項" />
            <NumberField source="qty" label="數量" />
            <CurrencyField source="unitPrice" label="單價" />
            <CurrencyField source="totalAmount" label="總金額" />
            <CurrencyField source="paidAmount" label="已付款" />
            <CurrencyField source="balance" label="餘額" />
            <TextField source="status" label="狀態" />
            <DateField source="purchaseDate" label="進貨日期" />
            <TextField source="note" label="備註" />

            {/* 🔍 Drawer：查看付款紀錄 */}
            <FunctionField
              label="付款"
              className="cell-centered"
              render={(record: PurchaseListRow) => (
                <IconButton
                  size="small"
                  onClick={() => handleOpen(record)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />

            {/* 🛠️ 操作欄 */}
            <FunctionField
              label="操作"
              source="action"
              className="column-action"
              render={() => <ActionColumns />}
            />
          </StyledListDatagrid>
        </StyledListWrapper>
      </List>

      {/* 📘 Drawer：付款紀錄 */}
      <PaymentDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        purchase={selectedPurchase}
      />
    </>
  );
};

import { useState } from "react";
import {
  List,
  TextField,
  DateField,
  FunctionField,
  NumberField
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

interface PurchaseDetailRow {
  id: number;
  item: string;
  qty: number;
  unitPrice: number;
  totalAmount: number;
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

  details: PurchaseDetailRow[];
  payments: PaymentRow[];
};

/* =========================================================
 * Component
 * ========================================================= */

export const PurchaseList = () => {
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<SelectedPurchase | null>(null);

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
      details: [],                  // 明細由 Drawer 內補
      payments: record.payments ?? [],
    });

    setOpenDetailDrawer(true);
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
            { type: "text", source: "supplierName", label: "供應商名稱" },
            { type: "text", source: "item", label: "品項" },
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
              { header: "品項", key: "item", width: 15 },
              { header: "數量", key: "qty", width: 15 },
              { header: "單價", key: "unitPrice", width: 15 },
              { header: "總金額", key: "totalAmount", width: 15 },
              { header: "備註", key: "note", width: 25 },
            ],
          }}
        >
          <StyledListDatagrid>
            <TextField source="purchaseNo" label="進貨單號" />
            <TextField source="supplierName" label="供應商名稱" />
            <DateField source="purchaseDate" label="進貨日期" />
            <TextField source="item" label="品項" />
            <NumberField source="qty" label="數量" />
            <CurrencyField source="unitPrice" label="單價" />
            <CurrencyField source="totalAmount" label="總金額" />

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
      />
    </>
  );
};

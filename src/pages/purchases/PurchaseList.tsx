import {
  List,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  Pagination,
} from "react-admin";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useState } from "react";
import { PaymentDrawer } from "./PaymentDrawer";
import { ActionColumns } from "@/components/common/ActionColumns";
import { CurrencyField } from "@/components/money/CurrencyField";
import { CustomPaginationBar} from "@/components/pagination/CustomPagination";

export const PurchaseList = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);

  const handleOpen = (record: any) => {
    setSelectedPurchase(record);
    setOpenDrawer(true);
  };

  return (
    <>
      <List
        title="進貨紀錄"
        actions={false}
        pagination={<CustomPaginationBar showPerPage={true} />} perPage={10}
      >
        <StyledListWrapper
          /* ---------------------------------------------------------
           *  🔍 Quick Filters（簡易搜尋）
           * --------------------------------------------------------- */
          quickFilters={[
            { type: "text", source: "supplierName", label: "供應商名稱" },
            { type: "text", source: "item", label: "品項" },
          ]}

          /* ---------------------------------------------------------
           *  📌 Advanced Filters（進階搜尋）
           * --------------------------------------------------------- */
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

          /* ---------------------------------------------------------
           *  匯出設定
           * --------------------------------------------------------- */
          exportConfig={{
            filename: "purchase_export",
            format: "excel",
            columns: [
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

          {/* ---------------------------------------------------------
           *   📄 Datagrid（資料表）
           * --------------------------------------------------------- */}
          <StyledListDatagrid>
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
              source="payment"
              className="cell-centered"
              render={(record) => (
                <IconButton size="small" onClick={() => handleOpen(record)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />

            {/* 🛠️ 操作功能 */}
            <FunctionField
              label="操作"
              source="action"
              className="column-action"
              render={() => <ActionColumns />}
            />
          </StyledListDatagrid>
        </StyledListWrapper>
      </List>

      {/* 📘 右側 Drawer：付款紀錄 */}
      <PaymentDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        purchase={selectedPurchase}
      />
    </>
  );
};

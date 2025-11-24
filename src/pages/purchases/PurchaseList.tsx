import {
  List,
  TextField,
  NumberField,
  DateField,
  FunctionField,
  TopToolbar,
  CreateButton,
  Pagination,
} from "react-admin";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useState } from "react";
import { PaymentDrawer } from "./PaymentDrawer";
import { ActionColumns } from "@/components/common/ActionColumns";

/**
 * 📦 List 頁面上方工具列
 */
const ListActions = () => (
  <TopToolbar>
    <CreateButton label="新增進貨" />
  </TopToolbar>
);

/**
 * 📋 主表：進貨紀錄清單（右側 Drawer 子表版本）
 */
export const PurchaseList = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const handleOpen = (record: any) => {
    setSelectedPurchase(record);
    setOpenDrawer(true);
  };

  return (
    <>
      <List
        title="進貨紀錄"
        actions={<ListActions />}
        pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
        perPage={10}
      >
          <StyledListDatagrid
          >
            <TextField source="supplierName" label="供應商名稱" />
            <TextField source="item" label="品項" />
            <NumberField source="qty" label="數量" />
            <NumberField
              source="unitPrice"
              label="單價"
              options={{ style: "currency", currency: "TWD" }}
            />
            <NumberField
              source="totalAmount"
              label="總金額"
              options={{ style: "currency", currency: "TWD" }}
            />
            <NumberField
              source="paidAmount"
              label="已付款"
              options={{ style: "currency", currency: "TWD" }}
            />
            <NumberField
              source="balance"
              label="餘額"
              options={{ style: "currency", currency: "TWD" }}
            />
            <TextField source="status" label="狀態" />
            <DateField source="purchaseDate" label="進貨日期" />
            <TextField source="note" label="備註" />

            {/* ⭐ 查看付款紀錄 (取代展開方式) */}
            <FunctionField
              label="付款"
              className="cell-centered"
              render={(record) => (
                <IconButton size="small" onClick={() => handleOpen(record)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />

            {/* ⭐ 原本的操作欄位 */}
            <FunctionField
              source="action"
              className="column-action"
              label="操作"
              render={() => <ActionColumns />}
            />
          </StyledListDatagrid>
      </List>

      {/* ⭐ 右側 Drawer */}
      <PaymentDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        purchase={selectedPurchase}
      />
    </>
  );
};
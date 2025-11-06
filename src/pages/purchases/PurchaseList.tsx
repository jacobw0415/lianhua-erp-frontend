import {
  List,
  TextField,
  NumberField,
  DateField,
  EditButton,
  DeleteButton,
  TopToolbar,
  CreateButton,
  useRecordContext,
} from "react-admin";
import { Box, Typography } from "@mui/material";
import { StyledDatagrid } from "@/components/StyledDatagrid";

// ✅ 子表格：付款紀錄
const PaymentSubList = () => {
  const record = useRecordContext();
  if (!record || !record.payments || record.payments.length === 0) return null;

  return (
    <Box sx={{ ml: 6, mb: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: "text.secondary", mb: 1, fontWeight: 600 }}
      >
        💰 付款紀錄
      </Typography>
      <StyledDatagrid
        data={record.payments}
        rowClick={false}
        bulkActionButtons={false}
        sx={{
          "& .MuiTableCell-root": { fontSize: "0.85rem", py: 0.5 },
        }}
      >
        <NumberField
          source="amount"
          label="金額"
          options={{ style: "currency", currency: "TWD" }}
        />
        <DateField source="payDate" label="付款日期" />
        <TextField source="method" label="付款方式" />
        <TextField source="note" label="備註" />
      </StyledDatagrid>
    </Box>
  );
};

// ✅ 自訂工具列：右上角新增按鈕
const ListActions = () => (
  <TopToolbar>
    <CreateButton label="新增進貨" />
  </TopToolbar>
);

// ✅ 主表格：進貨紀錄清單
export const PurchaseList = () => (
  <List title="進貨紀錄" actions={<ListActions />}>
    <StyledDatagrid expand={<PaymentSubList />}>
      <TextField source="supplierName" label="供應商" />
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

      {/* ✅ 每列操作按鈕 */}
      <EditButton label="編輯" />
      <DeleteButton label="刪除" />
    </StyledDatagrid>
  </List>
);

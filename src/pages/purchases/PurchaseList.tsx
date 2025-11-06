import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  useRecordContext,
} from "react-admin";
import { Box, Typography } from "@mui/material";
import { StyledDatagrid } from "@/components/StyledDatagrid";

const PaymentSubList = () => {
  const record = useRecordContext(); // 拿到當前的 purchase 資料
  if (!record || !record.payments || record.payments.length === 0) return null;

  return (
    <Box sx={{ ml: 4, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
        💰 付款紀錄：
      </Typography>
      <StyledDatagrid
        data={record.payments}
        rowClick={false}
        bulkActionButtons={false}
        sx={{
          "& .MuiTableCell-root": { fontSize: "0.85rem" },
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

export const PurchaseList = () => (
  <List title="進貨紀錄">
    <StyledDatagrid expand={<PaymentSubList />}>
      <TextField source="id" label="ID" />
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
    </StyledDatagrid>
  </List>
);

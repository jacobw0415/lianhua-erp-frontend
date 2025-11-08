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
import { StyledDatagrid } from "@/components/StyledDatagrid";
import { Box, Typography } from "@mui/material";

const PaymentSubList = () => {
  const record = useRecordContext();
  if (!record?.payments?.length) return null;

  return (
    <Box sx={{ ml: 6, mb: 2 }}>
      <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1, fontWeight: 600 }}>
        💰 付款紀錄
      </Typography>
      <StyledDatagrid
        data={record.payments}
        rowClick={false}
        bulkActionButtons={false}
        sx={{
          "& .MuiTable-root": {
            // ❌ 移除固定寬度與固定布局
            tableLayout: "auto",
            width: "100%",
          },
          "& .MuiTableCell-root": {
            py: 1,
            px: 2,
            overflow: "visible", // ✅ 改為 visible 以防止數字被截斷
            textOverflow: "unset",
            whiteSpace: "nowrap", // ✅ 保持數字與貨幣符號在同一行
          },
          "& .column-amount": {
            minWidth: "240px",
            textAlign: "left",
            paddingLeft: 2,
          },
          "& .column-amount span": {
            display: "inline-block",
            textAlign: 'left'
          },

          "& .column-payDate": { minWidth: "30px" },
          "& .column-method": { minWidth: "200px" },
          "& .column-note": { minWidth: "190px" },
        }}
      >
        <NumberField
          source="amount"
          label="金額"
          options={{
            style: "currency",
            currency: "TWD",
            minimumFractionDigits: 0,
          }}
        />
        <DateField source="payDate" label="付款日期" />
        <TextField source="method" label="付款方式" />
        <TextField source="note" label="備註" />
      </StyledDatagrid>
    </Box>
  );
};

const ListActions = () => (
  <TopToolbar>
    <CreateButton label="新增進貨" />
  </TopToolbar>
);

export const PurchaseList = () => (
  <List title="進貨紀錄" actions={<ListActions />}>
    <StyledDatagrid
      expand={<PaymentSubList />}
      sx={{
        // ✅ 只在 PurchaseList 中生效
        "& .RaDatagrid-cell:first-of-type, & .RaDatagrid-headerCell:first-of-type": {
          width: "64px !important",
          minWidth: "64px !important",
          overflow: "visible !important",
 
          textAlign: "left",
        },
      }}
    >
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
      <EditButton label="編輯" />
      <DeleteButton label="刪除" />
    </StyledDatagrid>
  </List>
);

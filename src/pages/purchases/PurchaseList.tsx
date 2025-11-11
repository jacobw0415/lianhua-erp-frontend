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

  const payments = record.payments || [];

  // ✅ 當筆數多於 2 筆才出現滾輪
  const enableScroll = payments.length > 2;
  const maxHeight = enableScroll ? "120px" : "auto";

  return (
    <Box sx={{ ml: 6, mb: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: "text.secondary", mb: 1, fontWeight: 600 }}
      >
        💰 付款紀錄
      </Typography>

      <StyledDatagrid
        data={payments}
        rowClick={false}
        bulkActionButtons={false}
        maxHeight={maxHeight}
        sx={{
          "& .MuiTable-root": {
            tableLayout: "auto",
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
          },
          "& .MuiTableCell-root": {
            py: 1,
            px: 2,
            whiteSpace: "nowrap",
          },
          "& .column-amount": { minWidth: "180px", textAlign: "left" },
          "& .column-payDate": { minWidth: "100px" },
          "& .column-method": { minWidth: "120px" },
          "& .column-note": { minWidth: "160px" },
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

import {
  NumberInput,
  TextInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
} from "react-admin";
import { Box,Typography } from "@mui/material";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";

export const PurchaseCreate = () => (
  <GenericCreatePage resource="purchases" title="新增進貨紀錄">
    <Typography variant="h6">📦 進貨資訊</Typography>
    <ReferenceInput source="supplierId" reference="suppliers" label="供應商" perPage={50}>
      <SelectInput optionText="name" />
    </ReferenceInput>

    <TextInput source="item" label="品項" fullWidth />
    <Box sx={{ display: "flex", gap: 2 }}>
      <NumberInput source="qty" label="數量" fullWidth />
      <NumberInput source="unitPrice" label="單價" fullWidth />
    </Box>
    <DateInput source="purchaseDate" label="進貨日期" />
    <TextInput source="note" label="備註" fullWidth multiline />

    <ArrayInput source="payments" label="付款資訊">
      <SimpleFormIterator
        inline
        sx={{
          "& .RaSimpleFormIterator-line": {
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "nowrap",
          },
        }}
      >
        <NumberInput source="amount" label="金額" sx={{ flex: 1 }} />
        <DateInput source="payDate" label="付款日期" sx={{ flex: 1 }} />
        <SelectInput
          source="method"
          label="付款方式"
          choices={[
            { id: "CASH", name: "現金" },
            { id: "TRANSFER", name: "轉帳" },
            { id: "CARD", name: "刷卡" },
            { id: "CHECK", name: "支票" },
          ]}
          sx={{ flex: 1 }}
        />
      </SimpleFormIterator>
    </ArrayInput>
  </GenericCreatePage>
);

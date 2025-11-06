import { List, TextField, NumberField, DateField } from "react-admin";
import { StyledDatagrid } from "@/components/StyledDatagrid";

export const PaymentList = () => (
  <List title="付款紀錄">
    <StyledDatagrid>
      <TextField source="id" label="ID" />
      <TextField source="purchaseId" label="進貨單 ID" />
      <NumberField
        source="amount"
        label="金額"
        options={{ style: "currency", currency: "TWD" }}
      />
      <DateField source="payDate" label="付款日期" />
      <TextField source="method" label="付款方式" />
      <TextField source="note" label="備註" />
    </StyledDatagrid>
  </List>
);


import { List, TextField, NumberField, DateField } from "react-admin";
import { StyledListDatagrid } from "../../components/StyledListDatagrid";

export const SaleList = () => (
  <List title="銷售紀錄">
    <StyledListDatagrid>
      <TextField source="productName" label="商品" sx={{ width: 150 }} />
      <NumberField source="qty" label="數量" sx={{ width: 80 }} />
      <NumberField source="payMethod" label="付款方式" sx={{ width: 80 }} />
      <NumberField source="amount" label="總金額" options={{ style: "currency", currency: "TWD" }} sx={{ width: 100 }} />
      <DateField source="saleDate" label="銷售日期" sx={{ width: 100 }} />
    </StyledListDatagrid>
  </List>
);

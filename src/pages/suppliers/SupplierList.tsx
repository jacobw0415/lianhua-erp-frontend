import { List, TextField } from "react-admin";
import { StyledDatagrid } from "../../components/StyledDatagrid";

export const SupplierList = () => (
  <List>
    <StyledDatagrid>
      <TextField source="id" label="ID" sx={{ width: "60px" }} />
      <TextField source="name" label="名稱" sx={{ width: "200px" }} />
      <TextField source="contact" label="聯絡人" sx={{ width: "100px" }} />
      <TextField source="phone" label="電話" sx={{ width: "150px" }} />
      <TextField source="billingCycle" label="結帳週期" sx={{ width: "120px" }} />
      <TextField source="note" label="備註" sx={{ width: "200px" }} />
    </StyledDatagrid>
  </List>
);

import {
  List,
  TextField,
  EditButton,
  DeleteButton,
  TopToolbar,
  CreateButton,
} from "react-admin";
import { StyledDatagrid } from "@/components/StyledDatagrid";

// ✅ 自訂工具列：右上角新增按鈕
const ListActions = () => (
  <TopToolbar>
    <CreateButton label="新增供應商" />
  </TopToolbar>
);

// ✅ 主表格：供應商清單
export const SupplierList = () => (
  <List title="供應商清單" actions={<ListActions />}>
    <StyledDatagrid
      
    >
      <TextField source="name" label="供應商名稱" />
      <TextField source="none" label="" />
      <TextField source="contact" label="聯絡人" />
      <TextField source="none" label="" />
      <TextField source="phone" label="電話" />
      <TextField source="none" label="" />
      <TextField source="billingCycle" label="結帳週期" />
      <TextField source="none" label="" />
      <TextField source="note" label="備註" />
      <TextField source="none" label="" />
      <EditButton label="編輯" />
      <DeleteButton label="刪除" />
    </StyledDatagrid>
  </List>
);

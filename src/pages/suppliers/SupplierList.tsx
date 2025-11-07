import {
  List,
  TextField,
  DateField,
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
      {/* 資料欄位 */}
      <TextField source="name" label="供應商名稱" />
      <TextField source="contact" label="聯絡人" />
      <TextField source="phone" label="電話" />

      {/* 操作按鈕 */}
      <EditButton label="編輯" />
      <DeleteButton label="刪除" />
    </StyledDatagrid>
  </List>
);

import {
  List,
  TextField,
  TopToolbar,
  CreateButton,
  Pagination,
  FunctionField,
} from "react-admin";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { ActionColumns } from "@/components/common/ActionColumns";

/** ✅ 自訂工具列（右上角新增按鈕） */
const ListActions = () => (
  <TopToolbar>
    <CreateButton label="新增供應商" />
  </TopToolbar>
);

/** ✅ 主表格：供應商清單 */
export const SupplierList = () => (
  <List
    title="供應商清單"
    actions={<ListActions />}
    pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
    perPage={10}
  >
    <StyledListDatagrid
      sx={{
        "& .RaDatagrid-headerCell:nth-of-type(1), & .RaDatagrid-cell:nth-of-type(1)": {
          minWidth: "140px !important",

        },
      }}
    >
      <TextField source="name" label="供應商名稱" />
      <TextField source="contact" label="聯絡人" />
      <TextField source="phone" label="電話" />
      <TextField source="billingCycle" label="結帳週期" />
      <TextField source="note" label="備註" />
      <FunctionField
        source="action"
        label="操作"
        render={() => <ActionColumns />}
      />
    </StyledListDatagrid>
  </List>
);

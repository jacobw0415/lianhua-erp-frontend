import {
  List,
  TextField,
  Pagination,
  FunctionField,
} from "react-admin";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { ActionColumns } from "@/components/common/ActionColumns";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";

export const SupplierList = () => (
  <List
    title="供應商清單"
    actions={false}
    empty={false}
    pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
    perPage={10}
  >
    <StyledListWrapper
      quickFilters={[
        { type: "text", source: "name", label: "供應商名稱" },
        { type: "text", source: "phone", label: "電話" },
      ]}
      advancedFilters={[
        {
          type: "select",
          source: "billingCycle",
          label: "結帳週期",
          choices: [
            { id: "WEEKLY", name: "每週結帳" },
            { id: "MONTHLY", name: "每月結帳" },
          ],
        },
      ]}
      exportConfig={{
        filename: "supplier_export",
        format: "excel",
        columns: [
          { header: "供應商名稱", key: "name", width: 20 },
          { header: "聯絡人", key: "contact", width: 15 },
          { header: "電話", key: "phone", width: 15 },
          { header: "結帳週期", key: "billingCycle", width: 12 },
          { header: "備註", key: "note", width: 25 },
        ]
      }}
    >
      <StyledListDatagrid>
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
    </StyledListWrapper>
  </List>
);

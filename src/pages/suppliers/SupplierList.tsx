import {
  List,
  TextField,
  FunctionField,
} from "react-admin";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { ActionColumns } from "@/components/common/ActionColumns";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { SupplierStatusToggle } from "./SupplierStatusToggle";
import { ActiveStatusField } from "@/components/common/ActiveStatusField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";

export const SupplierList = () => (
  <List
    title="供應商紀錄"
    actions={false}
    empty={false}
    pagination={<CustomPaginationBar showPerPage={true} />} perPage={10}
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
            { id: "BIWEEKLY", name: "每兩週結帳" },
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

        {/*  統一高度 + 置中 */}
        <FunctionField
          label="狀態"
          className="cell-centered"
          render={() => <ActiveStatusField />}
        />

        {/*  Switch 完美置中 */}
        <FunctionField
          label="切換狀態"
          className="cell-centered"
          render={() => <SupplierStatusToggle />}
        />

        {/*  操作欄固定寬度 + 置中 */}
        <FunctionField
          label="操作"
          source="action"
          className="column-action"
          render={() => <ActionColumns />}
        />

      </StyledListDatagrid>
    </StyledListWrapper>
  </List>
);

import {
  List,
  TextField,
  FunctionField,
} from "react-admin";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";

/**
 * 客戶管理列表
 */
export const OrderCustomerList = () => (
  <List
    title="客戶管理"
    actions={false}
    empty={false}
    pagination={<CustomPaginationBar showPerPage={true} />}
    perPage={10}
  >
    <StyledListWrapper
      quickFilters={[
        { type: "text", source: "name", label: "客戶名稱" },
        { type: "text", source: "contactPerson", label: "聯絡人" },
      ]}
      advancedFilters={[
        { type: "text", source: "phone", label: "電話" },
        { type: "text", source: "address", label: "地址" },
        { type: "select", 
          source: "billingCycle", 
          label: "結帳週期",
          choices: [
            { id: "WEEKLY", name: "每週" },
            { id: "BIWEEKLY", name: "每兩週" },
            { id: "MONTHLY", name: "每月" },
          ],
        },
      ]}
      exportConfig={{
        filename: "order_customer_export",
        format: "excel",
        columns: [
          { header: "客戶名稱", key: "name", width: 20 },
          { header: "聯絡人", key: "contactPerson", width: 15 },
          { header: "電話", key: "phone", width: 15 },
          { header: "地址", key: "address", width: 20 },
          { header: "結帳週期", key: "billingCycle", width: 12 },
          { header: "備註", key: "note", width: 20 },
        ],
      }}
    >
      <StyledListDatagrid>
        <TextField source="name" label="客戶名稱" />
        <TextField source="contactPerson" label="聯絡人" />
        <TextField source="phone" label="電話" />
        <TextField source="address" label="地址" />
        <TextField source="billingCycle" label="結帳週期" />
        <TextField source="note" label="備註" />

        {/* 操作欄（查看 / 編輯 / 刪除） */}
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

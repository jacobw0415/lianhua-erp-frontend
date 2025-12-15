import {
  List,
  TextField,
  BooleanField,
  DateField,
  FunctionField,
} from "react-admin";

import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";

/* =========================================================
 * Component
 * ========================================================= */

export const ProductCategoryList = () => {
  return (
    <List
      title="商品分類管理"
      actions={false}
      perPage={10}
      pagination={<CustomPaginationBar showPerPage />}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "code", label: "分類代碼" },
          { type: "text", source: "name", label: "分類名稱" },
        ]}
        advancedFilters={[
          {
            type: "select",
            source: "active",
            label: "狀態",
            choices: [
              { id: true, name: "啟用" },
              { id: false, name: "停用" },
            ],
          },
        ]}
      >
        <StyledListDatagrid>
          {/* 分類代碼 */}
          <TextField source="code" label="分類代碼" />

          {/* 分類名稱 */}
          <TextField source="name" label="分類名稱" />

          {/* 是否啟用 */}
          <BooleanField source="active" label="啟用" />

          {/* 建立時間 */}
          <DateField
            source="createdAt"
            label="建立時間"
            showTime
          />

          {/* 更新時間 */}
          <DateField
            source="updatedAt"
            label="更新時間"
            showTime
          />

          {/* 操作 */}
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
};
import { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  List,
  TextField,
  FunctionField,
} from "react-admin";

import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";
import { ActiveStatusField } from "@/components/common/ActiveStatusField";
import { ProductCategoryStatusToggle } from "./ProductCategoryStatusToggle";

/* =========================================================
 * Component
 * ========================================================= */

export const ProductCategoryList = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  return (
    <List
      title="商品分類管理"
      actions={false}
      empty={false}
      perPage={10}
      pagination={<CustomPaginationBar showPerPage={true} />}
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
        <ResponsiveListDatagrid tabletLayout="card">

          <TextField source="code" label="分類代碼" />

          <TextField source="name" label="分類名稱" />

          <FunctionField
            label="狀態"
            className="cell-centered"
            render={() => <ActiveStatusField />}
          />

          <FunctionField
            label="切換狀態"
            className="cell-centered"
            render={() => <ProductCategoryStatusToggle />}
          />

          <TextField source="description" label="描述" />


          <FunctionField
            label="操作"
            source="action"
            className="column-action"
            render={() => <ActionColumns />}
          />

        </ResponsiveListDatagrid>
      </StyledListWrapper>
    </List>
  );
};
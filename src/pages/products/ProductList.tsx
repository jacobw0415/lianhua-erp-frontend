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
import { CurrencyField } from "@/components/money/CurrencyField";
import { ProductStatusToggle } from "./ProductStatusToggle";

/* =========================================================
 * Component
 * ========================================================= */

export const ProductList = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  return (
    <List
      title="商品清單"
      actions={false}
      empty={false}
      perPage={10}
      pagination={<CustomPaginationBar showPerPage />}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "categoryCode", label: "分類代碼" },
          { type: "text", source: "name", label: "商品名稱" },
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
        <ResponsiveListDatagrid>

          {/* ⭐ 顯示可以用 category.code，但搜尋不能 */}
          <TextField source="category.code" label="分類代碼" />

           <TextField source="name" label="商品名稱" />

          <CurrencyField source="unitPrice" label="單價" />

          <FunctionField
            label="狀態"
            className="cell-centered"
            render={() => <ActiveStatusField />}
          />

           <FunctionField
             label="切換狀態"
             className="cell-centered"
             render={() => <ProductStatusToggle />}
           />

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

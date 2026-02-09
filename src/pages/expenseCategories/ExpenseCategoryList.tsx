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
import { ExpenseCategoryStatusToggle } from "./ExpenseCategoryStatusToggle";

/* -------------------------------------------------------
 * 🔐 頻率類型顯示函數
 * ------------------------------------------------------- */
const getFrequencyTypeLabel = (frequencyType?: string) => {
  switch (frequencyType) {
    case 'MONTHLY':
      return '每月一次';
    case 'BIWEEKLY':
      return '每兩週一次';
    case 'DAILY':
      return '每日一次';
    case 'UNLIMITED':
      return '無限制';
    default:
      return '每日一次'; // 預設值
  }
};

/* =========================================================
 * Component
 * ========================================================= */

export const ExpenseCategoryList = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  return (
    <List
      title="費用分類管理"
      actions={false}
      empty={false}
      perPage={10}
      pagination={<CustomPaginationBar showPerPage={true} />}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "accountCode", label: "會計科目代碼" },
          { type: "text", source: "name", label: "費用分類名稱" },
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

          <TextField source="accountCode" label="會計科目代碼" />

          <TextField source="name" label="費用分類名稱" />

          <FunctionField
            label="費用頻率"
            render={(record: { frequencyType?: string }) => 
              getFrequencyTypeLabel(record.frequencyType)
            }
          />

          <FunctionField
            label="狀態"
            className="cell-centered"
            render={() => <ActiveStatusField />}
          />

          <FunctionField
            label="切換狀態"
            className="cell-centered"
            render={() => <ExpenseCategoryStatusToggle />}
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


import { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  List,
  TextField,
  FunctionField,
} from "react-admin";
import { useTranslation } from "react-i18next";

import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";
import { ActiveStatusField } from "@/components/common/ActiveStatusField";
import { ExpenseCategoryStatusToggle } from "./ExpenseCategoryStatusToggle";


/* =========================================================
 * Component
 * ========================================================= */

export const ExpenseCategoryList = () => {
  const theme = useTheme();
  const { t } = useTranslation("common");
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
          { type: "text", source: "accountCode", label: t("filters.accountCode") },
          { type: "text", source: "name", label: t("filters.expenseCategoryName") },
        ]}
        advancedFilters={[
          {
            type: "select",
            source: "active",
            label: "啟用狀態",
            choices: [
              { id: "true", name: "啟用" },
              { id: "false", name: "終止" },
            ],
          },
        ]}
      >
        <ResponsiveListDatagrid tabletLayout="card">

          <TextField source="accountCode" label="會計科目代碼" />

          <TextField source="name" label={t("filters.expenseCategoryName")} />

          <FunctionField
            label={t("filters.feeFrequency")}
            render={(record: { frequencyType?: string }) => 
              (() => {
                switch (record.frequencyType) {
                  case "MONTHLY":
                    return t("filters.frequencyTypeMonthly");
                  case "BIWEEKLY":
                    return t("filters.frequencyTypeBiweekly");
                  case "DAILY":
                    return t("filters.frequencyTypeDaily");
                  case "UNLIMITED":
                    return t("filters.frequencyTypeUnlimited");
                  default:
                    return t("filters.frequencyTypeDaily");
                }
              })()
            }
          />

          <FunctionField
            label={t("filters.activeStatus")}
            className="cell-centered"
            render={() => <ActiveStatusField />}
          />

          <FunctionField
            label={t("filters.expenseCategoryToggleStatus")}
            className="cell-centered"
            render={() => <ExpenseCategoryStatusToggle />}
          />

          <TextField source="description" label={t("filters.description")} />

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


import { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  List,
  TextField,
  FunctionField,
  useRecordContext,
} from "react-admin";
import { Chip } from "@mui/material";

import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { ActionColumns } from "@/components/common/ActionColumns";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { EmployeeStatusToggle } from "./EmployeeStatusToggle";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { CurrencyField } from "@/components/money/CurrencyField";

/* =========================================================
 * 狀態顯示組件
 * ========================================================= */
const StatusField = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const record = useRecordContext<{ status: "ACTIVE" | "INACTIVE" }>();
  if (!record) return null;

  const isActive = record.status === "ACTIVE";
  return (
    <Chip
      size="small"
      label={isActive ? "啟用" : "停用"}
      color={isActive ? "success" : "default"}
      variant="outlined"
    />
  );
};

export const EmployeeList = () => (
  <List
    title="員工管理"
    actions={false}
    empty={false}
    pagination={<CustomPaginationBar showPerPage={true} />}
    perPage={10}
  >
    <StyledListWrapper
      quickFilters={[
        { type: "text", source: "fullName", label: "員工姓名" },
        { type: "text", source: "position", label: "職位" },
      ]}
      advancedFilters={[
        {
          type: "select",
          source: "status",
          label: "狀態",
          choices: [
            { id: "ACTIVE", name: "啟用" },
            { id: "INACTIVE", name: "停用" },
          ],
        },
      ]}
      exportConfig={{
        filename: "employee_export",
        format: "excel",
        columns: [
          { header: "員工姓名", key: "fullName", width: 20 },
          { header: "職位", key: "position", width: 15 },
          { header: "薪資", key: "salary", width: 15 },
          { header: "聘用日期", key: "hireDate", width: 15 },
          { header: "狀態", key: "status", width: 12 },
        ],
      }}
    >
      <ResponsiveListDatagrid rowClick={false}>
        <TextField source="fullName" label="員工姓名" />
        <TextField source="position" label="職位" />
        <CurrencyField source="salary" label="薪資" />
        <TextField source="hireDate" label="聘用日期" />

        {/* 狀態顯示 */}
        <FunctionField
          label="狀態"
          className="cell-centered"
          render={() => <StatusField />}
        />

        {/* Switch 完美置中 */}
        <FunctionField
          label="切換狀態"
          className="cell-centered"
          render={() => <EmployeeStatusToggle />}
        />

        {/* 操作欄固定寬度 + 置中 */}
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


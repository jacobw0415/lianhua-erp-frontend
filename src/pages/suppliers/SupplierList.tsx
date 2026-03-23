import { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  List,
  TextField,
  FunctionField,
  type RaRecord,
} from "react-admin";

import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { ActionColumns } from "@/components/common/ActionColumns";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { SupplierStatusToggle } from "./SupplierStatusToggle";
import { ActiveStatusField } from "@/components/common/ActiveStatusField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { getEnumLabel } from "@/utils/enumValueMap";

export const SupplierList = () => {
  const theme = useTheme();

  // 套用 Scrollbar 樣式 (包含 Cleanup 機制)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <List
      title="供應商紀錄"
      actions={false}
      empty={false}
      pagination={<CustomPaginationBar showPerPage={true} />} perPage={10}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "name", label: "供應商名稱" },
          { type: "text", source: "contact", label: "聯絡人" },
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
          {
            type: "select",
            source: "active",
            label: "啟用狀態",
            choices: [
              { id: "true", name: "啟用" },
              { id: "false", name: "終止" },
            ],
          },
          { type: "text", source: "note", label: "備註" },

        ]}
        exportConfig={{
          filename: "supplier_export",
          format: "excel",
          exportPickerTitle: "匯出供應商",
          exportColumnPicker: false,
          backendExport: {
            resource: "suppliers",
            defaultFormat: "xlsx",
          },
          // 新規格未提及 columns query，因此避免送出 columns=...
          columns: [],
        }}
      >
        <ResponsiveListDatagrid tabletLayout="card">

          <TextField source="name" label="供應商名稱" />
          <TextField source="contact" label="聯絡人" />
          <TextField source="phone" label="電話" />
          <FunctionField
            label="結帳週期"
            render={(record: RaRecord) =>
              getEnumLabel("billingCycle", (record as any).billingCycle)
            }
          />
          <TextField source="note" label="備註" />

          {/* 統一高度 + 置中 */}
          <FunctionField
            label="狀態"
            className="cell-centered"
            render={() => <ActiveStatusField />}
          />

          {/* Switch 完美置中 */}
          <FunctionField
            label="切換狀態"
            className="cell-centered"
            render={() => <SupplierStatusToggle />}
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
};
import { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  List,
  TextField,
  FunctionField,
  type RaRecord,
} from "react-admin";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";

/** 角色與權限列表（/api/roles） */
export const RoleList = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <List
      title="角色與權限"
      actions={false}
      empty={false}
      pagination={<CustomPaginationBar showPerPage={true} />}
      perPage={10}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "name", label: "角色代碼" },
          { type: "text", source: "displayName", label: "角色名稱" },
        ]}
      >
        <StyledListDatagrid>
          <TextField source="name" label="角色代碼" />
          <TextField source="displayName" label="角色名稱" />
          <TextField source="description" label="說明" />

          {/* 若有 permissions 欄位，以逗號顯示 */}
          <FunctionField
            label="權限"
            source="permissions"
            render={(record: RaRecord) => {
              const permissions = (record as any).permissions as unknown;
              if (Array.isArray(permissions)) return permissions.join(", ");
              if (typeof permissions === "string") return permissions;
              return "-";
            }}
          />

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

RoleList.displayName = "RoleList";


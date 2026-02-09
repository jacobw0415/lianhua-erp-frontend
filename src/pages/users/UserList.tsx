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
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActiveStatusField } from "@/components/common/ActiveStatusField";
import { ActionColumns } from "@/components/common/ActionColumns";

/** 使用者列表（/api/users） */
export const UserList = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <List
      title="使用者管理"
      actions={false}
      empty={false}
      pagination={<CustomPaginationBar showPerPage={true} />}
      perPage={10}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "username", label: "帳號" },
          { type: "text", source: "fullName", label: "姓名" },
          { type: "text", source: "email", label: "Email" },
        ]}
        advancedFilters={[
          {
            type: "select",
            source: "enabled",
            label: "啟用狀態",
            choices: [
              { id: true, name: "啟用" },
              { id: false, name: "停用" },
            ],
          },
        ]}
      >
        <ResponsiveListDatagrid>
          <TextField source="username" label="帳號" />
          <TextField source="fullName" label="姓名" />
          <TextField source="email" label="Email" />

          {/* 啟用狀態顯示（對應 enabled 欄位） */}
          <FunctionField
            label="狀態"
            className="cell-centered"
            render={(record: RaRecord) => (
              <ActiveStatusField source="enabled" label="狀態" />
            )}
          />

          {/* 角色清單（以逗號顯示） */}
          <FunctionField
            label="角色"
            source="roles"
            render={(record: RaRecord) => {
              const roles = (record as any).roles as unknown;
              if (Array.isArray(roles)) return roles.join(", ");
              if (typeof roles === "string") return roles;
              return "-";
            }}
          />

          {/* 操作欄：沿用共用 ActionColumns */}
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

UserList.displayName = "UserList";


import { useEffect } from "react";
import { useTheme, Box } from "@mui/material";
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
import { getRoleDisplayName } from "@/constants/userRoles";

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
        <Box
          sx={{
            width: "100%",
            "& .RaDatagrid-table th:nth-of-type(1), & .RaDatagrid-table td:nth-of-type(1)": {
              width: 100,
              minWidth: 100,
              maxWidth: 100,
              boxSizing: "border-box",
            },
            "& .RaDatagrid-table th:nth-of-type(2), & .RaDatagrid-table td:nth-of-type(2)": {
              width: 112,
              minWidth: 88,
              maxWidth: 112,
              boxSizing: "border-box",
            },
          }}
        >
          <ResponsiveListDatagrid tabletLayout="card">
            <TextField source="username" label="帳號" />
            <TextField source="fullName" label="姓名" />
            <TextField source="email" label="Email" />

          {/* 啟用狀態顯示（對應 enabled 欄位） */}
          <FunctionField
            label="狀態"
            className="cell-centered"
            render={() => (
              <ActiveStatusField source="enabled" label="狀態" />
            )}
          />

          {/* 角色清單（顯示中文名稱） */}
          <FunctionField
            label="角色"
            source="roles"
            render={(record: RaRecord) => {
              const roles = (record as any).roles as unknown;
              if (Array.isArray(roles) && roles.length > 0) {
                return roles.map((r: string) => getRoleDisplayName(String(r))).join("、");
              }
              if (typeof roles === "string") return getRoleDisplayName(roles);
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
        </Box>
      </StyledListWrapper>
    </List>
  );
};

UserList.displayName = "UserList";


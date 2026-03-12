import { useEffect, useMemo } from "react";
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
import { OnlineStatusChip } from "@/components/common/OnlineStatusChip";
import { ActionColumns } from "@/components/common/ActionColumns";
import { getRoleDisplayName } from "@/constants/userRoles";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
// 確保匯入 OnlineUserDto 型別
import type { OnlineUserDto } from "@/types/onlineUsers";

/**
 * 使用者列表（/api/users）
 * 修正重點：
 * 1. 明確指定 map((u: OnlineUserDto)) 解決 TypeScript 隱式 any 警告。
 * 2. 統一使用 String(id) 進行 Set 比對，確保跨裝置狀態同步。
 */
export const UserList = () => {
  const theme = useTheme();
  
  // 從 Context 獲取即時在線名單
  const { onlineUsers } = useOnlineUsers();

  // 將在線用戶 ID 轉化為 Set 並統一轉為 String 提升比對效能與準確性
  const onlineUserIds = useMemo(
    () => new Set(onlineUsers.map((u: OnlineUserDto) => String(u.id))),
    [onlineUsers]
  );

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
              { id: "true", name: "啟用" },
              { id: "false", name: "終止" },
            ],
          },
        ]}
      >
        <Box
          sx={{
            width: "100%",
            // 第 1 欄：上線燈號
            "& .RaDatagrid-table th:nth-of-type(1), & .RaDatagrid-table td:nth-of-type(1)": {
              width: 80,
              minWidth: 72,
              maxWidth: 96,
              boxSizing: "border-box",
            },
            // 第 2 欄：帳號
            "& .RaDatagrid-table th:nth-of-type(2), & .RaDatagrid-table td:nth-of-type(2)": {
              width: 120,
              minWidth: 100,
              maxWidth: 140,
              boxSizing: "border-box",
            },
          }}
        >
          <ResponsiveListDatagrid tabletLayout="card" rowClick={false}>
            {/* 上線狀態欄位 */}
            <FunctionField
              label="上線狀態"
              className="cell-centered"
              render={(record: RaRecord) => {
                if (!record) return null;
                
                // 使用 String 強制轉型比對，確保 isOnline 判斷正確
                const isOnline = onlineUserIds.has(String(record.id));
                
                return <OnlineStatusChip isOnline={isOnline} />;
              }}
            />

            <TextField source="username" label="帳號" />
            <TextField source="fullName" label="姓名" />
            <TextField source="email" label="Email" />

            {/* 啟用狀態顯示 */}
            <FunctionField
              label="狀態"
              className="cell-centered"
              render={() => (
                <ActiveStatusField source="enabled" label="狀態" />
              )}
            />

            {/* 角色清單 */}
            <FunctionField
              label="角色"
              source="roles"
              render={(record: RaRecord) => {
                const roles = (record as RaRecord & { roles?: string[] | string }).roles;
                if (Array.isArray(roles) && roles.length > 0) {
                  return roles.map((r: string) => getRoleDisplayName(String(r))).join("、");
                }
                if (typeof roles === "string") return getRoleDisplayName(roles);
                return "-";
              }}
            />

            {/* 操作欄 */}
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
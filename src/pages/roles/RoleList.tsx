import { useEffect } from "react";
import { useTheme, Box, Chip } from "@mui/material";
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
import { ActionColumns } from "@/components/common/ActionColumns";
import { getPermissionLabel } from "@/constants/permissionLabels";

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
        <ResponsiveListDatagrid>
          <TextField source="name" label="角色代碼" />
          <TextField source="displayName" label="角色名稱" />
          <TextField source="description" label="說明" />

          {/* 權限以中文 Chips 呈現 */}
          <FunctionField
            label="權限"
            source="permissions"
            render={(record: RaRecord) => {
              const raw = (record as any).permissions as unknown;
              const list: string[] = Array.isArray(raw)
                ? raw
                : typeof raw === "string"
                  ? raw.split(",").map((s: string) => s.trim()).filter(Boolean)
                  : [];
              if (list.length === 0) return "—";
              const chipBg =
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.15)"
                  : "#e8e8e8";
              const chipText =
                theme.palette.mode === "dark"
                  ? theme.palette.common.white
                  : theme.palette.text.primary;
              return (
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                    alignItems: "center",
                  }}
                >
                  {list.map((code) => (
                    <Chip
                      key={code}
                      label={getPermissionLabel(code)}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: "0.75rem",
                        bgcolor: chipBg,
                        color: chipText,
                        border: "1px solid rgba(0,0,0,0.12)",
                      }}
                    />
                  ))}
                </Box>
              );
            }}
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

RoleList.displayName = "RoleList";


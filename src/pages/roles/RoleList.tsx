import { useEffect } from "react";
import { useTheme, Box, Chip, Card, CardContent, Typography, Divider } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { List, type RaRecord, useListContext } from "react-admin";

import { SettingsSectionWrapper } from "@/components/common/SettingsSectionWrapper";
import { getPermissionLabel } from "@/constants/permissionLabels";
import { getRoleDisplayName } from "@/constants/userRoles";

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
      pagination={false}
    >
      <SettingsSectionWrapper>
        <RoleOverviewCards />
      </SettingsSectionWrapper>
    </List>
  );
};

RoleList.displayName = "RoleList";

const RoleOverviewCards = () => {
  const theme = useTheme();
  const { data, isLoading } = useListContext<RaRecord>();

  const records: RaRecord[] = data ? Object.values(data) : [];

  const chipBg =
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.15)"
      : "#e8e8e8";
  const chipText =
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.text.primary;

  if (isLoading) {
    return null;
  }

  if (!records.length) {
    return (
      <Box
        sx={{
          py: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          目前沒有可顯示的角色。
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1fr 1fr",
        },
        gap: 2,
        pb: 2,
      }}
    >
      {records.map((record) => {
        const role = record as any;
        const name = role.name ?? "—";
        const displayName = role.displayName ?? name;
        const roleDisplayName = getRoleDisplayName(name) || displayName || name || "—";
        const description = role.description ?? "";
        const rawPermissions = role.permissions as unknown;
        const permissions: string[] = Array.isArray(rawPermissions)
          ? rawPermissions
          : typeof rawPermissions === "string"
            ? rawPermissions.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [];

        return (
          <Card
            key={record.id}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* 區塊一：基本資訊（與 RoleShow 風格對齊） */}
              <Box component="section">
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  基本資訊
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                <Box
                  sx={{
                    "& .role-row": {
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: 1.5,
                      alignItems: "flex-start",
                      py: 0.5,
                    },
                    "& .role-label": {
                      color: "text.secondary",
                      typography: "body2",
                      whiteSpace: "nowrap",
                    },
                    "& .role-value": { typography: "body2" },
                  }}
                >
                  <Box className="role-row">
                    <Typography className="role-label" component="span">
                      角色名稱
                    </Typography>
                    <Typography className="role-value" component="span">
                      {roleDisplayName || "—"}
                    </Typography>
                  </Box>
                  <Box className="role-row">
                    <Typography className="role-label" component="span">
                      說明
                    </Typography>
                    <Typography className="role-value" component="span">
                      {description || "—"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* 區塊二：權限 Chips */}
              <Box component="section">
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  權限
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
                {permissions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    此角色尚未設定權限
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                      alignItems: "center",
                    }}
                  >
                    {permissions.map((code) => (
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
                )}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};


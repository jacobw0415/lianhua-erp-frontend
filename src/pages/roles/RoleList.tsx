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

  const ROLE_DISPLAY_ORDER = ["ROLE_SUPER_ADMIN", "ROLE_ADMIN", "ROLE_USER"];
  const sortedRecords = [...records].sort((a, b) => {
    const nameA = (a as { name?: string }).name ?? "";
    const nameB = (b as { name?: string }).name ?? "";
    const iA = ROLE_DISPLAY_ORDER.indexOf(nameA);
    const iB = ROLE_DISPLAY_ORDER.indexOf(nameB);
    if (iA === -1 && iB === -1) return nameA.localeCompare(nameB);
    if (iA === -1) return 1;
    if (iB === -1) return -1;
    return iA - iB;
  });

  const chipBg =
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.15)"
      : "#e8e8e8";
  const chipText =
    theme.palette.mode === "dark"
      ? theme.palette.common.white
      : theme.palette.text.primary;

  const getPermissionChipStyle = (code: string) => {
    const normalized = (code || "").trim();

    let variant: "view" | "edit" | "manage" = "edit";

    if (normalized.startsWith("ROLE_") || normalized.startsWith("admin:")) {
      variant = "manage";
    } else if (normalized.includes(":view") || normalized.endsWith("_READ")) {
      variant = "view";
    } else {
      variant = "edit";
    }

    if (variant === "view") {
      return {
        bgcolor: chipBg,
        color: chipText,
        border: "1px solid",
        borderColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.24)"
            : "rgba(0,0,0,0.12)",
      };
    }

    if (variant === "edit") {
      return {
        bgcolor:
          theme.palette.mode === "dark"
            ? "rgba(76,175,80,0.18)"
            : "rgba(76,175,80,0.1)",
        color:
          theme.palette.mode === "dark"
            ? "#C8E6C9"
            : theme.palette.success.main,
        border: "1px solid",
        borderColor:
          theme.palette.mode === "dark"
            ? "rgba(200,230,201,0.4)"
            : "rgba(76,175,80,0.4)",
      };
    }

    return {
      bgcolor:
        theme.palette.mode === "dark"
          ? "rgba(171,71,188,0.22)"
          : "rgba(171,71,188,0.12)",
      color:
        theme.palette.mode === "dark"
          ? "#F3E5F5"
          : theme.palette.secondary.main,
      border: "1px solid",
      borderColor:
        theme.palette.mode === "dark"
          ? "rgba(243,229,245,0.5)"
          : "rgba(171,71,188,0.5)",
    };
  };

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
        gridTemplateColumns: "1fr",
        gap: 2.5,
        pb: 2,
      }}
    >
      {sortedRecords.map((record) => {
        const role = record as any;
        const name = role.name ?? "—";
        const displayName = role.displayName ?? name;
        const roleDisplayName =
          getRoleDisplayName(name) || displayName || name || "—";
        const description = role.description ?? "";
        const rawPermissions = role.permissions as unknown;
        const permissions: string[] = Array.isArray(rawPermissions)
          ? rawPermissions
          : typeof rawPermissions === "string"
            ? rawPermissions
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [];

        const isSuperAdmin = name === "ROLE_SUPER_ADMIN";
        const isAdminRole = name === "ROLE_ADMIN";
        const tierLabel = isSuperAdmin
          ? "最高權限"
          : isAdminRole
            ? "管理員"
            : "一般角色";

        const sortedPermissions = [...permissions].sort((a, b) => {
          const [moduleA] = String(a).split(":");
          const [moduleB] = String(b).split(":");
          if (moduleA !== moduleB) return moduleA.localeCompare(moduleB);
          return String(a).localeCompare(String(b));
        });

        return (
          <Card
            key={record.id}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: isSuperAdmin ? "warning.main" : "divider",
              boxShadow: isSuperAdmin ? "0 0 0 1px rgba(255,193,7,0.4)" : "none",
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
              {/* 區塊零：角色標題與層級徽章 */}
              <Box
                component="header"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="text.primary"
                    noWrap
                  >
                    {roleDisplayName || "—"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                      lineHeight: 1.7,
                    }}
                    noWrap
                  >
                    {(description ||
                      (isSuperAdmin
                        ? "擁有全系統最高權限，可存取並管理所有模組與資料。"
                        : "此角色的權限設定可在下方檢視。")
                    ).replace(/\badmin:manage\b/gi, "管理其他管理員")}
                  </Typography>
                </Box>
                <Chip
                  label={tierLabel}
                  size="small"
                  color={isSuperAdmin ? "warning" : isAdminRole ? "primary" : "default"}
                  sx={{
                    fontWeight: 600,
                    borderRadius: 1,
                    ...(isSuperAdmin && {
                      border: "1px solid",
                      borderColor: "warning.light",
                    }),
                  }}
                />
              </Box>

              {/* 區塊一：基本資訊 */}
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
                      gridTemplateColumns: "90px 1fr",
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
                {sortedPermissions.length === 0 ? (
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
                    {sortedPermissions.map((code) => (
                      <Chip
                        key={code}
                        label={getPermissionLabel(code)}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: "0.75rem",
                          borderRadius: 1,
                          ...getPermissionChipStyle(code),
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


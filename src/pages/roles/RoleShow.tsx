import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Alert,
  Button,
  Skeleton,
  Divider,
  Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BadgeIcon from "@mui/icons-material/Badge";
import { useShowController, useResourceContext } from "react-admin";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  CONTENT_BOX_SX,
  FORM_CONTAINER_SX,
} from "@/constants/layoutConstants";
import {
  DETAIL_SIDEBAR_WIDTH,
  DETAIL_MAIN_MAX_WIDTH,
  DETAIL_LAYOUT_MAX_WIDTH,
  DETAIL_CARD_MAX_WIDTH,
} from "@/constants/layoutConstants";
import { getPermissionLabel } from "@/constants/permissionLabels";

const SECTION_IDS = {
  basic: "role-section-basic",
  permissions: "role-section-permissions",
} as const;

function parsePermissions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((s): s is string => typeof s === "string");
  if (typeof raw === "string")
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

/** 載入中骨架（與個人資料頁風格一致） */
const RoleShowSkeleton: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", lg: "row" },
      gap: 2,
      width: "100%",
      maxWidth: { xs: DETAIL_CARD_MAX_WIDTH, lg: "none" },
    }}
  >
    <Card
      elevation={0}
      sx={{
        display: { xs: "none", lg: "block" },
        width: DETAIL_SIDEBAR_WIDTH,
        flexShrink: 0,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Skeleton variant="circular" width={96} height={96} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={220} height={22} sx={{ mt: 1 }} />
        <Skeleton variant="rounded" width={120} height={36} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
    <Card
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 0,
        maxWidth: { lg: DETAIL_MAIN_MAX_WIDTH },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={FORM_CONTAINER_SX}>
        <Box sx={{ display: { xs: "flex", lg: "none" }, flexDirection: "column", alignItems: "center", py: 3, mb: 2 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width={160} height={32} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton variant="text" width="28%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="85%" sx={{ mb: 2 }} />
        <Divider sx={{ my: 3 }} />
        <Skeleton variant="text" width="32%" height={24} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" width={80} height={28} />
          ))}
        </Box>
      </CardContent>
    </Card>
  </Box>
);

/**
 * 角色詳情頁（唯讀）
 * 版面與個人資料頁一致：左側摘要 + 右側區塊化內容，符合 Google／業界 ERP 設定頁慣例
 */
export const RoleShow: React.FC = () => {
  const theme = useTheme();
  const resource = useResourceContext();
  const { record, isLoading, error, refetch } = useShowController();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  if (isLoading) {
    return (
      <Box component="main" sx={{ ...CONTENT_BOX_SX, minHeight: 320 }} aria-label="角色詳情頁面">
        <Typography variant="h5" component="h1" sx={{ mb: 0.5 }}>
          角色詳情
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          檢視角色基本資訊與權限
        </Typography>
        <RoleShowSkeleton />
      </Box>
    );
  }

  if (error || !record) {
    return (
      <Box component="main" sx={{ ...CONTENT_BOX_SX, minHeight: 320 }} aria-label="角色詳情頁面">
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          角色詳情
        </Typography>
        <Card sx={{ maxWidth: DETAIL_CARD_MAX_WIDTH }}>
          <CardContent sx={FORM_CONTAINER_SX}>
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon />}
              sx={{ mb: 2 }}
              aria-live="assertive"
            >
              無法載入角色資料，請檢查網路連線後重試。
            </Alert>
            <Button variant="contained" onClick={() => refetch()} aria-label="重試載入角色">
              重試
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const displayName = (record as { displayName?: string }).displayName ?? (record as { name?: string }).name ?? "—";
  const description = (record as { description?: string }).description ?? "";
  const name = (record as { name?: string }).name ?? "—";
  const permissions = parsePermissions((record as { permissions?: unknown }).permissions);

  const chipBg = theme.palette.mode === "dark" ? "rgba(255,255,255,0.15)" : "#e8e8e8";
  const chipText = theme.palette.mode === "dark" ? theme.palette.common.white : theme.palette.text.primary;

  return (
    <Box component="main" sx={{ ...CONTENT_BOX_SX }} aria-label="角色詳情頁面">
      <Typography variant="h5" component="h1" sx={{ mb: 0.5 }} id="role-show-page-title">
        角色詳情
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        檢視角色基本資訊與權限
      </Typography>
      <Box sx={{ display: { xs: "block", lg: "none" }, mb: 1 }}>
        <Button
          component={RouterLink}
          to={`/${resource ?? "roles"}`}
          variant="text"
          size="small"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: "none" }}
          aria-label="返回角色列表"
        >
          返回列表
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          alignItems: "stretch",
          maxWidth: { xs: DETAIL_CARD_MAX_WIDTH, lg: DETAIL_LAYOUT_MAX_WIDTH },
          marginLeft: { lg: "auto" },
          marginRight: { lg: "auto" },
        }}
      >
        {/* 桌面版：左側欄（角色摘要） */}
        <Card
          elevation={0}
          sx={{
            display: { xs: "none", lg: "flex" },
            width: DETAIL_SIDEBAR_WIDTH,
            flexShrink: 0,
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              py: 3,
              px: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: 1,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
              aria-hidden
            >
              <BadgeIcon sx={{ fontSize: 48 }} />
            </Box>
            <Typography variant="subtitle1" component="p" fontWeight={600}>
              {displayName}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
            <Button
              component={RouterLink}
              to={`/${resource}`}
              variant="text"
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2, textTransform: "none" }}
              aria-label="返回角色列表"
            >
              返回列表
            </Button>
          </Box>
        </Card>

        {/* 右側主內容 */}
        <Card
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            maxWidth: { lg: DETAIL_MAIN_MAX_WIDTH },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* 平板與手機：頂部摘要區 */}
          <Box
            sx={{
              display: { xs: "flex", lg: "none" },
              py: 3,
              px: { xs: 2, sm: 3 },
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "action.hover",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1.5,
              }}
              aria-hidden
            >
              <BadgeIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" component="p" fontWeight={600}>
              {displayName}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>

          <CardContent sx={{ ...FORM_CONTAINER_SX }}>
            <Box component="section" aria-labelledby={SECTION_IDS.basic}>
              <Typography
                id={SECTION_IDS.basic}
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                sx={{ mb: 1 }}
              >
                基本資訊
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  "& .role-row": {
                    display: "grid",
                    gridTemplateColumns: "100px 1fr",
                    gap: 2,
                    alignItems: "center",
                    py: 1,
                    px: 1,
                    borderRadius: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-of-type": { borderBottom: "none" },
                    "&:hover": { bgcolor: "action.hover" },
                  },
                  "& .role-label": { color: "text.secondary", typography: "body2" },
                  "& .role-value": { typography: "body2" },
                }}
              >
                <Box className="role-row">
                  <Typography className="role-label" component="span">
                    角色代碼
                  </Typography>
                  <Typography className="role-value" component="span">
                    {name}
                  </Typography>
                </Box>
                <Box className="role-row">
                  <Typography className="role-label" component="span">
                    角色名稱
                  </Typography>
                  <Typography className="role-value" component="span">
                    {displayName}
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

            <Divider sx={{ my: 3 }} />

            <Box component="section" aria-labelledby={SECTION_IDS.permissions}>
              <Typography
                id={SECTION_IDS.permissions}
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
                sx={{ mb: 1 }}
              >
                權限
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {permissions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  此角色未設定權限
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.75,
                    alignItems: "center",
                  }}
                >
                  {permissions.map((code) => (
                    <Chip
                      key={code}
                      label={getPermissionLabel(code)}
                      size="small"
                      sx={{
                        height: 28,
                        fontSize: "0.8125rem",
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
      </Box>
    </Box>
  );
};

RoleShow.displayName = "RoleShow";

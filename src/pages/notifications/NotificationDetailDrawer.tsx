import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useIsMobile, useIsSmallScreen } from "@/hooks/useIsMobile";
import { useTheme } from "@mui/material";

export interface NotificationDetail {
  id: number | string;
  title: string;
  content: string;
  targetType?: string;
  targetId?: number | string;
  createdAt: string;
  read: boolean;
}

interface NotificationDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  notification?: NotificationDetail;
}

export const NotificationDetailDrawer: React.FC<NotificationDetailDrawerProps> = ({
  open,
  onClose,
  notification,
}) => {
  const theme = useTheme();
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();

  if (!notification) return null;

  const { title, content, targetType, targetId, createdAt, read } =
    notification;

  return (
    <Drawer
      anchor={isSmallScreen ? "bottom" : "right"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isSmallScreen ? "100%" : { xs: "100%", sm: 480 },
          maxWidth: isSmallScreen ? "100%" : { xs: "100%", sm: 480 },
          ...(isSmallScreen && {
            maxHeight: "80vh",
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }),
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            mb: { xs: 1.5, sm: 2 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: { xs: "1rem", sm: "1.2rem" },
                fontWeight: 600,
                lineHeight: 1.4,
                wordBreak: "break-word",
              }}
            >
              通知內容
            </Typography>
            <Typography
              variant="caption"
              sx={{ mt: 0.5, display: "block", color: "text.secondary" }}
            >
              狀態：{read ? "已讀" : "未讀"}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ flexShrink: 0 }}>
            <CloseIcon fontSize={isMobile ? "medium" : "small"} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: { xs: 1.5, sm: 2 }, flexShrink: 0 }} />

        {/* Scrollable content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: { xs: 0.5, sm: 0 },
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: theme.palette.divider,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: theme.palette.action.disabled,
            },
          }}
        >
          <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
            >
              主旨
            </Typography>
            <Typography
              fontWeight={600}
              sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" } }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
            >
              建立時間
            </Typography>
            <Typography
              sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
              color="text.primary"
            >
              {createdAt}
            </Typography>
          </Box>

          {(targetType || targetId) && (
            <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                關聯資料
              </Typography>
              <Typography
                sx={{ fontSize: { xs: "0.85rem", sm: "0.9rem" } }}
                color="text.primary"
              >
                {targetType || "-"} {targetId != null ? `#${targetId}` : ""}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
            >
              內容
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                color: "text.primary",
              }}
            >
              {content}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};


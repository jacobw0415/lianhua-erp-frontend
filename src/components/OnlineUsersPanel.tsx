import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  List,
  ListItem,
  ListItemText,
  Popover,
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { WS_CONNECTION_STATUS_LABEL } from "@/types/onlineUsers";
import { useState } from "react";
import dayjs from "dayjs";

/** 定義線上使用者資料結構 */
interface OnlineUser {
  id: string | number;
  username: string;
  fullName?: string;
  onlineAt: string | Date;
}

export function OnlineUsersPanel() {
  const { onlineUsers, loading, error, connectionStatus } = useOnlineUsers();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // 將 onlineUsers 斷言為正確的型別，解決 ts(7006)
  const users = onlineUsers as OnlineUser[];

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  // 修正 ts(7053)：使用 as keyof typeof 確保索引安全
  const statusLabel = WS_CONNECTION_STATUS_LABEL[connectionStatus as keyof typeof WS_CONNECTION_STATUS_LABEL];
  
  const statusColor =
    connectionStatus === "connected"
      ? "success.main"
      : connectionStatus === "error"
        ? "error.main"
        : "warning.main";

  return (
    <>
      <Tooltip title={`線上使用者 · ${statusLabel}`}>
        <IconButton color="inherit" onClick={handleOpen} size="small">
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            <PeopleIcon />
            {connectionStatus !== "idle" && (
              <Box
                component="span"
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: statusColor,
                  boxShadow:
                    connectionStatus === "connected"
                      ? "0 0 4px rgba(76, 175, 80, 0.9)"
                      : "none",
                }}
              />
            )}
          </Box>
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, minWidth: 220, maxWidth: 320 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">
              線上使用者 ({users.length})
            </Typography>
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: statusColor,
              }}
              title={statusLabel}
            />
          </Box>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          {connectionStatus === "reconnecting" && (
            <Typography variant="caption" color="warning.main" sx={{ display: "block", mb: 1 }}>
              連線中斷，正在自動重連…
            </Typography>
          )}
          {error && (
            <Typography variant="body2" color="error">
              {error.message}
            </Typography>
          )}
          {!loading && !error && users.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              目前無線上使用者
            </Typography>
          )}
          {!loading && users.length > 0 && (
            <List dense disablePadding>
              {users.map((u) => (
                <ListItem key={u.id} disablePadding sx={{ py: 0.25 }}>
                  <ListItemText
                    primary={u.fullName || u.username}
                    secondary={dayjs(u.onlineAt).format("HH:mm")}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
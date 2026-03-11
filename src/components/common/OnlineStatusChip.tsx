import { Box, Typography } from "@mui/material";

interface OnlineStatusChipProps {
  isOnline: boolean;
}

/** 上線／離線狀態 Chip，供 UserList 等列表使用 */
export function OnlineStatusChip({ isOnline }: OnlineStatusChipProps) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Typography
        variant="body2"
        color={isOnline ? "success.main" : "text.secondary"}
      >
        {isOnline ? "在線" : "離線"}
      </Typography>
      <Box
        component="span"
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: isOnline ? "success.main" : "grey.400",
          boxShadow: isOnline
            ? "0 0 4px rgba(76, 175, 80, 0.9)"
            : "none",
        }}
      />
    </Box>
  );
}

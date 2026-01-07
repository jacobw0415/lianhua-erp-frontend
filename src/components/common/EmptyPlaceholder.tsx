import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

/**
 * 空狀態佔位符組件
 * 符合現代網頁設計標準：
 * - 使用圖標 + 文字組合
 * - 清晰的視覺層次
 * - 友好的提示訊息
 */
export const EmptyPlaceholder = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "200px",
        gap: 1,
        py: 4,
      }}
    >
      <InboxIcon
        sx={{
          fontSize: 48,
          color: "text.disabled",
          opacity: 0.5,
        }}
      />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontSize: "0.9rem",
          fontWeight: 500,
        }}
      >
        目前尚無資料
      </Typography>
    </Box>
  );
};

import { Box, Typography } from "@mui/material";

export const EmptyPlaceholder = () => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.disabled",
        fontSize: "0.9rem",
        minHeight: "200px",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        目前尚無資料
      </Typography>
    </Box>
  );
};

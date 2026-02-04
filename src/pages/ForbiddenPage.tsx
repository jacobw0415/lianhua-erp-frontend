import { Box, Button, Typography } from "@mui/material";
import { useRedirect } from "react-admin";

export const ForbiddenPage = () => {
  const redirect = useRedirect();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        無權限存取
      </Typography>
      <Typography variant="body1" color="text.secondary">
        您的帳號目前無法操作此功能，若有疑問請聯絡系統管理員。
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => redirect("/")}
      >
        回到儀表板
      </Button>
    </Box>
  );
};

ForbiddenPage.displayName = "ForbiddenPage";


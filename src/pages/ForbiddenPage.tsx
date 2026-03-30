import { Box, Button, Typography } from "@mui/material";
import { useRedirect } from "react-admin";
import { useTranslation } from "react-i18next";

export const ForbiddenPage = () => {
  const redirect = useRedirect();
  const { t } = useTranslation("common");

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
        {t("forbidden.title")}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t("forbidden.message")}
      </Typography>
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={() => redirect("/")}
      >
        {t("forbidden.backHome")}
      </Button>
    </Box>
  );
};

ForbiddenPage.displayName = "ForbiddenPage";

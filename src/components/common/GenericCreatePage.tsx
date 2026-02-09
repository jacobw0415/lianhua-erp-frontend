import {
  Create,
  SimpleForm,
  Toolbar,
  SaveButton,
  useRedirect,
} from "react-admin";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { FORM_MAX_WIDTH } from "@/constants/layoutConstants";

interface GenericCreatePageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  width?: string;
  /** 可選：在送出前轉換 payload（例如移除 confirmPassword） */
  transform?: (data: any) => any;
}

const CustomToolbar = ({ onBack }: { onBack: () => void }) => (
  <Toolbar
    sx={{
      display: "flex",
      justifyContent: "space-between",
      padding: "0.8rem 1.5rem",
      borderRadius: "0 0 12px 12px",
    }}
  >
    <Button
      variant="outlined"
      startIcon={<ArrowBackIcon />}
      color="success"
      onClick={onBack}
    >
      返回
    </Button>

    <SaveButton label="儲存" color="success" />
  </Toolbar>
);

export const GenericCreatePage: React.FC<GenericCreatePageProps> = ({
  resource,
  title,
  children,
  onSuccess,
  onError,
  width = "700px",
  transform,
}) => {
  const redirect = useRedirect();

  // ⭐ 全域錯誤處理（已是 unknown-safe）
  const globalAlert = useGlobalAlert();
  const { handleApiError } = useApiErrorHandler(globalAlert);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={(theme) => ({
          display: "flex",
          justifyContent: "center",
          pt: { xs: 2, sm: 4, md: 5 },
          px: { xs: 1, sm: 2 },
          pb: 4,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
        })}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: "100%", sm: width || FORM_MAX_WIDTH },
            borderRadius: 2,
            bgcolor: "background.paper",
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: 3,
            boxSizing: "border-box",
            px: { xs: 1.25, sm: 2, md: 3 },
            py: { xs: 1.5, sm: 2, md: 2.5 },
          }}
        >
          <Create
            title={title}
            actions={false}
            transform={transform}
            mutationOptions={{
              onSuccess: async (data: unknown) => {
                onSuccess?.(data);
                if (!onSuccess) {
                  redirect("list", resource);
                }
              },

              onError: (error: unknown) => {
                onError?.(error);
                handleApiError(error);
              },
            }}
          >
            <SimpleForm
              // 讓 SimpleForm 也能看到轉換後的錯誤等資訊
              toolbar={
                <CustomToolbar
                  onBack={() => redirect("list", resource)}
                />
              }
            >
              {children}
            </SimpleForm>
          </Create>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
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

interface GenericCreatePageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  width?: string;
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
}) => {
  const redirect = useRedirect();

  //  關鍵：接上全域錯誤處理
  const globalAlert = useGlobalAlert();
  const { handleApiError } = useApiErrorHandler(globalAlert);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={(theme) => ({
          display: "flex",
          justifyContent: "center",
          paddingTop: "40px",
          bgcolor: theme.palette.background.default,
        })}
      >
        <Box
          sx={(theme) => ({
            width,
            maxWidth: width,
            borderRadius: 2,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[3],
            padding: "2rem 3rem",
          })}
        >
          <Create
            title={title}
            actions={false}
            mutationOptions={{
              onSuccess: async (data) => {
                onSuccess?.(data);
                if (!onSuccess) {
                  redirect("list", resource);
                }
              },

              onError: (error) => {
                // ① 頁面自訂（可選）
                onError?.(error);

                // ② ⭐ 一定要顯示錯誤（核心）
                handleApiError(error);
              },
            }}
          >
            <SimpleForm
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
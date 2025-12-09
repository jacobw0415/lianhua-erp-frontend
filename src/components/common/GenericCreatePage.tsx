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
            bgcolor: theme.palette.background.paper, //  卡片背景
            border: `1px solid ${theme.palette.divider}`, //  統一邊框風格
            boxShadow: theme.shadows[3],
            padding: "2rem 3rem",
          })}
        >
          <Create
            title={title}
            actions={false}
            mutationOptions={{
              onSuccess: async (data) => {
                if (onSuccess) onSuccess(data);
                else redirect("list", resource);
              },
              onError: (error) => {
                if (onError) onError(error);
              },
            }}
          >
            <SimpleForm toolbar={<CustomToolbar onBack={() => redirect("list", resource)} />}>
              {children}
            </SimpleForm>
          </Create>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

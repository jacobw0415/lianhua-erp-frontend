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
      {/* ⭐ 只要這一層包住，所有自訂 DatePicker 就不會報錯了 */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "50px",
          height: "calc(100vh - 64px)",
          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            width: width,
            maxWidth: width,
            backgroundColor: "background.paper",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            padding: "2rem 3rem",
            mb: 8,
          }}
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

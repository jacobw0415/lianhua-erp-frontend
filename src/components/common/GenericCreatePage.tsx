import {
  Create,
  SimpleForm,
  Toolbar,
  SaveButton,
  useNotify,
  useRedirect,
  useCreate,
} from "react-admin";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React from "react";

interface GenericCreatePageProps {
  resource: string;                // 對應 resource 名稱，如 "purchases"
  title: string;                   // 頁面標題
  children: React.ReactNode;       // 表單內容區塊
  successMessage?: string;         // 自訂成功提示
  errorMessage?: string;           // 自訂錯誤提示
  width?: string;                  // 可選：表單寬度
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
  successMessage = "✅ 資料已成功新增",
  errorMessage = "❌ 新增失敗",
  width = "700px",
}) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();

  const handleSubmit = async (values: any) => {
    try {
      await create(
        resource,
        { data: values },
        {
          onSuccess: () => {
            notify(successMessage, { type: "success" });
            setTimeout(() => redirect("list", resource), 1000);
          },
          onError: (error: any) => {
            notify(`${errorMessage}：${error.message || "未知錯誤"}`, {
              type: "error",
            });
          },
        }
      );
    } catch (error: any) {
      notify(`${errorMessage}：${error.message || error}`, { type: "error" });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: width,
          backgroundColor: "background.paper",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          padding: "2rem 3rem",
        }}
      >
        <Create title={title} actions={false}>
          <SimpleForm
            toolbar={<CustomToolbar onBack={() => redirect("list", resource)} />}
            onSubmit={handleSubmit}
          >
            {children}
          </SimpleForm>
        </Create>
      </Box>
    </Box>
  );
};

// ✅ src/components/common/GenericCreatePage.tsx
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
  resource: string;
  title: string;
  children: React.ReactNode;
  successMessage?: string;
  errorMessage?: string;
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
        alignItems: "flex-start",
        paddingTop: "50px",
        height: "calc(100vh - 64px)",
        backgroundColor: "background.default",
      }}
    >
      <Box
        sx={{
          width: width,                // ✅ 改成固定寬度，而不是 100%
          maxWidth: width,             // ✅ 讓不同頁面內容不影響外框大小
          backgroundColor: "background.paper",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          padding: "2rem 3rem",
          mb: 8,
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

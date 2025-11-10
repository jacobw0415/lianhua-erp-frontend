import {
  Edit,
  SimpleForm,
  Toolbar,
  SaveButton,
  DeleteButton,
  useNotify,
  useRedirect,
  useUpdate,
} from "react-admin";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React from "react";

interface GenericEditPageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  successMessage?: string;
  errorMessage?: string;
  width?: string;
}

const CustomToolbar = ({
  onBack,
  showDelete = true,
}: {
  onBack: () => void;
  showDelete?: boolean;
}) => (
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
    <Box sx={{ display: "flex", gap: 2 }}>
      {showDelete && <DeleteButton label="刪除" mutationMode="pessimistic" />}
      <SaveButton label="儲存" color="success" />
    </Box>
  </Toolbar>
);

export const GenericEditPage: React.FC<GenericEditPageProps> = ({
  resource,
  title,
  children,
  successMessage = "✅ 修改成功",
  errorMessage = "❌ 修改失敗",
  width = "700px",
}) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [update] = useUpdate();

  const handleSubmit = async (values: any) => {
    const { id, ...dataWithoutId } = values;
    try {
      await update(
        resource,
        { id, data: dataWithoutId },
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
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: "calc(100vh - 64px)",
            backgroundColor: "background.default",
            py: 6,
            px: 2,
            overflowY: "auto",
            overflowX: "hidden",
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
        <Edit title={title} actions={false}>
          <SimpleForm
            toolbar={<CustomToolbar onBack={() => redirect("list", resource)} />}
            onSubmit={handleSubmit}
          >
            {children}
          </SimpleForm>
        </Edit>
      </Box>
    </Box>
  );
};

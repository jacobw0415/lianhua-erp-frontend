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
  resource: string;                // 對應 resource 名稱，如 "suppliers"
  title: string;                   // 頁面標題
  children: React.ReactNode;       // 表單內容（由各模組傳入）
  successMessage?: string;         // 自訂成功提示
  errorMessage?: string;           // 自訂錯誤提示
  width?: string;                  // 可選：表單寬度
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
    // ✅ React-Admin 的 values 會包含 id，需在送出前移除
    const { id, ...dataWithoutId } = values;

    try {
      await update(
        resource,
        { id, data: dataWithoutId }, // id 作為更新目標，但不包含在 data payload 裡
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

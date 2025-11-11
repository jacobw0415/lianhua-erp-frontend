import React from "react";
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
  width = "700px",
}) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const [update] = useUpdate();

  /**
   * 🧩 handleSubmit 統一提交邏輯：
   * - 自動過濾唯讀欄位
   * - 過濾 newPayments 陣列中無效資料
   * - 成功後顯示通知並導回列表
   */
  const handleSubmit = async (values: any) => {
  const { id, newPayments, ...rest } = values;

  // 1️⃣ 移除不屬於後端 DTO 的唯讀欄位
  const payload = { ...rest };
  delete payload.supplierName;
  delete payload.item;
  delete payload.totalAmount;
  delete payload.paidAmount;
  delete payload.balance;
  delete payload.status;

  // 2️⃣ 處理付款資料
  if (newPayments && newPayments.length > 0) {
    const cleanedPayments = newPayments
      .filter((p: any) => p.amount && p.payDate && p.method)
      .map((p: any) => ({
        amount: p.amount,
        payDate: p.payDate,
        method: p.method,
        // ⚠️ 不要傳 id 給後端
      }));

    payload.payments = cleanedPayments;
  }

  try {
    await update(
      resource,
      { id, data: payload },
      {
        onSuccess: () => {
          notify("✅ 修改成功", { type: "success" });
          redirect("list", resource);
        },
        onError: (error: any) => {
          notify(`❌ 修改失敗：${error.message || "未知錯誤"}`, {
            type: "error",
          });
        },
      }
    );
  } catch (error: any) {
    notify(`❌ 修改失敗：${error.message || error}`, { type: "error" });
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
          width: width,
          maxWidth: width,
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

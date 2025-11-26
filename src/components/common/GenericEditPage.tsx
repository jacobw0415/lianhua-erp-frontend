import React, { useState } from "react";
import {
  Edit,
  SimpleForm,
  Toolbar,
  SaveButton,
  useNotify,
  useRedirect,
  useUpdate,
  useRecordContext,
  useDataProvider,
} from "react-admin";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

interface GenericEditPageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  width?: string;
  successMessage?: string;
  errorMessage?: string;
}

const CustomToolbar = ({
  onBack,
  onDelete,
}: {
  onBack: () => void;
  onDelete: () => void;
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
      <Button
        variant="contained"
        color="error"
        onClick={(e) => {
          e.currentTarget.blur();    
          onDelete();
        }}
      >
        刪除
      </Button>
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

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  /** ⭐ 表單提交邏輯（保留你的原本流程） */
  const handleSubmit = async (values: any) => {
    const { id, newPayments, ...rest } = values;

    const payload = { ...rest };

    // 移除唯讀欄位
    delete payload.supplierName;
    delete payload.item;
    delete payload.totalAmount;
    delete payload.paidAmount;
    delete payload.balance;
    delete payload.status;

    // 處理付款資料
    if (Array.isArray(newPayments)) {
      payload.payments = newPayments
        .filter((p: any) => p.amount && p.payDate && p.method)
        .map((p: any) => ({
          amount: p.amount,
          payDate: p.payDate,
          method: p.method,
        }));
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
          onError: (error: any) =>
            notify(`❌ 修改失敗：${error.message || "未知錯誤"}`, {
              type: "error",
            }),
        }
      );
    } catch (e: any) {
      notify(`❌ 修改失敗：${e.message}`, { type: "error" });
    }
  };

  return (
    <Box sx={{ pt: "50px", display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          width,
          backgroundColor: "background.paper",
          borderRadius: "12px",
          padding: "2rem 3rem",
        }}
      >
        <Edit title={title} actions={false}>
          <EditContent
            resource={resource}
            onSubmit={handleSubmit}
            openDeleteConfirm={openDeleteConfirm}
            setOpenDeleteConfirm={setOpenDeleteConfirm}
          >
            {children}
          </EditContent>
        </Edit>
      </Box>
    </Box>
  );
};

/** ⭐ Edit 子組件（可取到 record） */
const EditContent = ({
  children,
  resource,
  onSubmit,
  openDeleteConfirm,
  setOpenDeleteConfirm,
}: any) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const record = useRecordContext();

  /** ⭐ TS 正確防護：record 尚未載入時不渲染頁面 */
  if (!record) return null;

  /** ⭐ 刪除邏輯 */
  const handleDelete = async () => {
    try {
      await dataProvider.delete(resource, { id: record.id });
      notify("🗑️ 已成功刪除", { type: "success" });
      redirect("list", resource);
    } catch (err: any) {
      notify(`❌ 刪除失敗：${err.message}`, { type: "error" });
    }
  };

  return (
    <>
      <SimpleForm
        onSubmit={onSubmit}
        toolbar={
          <CustomToolbar
            onBack={() => redirect("list", resource)}
            onDelete={() => setOpenDeleteConfirm(true)}
          />
        }
      >
        {children}
      </SimpleForm>

      <GlobalAlertDialog
        open={openDeleteConfirm}
        title="確認刪除"
        description={`確定要刪除「${record.name ?? "這筆資料"}」嗎？`}
        severity="error"
        confirmLabel="刪除"
        cancelLabel="取消"
        onClose={() => setOpenDeleteConfirm(false)}
        onConfirm={() => {
          setOpenDeleteConfirm(false);
          handleDelete();
        }}
      />
    </>
  );
};

import React, { useState } from "react";
import {
  Edit,
  SimpleForm,
  Toolbar,
  SaveButton,
  useRedirect,
  useUpdate,
  useRecordContext,
  useDataProvider,
  type RaRecord,
} from "react-admin";

import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";

/* =======================================================
 * 🔐 Props 定義
 * ======================================================= */
interface GenericEditPageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  width?: string;
  toolbar?: React.ReactElement; // 🚀 新增：支援外部傳入自定義 Toolbar
  onSuccess?: (data: unknown) => void;
  onDeleteSuccess?: (record: unknown) => void;
}

/* -------------------------------------------------------
 * 🛠️ 預設 Custom Toolbar
 * ------------------------------------------------------- */
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

/* =======================================================
 * ⭐ 主組件 GenericEditPage
 * ======================================================= */
export const GenericEditPage: React.FC<GenericEditPageProps> = ({
  resource,
  title,
  children,
  width = "700px",
  toolbar, // 🚀 接收 toolbar
  onSuccess,
  onDeleteSuccess,
}) => {
  const redirect = useRedirect();
  const [update] = useUpdate();
  const dataProvider = useDataProvider();

  const globalAlert = useGlobalAlert();
  const { handleApiError } = useApiErrorHandler(globalAlert);

  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  /* ---------------------------------------------------
   * 提交邏輯
   * --------------------------------------------------- */
  const handleSubmit = async (values: unknown) => {
    if (typeof values !== "object" || values === null) return;

    const { id, newPayments, ...rest } = values as Record<string, unknown>;
    const payload: Record<string, unknown> = { ...rest };

    // 使用者管理：若有填 newPassword，映射為 password，並移除確認欄位
    if (resource === "users") {
      const newPassword = (values as { newPassword?: unknown }).newPassword;
      const confirmNewPassword = (values as { confirmNewPassword?: unknown }).confirmNewPassword;
      if (typeof newPassword === "string" && newPassword.trim()) {
        if (newPassword !== confirmNewPassword) {
          // 簡單防呆：密碼不一致直接丟錯，由上層 Alert 處理
          throw new Error("新密碼與確認密碼不一致。");
        }
        payload.password = newPassword;
      }
      delete (payload as any).newPassword;
      delete (payload as any).confirmNewPassword;
    }

    // 移除唯讀欄位防止報錯
    const readonlyFields = [
      'supplierName', 'item', 'totalAmount', 'paidAmount',
      'balance', 'status', 'productName', 'amount'
    ];
    readonlyFields.forEach(field => delete payload[field]);

    if (Array.isArray(newPayments)) {
      payload.payments = newPayments
        .filter((p): p is any => typeof p === "object" && p !== null)
        .map((p) => ({
          amount: p.amount,
          payDate: p.payDate,
          method: p.method,
        }));
    }

    await update(
      resource,
      { id, data: payload },
      {
        onSuccess: async (result: any) => {
          const newId = result?.data?.id || id;
          const latest = await dataProvider.getOne(resource, { id: newId });

          onSuccess?.(latest.data);
          if (!onSuccess) {
            redirect("list", resource);
          }
        },
        onError: (error: unknown) => {
          handleApiError(error);
        },
      }
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={(theme) => ({
          pt: "50px",
          display: "flex",
          justifyContent: "center",
          bgcolor: theme.palette.background.default,
        })}
      >
        <Box
          sx={(theme) => ({
            width,
            maxWidth: width,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[3],
            borderRadius: "12px",
            padding: "2rem 3rem",
          })}
        >
          <Edit title={title} actions={false}>
            <EditContent
              resource={resource}
              onSubmit={handleSubmit}
              toolbar={toolbar} // 🚀 傳遞自定義 Toolbar
              openDeleteConfirm={openDeleteConfirm}
              setOpenDeleteConfirm={setOpenDeleteConfirm}
              onDeleteSuccess={onDeleteSuccess}
              handleApiError={handleApiError}
            >
              {children}
            </EditContent>
          </Edit>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

/* =======================================================
 * 📝 EditContent (處理分流)
 * ======================================================= */
interface EditContentProps {
  children: React.ReactNode;
  resource: string;
  onSubmit: (values: unknown) => void;
  toolbar?: React.ReactElement; // 🚀 新增
  openDeleteConfirm: boolean;
  setOpenDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteSuccess?: (record: unknown) => void;
  handleApiError: (error: unknown) => void;
}

const EditContent: React.FC<EditContentProps> = ({
  children,
  resource,
  onSubmit,
  toolbar, // 🚀 接收
  openDeleteConfirm,
  setOpenDeleteConfirm,
  onDeleteSuccess,
  handleApiError,
}) => {
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const record = useRecordContext<RaRecord>();

  if (!record) return null;

  const handleDelete = async () => {
    try {
      await dataProvider.delete(resource, {
        id: record.id,
        previousData: record,
      });

      onDeleteSuccess?.(record);
      if (!onDeleteSuccess) {
        redirect("list", resource);
      }
    } catch (error: unknown) {
      handleApiError(error);
    }
  };

  return (
    <>
      <SimpleForm
        onSubmit={onSubmit}
        toolbar={
          toolbar
            ? React.cloneElement(toolbar as React.ReactElement<{ onBack: () => void; onDelete: () => void }>, {
                onBack: () => redirect("list", resource),
                onDelete: () => setOpenDeleteConfirm(true),
              })
            : (
            <CustomToolbar
              onBack={() => redirect("list", resource)}
              onDelete={() => setOpenDeleteConfirm(true)}
            />
          )
        }
      >
        {children}
      </SimpleForm>

      <GlobalAlertDialog
        open={openDeleteConfirm}
        title="確認刪除"
        description={`確定要刪除「${(record as any).purchaseNo ??
          (record as any).orderNo ??
          (record as any).name ??
          (record as any).title ??
          "這筆資料"
          }」嗎？`}
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

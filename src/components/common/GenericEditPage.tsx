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
} from "react-admin";

import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";

interface GenericEditPageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  width?: string;
  onSuccess?: (data: any) => void;
  onDeleteSuccess?: (record: any) => void;
}

/* -------------------------------------------------------
 *  Custom Toolbar（與 GenericCreatePage UX 一致）
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

/* -------------------------------------------------------
 *  主組件
 * ------------------------------------------------------- */
export const GenericEditPage: React.FC<GenericEditPageProps> = ({
  resource,
  title,
  children,
  width = "700px",
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
   *  提交（Update）邏輯
   * --------------------------------------------------- */
  const handleSubmit = async (values: any) => {
    const { id, newPayments, ...rest } = values;
    const payload = { ...rest };

    // 移除唯讀欄位（依實際資料結構）
    delete payload.supplierName;
    delete payload.item;
    delete payload.totalAmount;
    delete payload.paidAmount;
    delete payload.balance;
    delete payload.status;

    // payments 處理
    if (Array.isArray(newPayments)) {
      payload.payments = newPayments
        .filter((p: any) => p.amount && p.payDate && p.method)
        .map((p: any) => ({
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
          const newId = result?.data?.id ?? id;

          // 重新抓最新資料，確保外層拿到完整 record
          const latest = await dataProvider.getOne(resource, { id: newId });

          onSuccess?.(latest.data);
          if (!onSuccess) {
            redirect("list", resource);
          }
        },

        onError: (error: any) => {
          handleApiError(error); // ⭐ 核心：一定顯示錯誤
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

/* -------------------------------------------------------
 *  EditContent（Delete + Delete Confirm）
 * ------------------------------------------------------- */
const EditContent = ({
  children,
  resource,
  onSubmit,
  openDeleteConfirm,
  setOpenDeleteConfirm,
  onDeleteSuccess,
  handleApiError,
}: any) => {
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const record = useRecordContext();

  if (!record) return null;

  /* ---------------------------------------------------
   *  刪除邏輯
   * --------------------------------------------------- */
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
    } catch (error: any) {
      handleApiError(error); // ⭐ 核心：一定顯示錯誤
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

      {/* 刪除確認 Dialog（操作確認，不是錯誤） */}
      <GlobalAlertDialog
        open={openDeleteConfirm}
        title="確認刪除"
        description={`確定要刪除「${
          record.name ?? record.title ?? record.code ?? "這筆資料"
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
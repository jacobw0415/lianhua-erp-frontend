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
 *  Props
 * ======================================================= */
interface GenericEditPageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  width?: string;
  onSuccess?: (data: unknown) => void;
  onDeleteSuccess?: (record: unknown) => void;
}

/* -------------------------------------------------------
 *  Custom Toolbar
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
 *  主組件
 * ======================================================= */
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
   *  提交（Update）
   * --------------------------------------------------- */
  const handleSubmit = async (values: unknown) => {
    if (typeof values !== "object" || values === null) return;

    const { id, newPayments, ...rest } = values as Record<string, unknown>;

    const payload: Record<string, unknown> = { ...rest };

    // 移除唯讀欄位
    delete payload.supplierName;
    delete payload.item;
    delete payload.totalAmount;
    delete payload.paidAmount;
    delete payload.balance;
    delete payload.status;
    // 銷售紀錄唯讀欄位
    delete payload.productName;
    delete payload.amount;

    // payments 處理
    if (Array.isArray(newPayments)) {
      payload.payments = newPayments
        .filter(
          (p): p is { amount: unknown; payDate: unknown; method: unknown } =>
            typeof p === "object" &&
            p !== null &&
            "amount" in p &&
            "payDate" in p &&
            "method" in p
        )
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
        onSuccess: async (result: unknown) => {
          const newId =
            typeof result === "object" &&
            result !== null &&
            "data" in result &&
            typeof (result as { data?: unknown }).data === "object" &&
            (result as { data?: { id?: unknown } }).data?.id
              ? (result as { data: { id: unknown } }).data.id
              : id;

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
 *  EditContent
 * ======================================================= */
interface EditContentProps {
  children: React.ReactNode;
  resource: string;
  onSubmit: (values: unknown) => void;
  openDeleteConfirm: boolean;
  setOpenDeleteConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteSuccess?: (record: unknown) => void;
  handleApiError: (error: unknown) => void;
}

const EditContent: React.FC<EditContentProps> = ({
  children,
  resource,
  onSubmit,
  openDeleteConfirm,
  setOpenDeleteConfirm,
  onDeleteSuccess,
  handleApiError,
}) => {
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const record = useRecordContext<RaRecord>();

  if (!record) return null;

  /* ---------------------------------------------------
   *  刪除
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
    } catch (error: unknown) {
      handleApiError(error);
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
        description={`確定要刪除「${
          (record as { purchaseNo?: string }).purchaseNo ??
          (record as { orderNo?: string }).orderNo ??
          (record as { name?: string }).name ??
          (record as { title?: string }).title ??
          (record as { code?: string }).code ??
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

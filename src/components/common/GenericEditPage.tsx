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
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

interface GenericEditPageProps {
  resource: string;
  title: string;
  children: React.ReactNode;
  width?: string;
  onSuccess?: (data: any) => void;
  onDeleteSuccess?: (record: any) => void;
}

/* -------------------------------------------------------
 * ⭐ Custom Toolbar（保持與 GenericCreatePage 完全一致的 UX）
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
 * ⭐ 主組件（含 update 最新資料取得）
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
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  /* ---------------------------------------------------
   *  提交邏輯（自動重新抓最新資料）
   * --------------------------------------------------- */
  const handleSubmit = async (values: any) => {
    const { id, newPayments, ...rest } = values;
    const payload = { ...rest };

    //  移除唯讀欄位（依你的資料庫）
    delete payload.supplierName;
    delete payload.item;
    delete payload.totalAmount;
    delete payload.paidAmount;
    delete payload.balance;
    delete payload.status;

    //  paymenets 資料處理
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

          // 一律重新抓最新資料 → 外層永遠拿到「完整 record」
          const latest = await dataProvider.getOne(resource, { id: newId });

          if (onSuccess) onSuccess(latest.data);
          else redirect("list", resource);
        },
      }
    );
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
            onDeleteSuccess={onDeleteSuccess}
          >
            {children}
          </EditContent>
        </Edit>
      </Box>
    </Box>
  );
};

/* -------------------------------------------------------
 *  EditContent（處理刪除 + 刪除確認彈窗）
 * ------------------------------------------------------- */
const EditContent = ({
  children,
  resource,
  onSubmit,
  openDeleteConfirm,
  setOpenDeleteConfirm,
  onDeleteSuccess,
}: any) => {
  const redirect = useRedirect();
  const dataProvider = useDataProvider();
  const record = useRecordContext();

  if (!record) return null;

  /* ---------------------------------------------------
   *  刪除邏輯（自動回傳完整 record）
   * --------------------------------------------------- */
  const handleDelete = async () => {
    await dataProvider.delete(resource, {
      id: record.id,
      previousData: record,
    });

    if (onDeleteSuccess) onDeleteSuccess(record);
    else redirect("list", resource);
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

      {/*  統一刪除確認彈窗（不含錯誤/成功） */}
      <GlobalAlertDialog
        open={openDeleteConfirm}
        title="確認刪除"
        description={`確定要刪除「${record.name ?? record.title ?? record.code ?? "這筆資料"}」嗎？`}
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

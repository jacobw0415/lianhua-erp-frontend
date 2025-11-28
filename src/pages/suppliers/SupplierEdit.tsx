import React from "react";
import {
  TextInput,
  useRecordContext,
  useRedirect,
} from "react-admin";

import { Typography } from "@mui/material";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

/* -------------------------------------------------------
 * ⭐ 供應商編輯頁面
 * ------------------------------------------------------- */
export const SupplierEdit: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="suppliers"
      title="編輯供應商資料"
      width="700px"
      onSuccess={(data) => {
        showAlert({
          title: "更新成功",
          message: `已成功更新「${data.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "suppliers"), 600);
      }}
      onDeleteSuccess={(record) => {
        showAlert({
          title: "刪除成功",
          message: `已成功刪除「${record.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "suppliers"), 600);
      }}
    >
      <SupplierFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 供應商欄位區塊
 * ------------------------------------------------------- */
const SupplierFormFields: React.FC = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🏷️ 基本資訊
      </Typography>

      <TextInput source="name" label="供應商名稱" fullWidth required />
      <TextInput source="contact" label="聯絡人" fullWidth />
      <TextInput source="phone" label="電話" fullWidth />
      <TextInput source="note" label="備註" fullWidth multiline/>
    </>
  );
};

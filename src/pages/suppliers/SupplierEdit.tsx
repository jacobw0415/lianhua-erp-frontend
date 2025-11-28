import React from "react";
import {
  TextInput,
  SelectInput,
  useRecordContext,
} from "react-admin";
import { Typography } from "@mui/material";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { useRedirect } from "react-admin";

/* -------------------------------------------------------
 * ⭐ 主編輯頁面
 * ------------------------------------------------------- */
export const SupplierEdit: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="suppliers"
      title="編輯供應商資料"
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
 * ⭐ Supplier 表單欄位（使用 useRecordContext）
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

      <SelectInput
        source="billingCycle"
        label="帳單週期"
        fullWidth
        choices={[
          { id: "WEEKLY", name: "每週" },
          { id: "BIWEEKLY", name: "每兩週" },
          { id: "MONTHLY", name: "每月" },
        ]}
      />

      <TextInput source="note" label="備註" multiline fullWidth />
    </>
  );
};

import React, { useEffect } from "react"; // 1. 加入 useEffect
import {
  TextInput,
  SelectInput,
  useRecordContext,
  useRedirect,
  required,
} from "react-admin";
import { Typography, Box, useTheme } from "@mui/material"; // 2. 加入 useTheme

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { SupplierStatusField } from "./SupplierStatusField";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles"; // 3. 引入樣式工具

/* -------------------------------------------------------
 * 🔐 Supplier 型別定義
 * ------------------------------------------------------- */
interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  note?: string;
  billingCycle?: "WEEKLY" | "BIWEEKLY" | "MONTHLY";
  active?: boolean;
}

/* -------------------------------------------------------
 * ⭐ 供應商編輯頁面
 * ------------------------------------------------------- */
export const SupplierEdit: React.FC = () => {
  const theme = useTheme(); // 取得當前主題
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  // 套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <GenericEditPage
      resource="suppliers"
      title="編輯供應商"
      width="700px"
      onSuccess={(data) => {
        const supplier = data as Supplier;

        showAlert({
          title: "更新成功",
          message: `已成功更新「${supplier.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "suppliers"));
      }}
      onDeleteSuccess={(record) => {
        const supplier = record as Supplier;

        showAlert({
          title: "刪除成功",
          message: `已成功刪除「${supplier.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "suppliers"));
      }}
    >
      <SupplierFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 *  供應商欄位
 * ------------------------------------------------------- */
const SupplierFormFields: React.FC = () => {
  const record = useRecordContext<Supplier>();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🏷️ 基本資訊
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <FormFieldRow sx={{ mb: 2 }}>
          <TextInput
            source="name"
            label="供應商名稱 *"
            fullWidth
            validate={[required()]}
          />
          <TextInput
            source="contact"
            label="聯絡人"
            fullWidth
            validate={[required()]}
          />
        </FormFieldRow>

        <FormFieldRow sx={{ mb: 2 }}>
          <TextInput source="phone" label="電話" fullWidth />
          <TextInput source="note" label="備註" fullWidth />
        </FormFieldRow>

        <FormFieldRow sx={{ mb: 2 }}>
          <SupplierStatusField />
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
        </FormFieldRow>
      </Box>
    </>
  );
};
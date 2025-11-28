import React from "react";
import { TextInput, SelectInput, useRecordContext } from "react-admin";
import { Typography} from "@mui/material";
import { GenericEditPage } from "@/components/common/GenericEditPage";

export const SupplierEdit: React.FC = () => (
  <GenericEditPage
    resource="suppliers"
    title="編輯供應商資料"
    successMessage="✅ 供應商資料已成功更新"
    errorMessage="❌ 更新失敗，請確認欄位或伺服器狀態"
  >
    <SupplierFormFields />
  </GenericEditPage>
);

// SupplierEdit.tsx
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
        choices={[
          { id: "WEEKLY", name: "每週" },
          { id: "BIWEEKLY", name: "每兩週" },
          { id: "MONTHLY", name: "每月" },
        ]}
        fullWidth
      />
      <TextInput source="note" label="備註" multiline fullWidth />
    </>
  );
};

// src/pages/suppliers/SupplierEdit.tsx
import React from "react";
import {
  Edit,
  TextInput,
  SelectInput,
  useRecordContext,
} from "react-admin";
import { GenericEditForm } from "@/components/GenericEditForm";
import { Box, Paper, Typography, Divider } from "@mui/material";

export const SupplierEdit: React.FC = () => (
  <Edit
    mutationMode="pessimistic"
    title="編輯供應商資料"
  >
    <GenericEditForm resource="suppliers">
      <SupplierFormFields />
    </GenericEditForm>
  </Edit>
);

const SupplierFormFields: React.FC = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* 🏷️ 基本資料區塊 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">🏷️ 基本資訊</Typography>
        <Divider sx={{ my: 2 }} />

        <TextInput
          source="name"
          label="供應商名稱(不可重複命名於表單中)"
          fullWidth
          required
        />

        <TextInput
          source="contact"
          label="聯絡人"
          fullWidth
        />

        <TextInput
          source="phone"
          label="電話"
          fullWidth
        />

        <SelectInput
          source="billing_cycle"
          label="帳單週期"
          choices={[
            { id: "WEEKLY", name: "每週" },
            { id: "BIWEEKLY", name: "每兩週" },
            { id: "MONTHLY", name: "每月" },
          ]}
          fullWidth
        />

        <TextInput
          source="note"
          label="備註"
          multiline
          fullWidth
        />
      </Paper>
    </Box>
  );
};

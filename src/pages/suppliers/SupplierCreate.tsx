import React from "react";
import { TextInput, SelectInput } from "react-admin";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";

export const SupplierCreate: React.FC = () => {
  return (
    <GenericCreatePage
      resource="suppliers"
      title="新增供應商"
      successMessage="✅ 供應商資料已成功新增"
      errorMessage="❌ 新增供應商資料失敗"
      width="600px"
    >
      <TextInput
        source="name"
        label="供應商名稱"
        fullWidth
        required
        helperText="名稱需唯一"
      />

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
        defaultValue="MONTHLY"
        fullWidth
      />

      <TextInput source="note" label="備註" multiline fullWidth />
    </GenericCreatePage>
  );
};

import React from "react";
import { TextInput, SelectInput, useRedirect } from "react-admin";
import { Typography } from "@mui/material";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

export const SupplierCreate: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="suppliers"
      title="新增供應商"
      onSuccess={(data) => {
        showAlert({
          message: `供應商「${data.name}」新增成功！`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => {
          redirect("list", "suppliers");
        }, 600);  
      }}
    >
      <Typography variant="h6">🏪 新增供應商資訊</Typography>
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
        defaultValue="MONTHLY"
      />

      <TextInput source="note" label="備註" multiline fullWidth />
    </GenericCreatePage>
  );
};

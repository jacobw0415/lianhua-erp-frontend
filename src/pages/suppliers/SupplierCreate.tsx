import React from "react";
import { TextInput, SelectInput, useRedirect } from "react-admin";
import { Box, Typography } from "@mui/material";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { required } from "react-admin";
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
        setTimeout(() => redirect("list", "suppliers"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🏪 新增供應商資訊
      </Typography>

      {/* 整體固定最大寬度 */}
      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 第一列 */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <TextInput source="name" label="供應商名稱 *" fullWidth  validate={[required()]}/>
          </Box>
          <Box flex={1}>
            <TextInput source="contact" label="聯絡人" fullWidth />
          </Box>
        </Box>

        {/* 第二列 */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <TextInput source="phone" label="電話" fullWidth />
          </Box>

          <Box flex={1}>
            <TextInput source="note" label="備註" multiline fullWidth />
          </Box>
        </Box>

        {/* 單欄：帳單週期 */}
        <Box mb={2}>
          <SelectInput
            source="billingCycle"
            label="帳單週期"
            fullWidth
            defaultValue="MONTHLY"
            choices={[
              { id: "WEEKLY", name: "每週" },
              { id: "BIWEEKLY", name: "每兩週" },
              { id: "MONTHLY", name: "每月" },
            ]}
          />
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

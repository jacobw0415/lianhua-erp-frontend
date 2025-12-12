import React from "react";
import {
  TextInput,
  SelectInput,
  useRecordContext,
  useRedirect,
} from "react-admin";
import { Typography, Box } from "@mui/material";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { SupplierStatusField } from "./SupplierStatusField";
import { required } from "react-admin";

/* -------------------------------------------------------
 * ⭐ 供應商編輯頁面
 * ------------------------------------------------------- */
export const SupplierEdit: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="suppliers"
      title="編輯供應商"
      width="700px"
      onSuccess={(data) => {
        showAlert({
          title: "更新成功",
          message: `已成功更新「${data.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "suppliers"));
      }}
      onDeleteSuccess={(record) => {
        showAlert({
          title: "刪除成功",
          message: `已成功刪除「${record.name}」`,
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
 * ⭐ 供應商欄位（與 Create 完全一致 + active）
 * ------------------------------------------------------- */
const SupplierFormFields: React.FC = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🏷️ 基本資訊
      </Typography>

      {/* 與 SupplierCreate 完全一致的 maxWidth 包裝 */}
      <Box sx={{ maxWidth: 600, width: "100%" }}>

        {/* 第一列：供應商名稱 / 聯絡人 */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <TextInput source="name" label="供應商名稱 *" fullWidth validate={[required()]} />
          </Box>
          <Box flex={1}>
            <TextInput source="contact" label="聯絡人" fullWidth />
          </Box>
        </Box>

        {/* 第二列：電話 / 帳單週期 */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <TextInput source="phone" label="電話" fullWidth />
          </Box>
          <Box flex={1}>
            <TextInput source="note" label="備註" fullWidth  />
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <SupplierStatusField />
          </Box>
          <Box flex={1}>
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
          </Box>
        </Box>
      </Box>
    </>
  );
};

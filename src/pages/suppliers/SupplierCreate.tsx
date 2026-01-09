import React, { useEffect } from "react"; // 1. 加入 useEffect
import {
  TextInput,
  SelectInput,
  useRedirect,
  required,
} from "react-admin";
import { Box, Typography, useTheme } from "@mui/material"; // 2. 加入 useTheme

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
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
 * ⭐ 新增供應商頁面
 * ------------------------------------------------------- */
export const SupplierCreate: React.FC = () => {
  const theme = useTheme(); // 取得當前主題 (深/淺色)
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  // 4. 套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <GenericCreatePage
      resource="suppliers"
      title="新增供應商"
      onSuccess={(data) => {
        const supplier = data as Supplier;

        showAlert({
          message: `供應商「${supplier.name}」新增成功！`,
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
        {/* 第一列：名稱 / 聯絡人 */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <TextInput
              source="name"
              label="供應商名稱 *"
              fullWidth
              validate={[required()]}
            />
          </Box>
          <Box flex={1}>
            <TextInput source="contact" label="聯絡人" fullWidth />
          </Box>
        </Box>

        {/* 第二列：電話 / 備註 */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <TextInput source="phone" label="電話" fullWidth />
          </Box>
          <Box flex={1}>
            <TextInput source="note" label="備註" multiline fullWidth />
          </Box>
        </Box>

        {/* 帳單週期 */}
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
import React, { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  BooleanInput,
  useRedirect,
  required,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

/* -------------------------------------------------------
 * 🔐 ProductCategory 型別定義
 * ------------------------------------------------------- */
interface ProductCategory {
  id: number;
  name: string;
  code?: string;
  description?: string;
  active?: boolean;
}

/* -------------------------------------------------------
 * ⭐ 新增商品分類頁面
 * ------------------------------------------------------- */
export const ProductCategoryCreate: React.FC = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="product_categories"
      title="新增商品分類"
      onSuccess={(data) => {
        const category = data as ProductCategory;

        showAlert({
          message: `商品分類「${category.name}」新增成功！`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "product_categories"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🗂 新增商品分類資訊
      </Typography>

      {/* 整體固定最大寬度（與 SupplierCreate 一致） */}
      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 第一列：分類名稱 / 分類代碼 */}
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <TextInput
              source="name"
              label="分類名稱 *"
              fullWidth
              validate={[required()]}
            />
          </Box>
          <Box flex={1}>
            <TextInput
              source="code"
              label="分類代碼"
              fullWidth
            />
          </Box>
        </Box>

        {/* 第二列：說明 */}
        <Box mb={2}>
          <TextInput
            source="description"
            label="說明"
            multiline
            minRows={3}
            fullWidth
          />
        </Box>

        {/* 啟用狀態 */}
        <Box mb={2}>
          <BooleanInput
            source="active"
            label="啟用"
            defaultValue={true}
          />
        </Box>
      </Box>
    </GenericCreatePage>
  );
};
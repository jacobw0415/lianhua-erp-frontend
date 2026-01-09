import React, { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  useRecordContext,
  useRedirect,
  required,
} from "react-admin";
import { Typography, Box } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
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
 * ⭐ 商品分類編輯頁面
 * ------------------------------------------------------- */
export const ProductCategoryEdit: React.FC = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="product_categories"
      title="編輯商品分類"
      width="700px"
      onSuccess={(data) => {
        const category = data as ProductCategory;

        showAlert({
          title: "更新成功",
          message: `已成功更新「${category.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "product_categories"));
      }}
      onDeleteSuccess={(record) => {
        const category = record as ProductCategory;

        showAlert({
          title: "刪除成功",
          message: `已成功刪除「${category.name}」`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "product_categories"));
      }}
    >
      <ProductCategoryFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 商品分類欄位
 * ------------------------------------------------------- */
const ProductCategoryFormFields: React.FC = () => {
  const record = useRecordContext<ProductCategory>();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🗂️ 基本資訊
      </Typography>

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

        {/* 第三列：啟用狀態（沿用 GenericEditPage 內的 delete / toggle 行為） */}
        {/* 若你之後有 ProductCategoryStatusField，可直接替換 */}
      </Box>
    </>
  );
};

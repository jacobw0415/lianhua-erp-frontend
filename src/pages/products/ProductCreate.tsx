import React, { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  useRedirect,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { useActiveProductCategories } from "@/hooks/useActiveProductCategories";

/* -------------------------------------------------------
 * 🔐 Product 型別定義（Create 成功回傳用）
 * ------------------------------------------------------- */
interface Product {
  id: number;
  name: string;
  categoryId: number;
  unitPrice: number;
  active: boolean;
}

/* -------------------------------------------------------
 * ⭐ 新增商品頁面（不變動位置・穩定版）
 * ------------------------------------------------------- */
export const ProductCreate: React.FC = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { categories, loading } = useActiveProductCategories();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="products"
      title="新增商品"
      onSuccess={(data) => {
        const product = data as Product;

        showAlert({
          message: `商品「${product.name}」已成功建立`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "products"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🛒 新增商品資訊
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 商品分類 */}
        <Box mb={2}>
          <SelectInput
            source="categoryId"
            label="商品分類 *"
            choices={categories}
            optionText="name"
            optionValue="id"
            isLoading={loading}
            fullWidth
            validate={[required()]}
          />
        </Box>

        {/* 商品名稱 */}
        <Box mb={2}>
          <TextInput
            source="name"
            label="商品名稱 *"
            fullWidth
            validate={[required()]}
          />
        </Box>

        <FormFieldRow sx={{ mb: 2 }}>
          <BooleanInput
            source="active"
            label="啟用"
            defaultValue={true}
          />
          <TextInput
            source="unitPrice"
            label="單價 *"
            type="number"
            inputProps={{ min: 0 }}
            fullWidth
            validate={[required()]}
          />
        </FormFieldRow>
      </Box>
    </GenericCreatePage>
  );
};

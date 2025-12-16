import React from "react";
import {
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  useRedirect,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { useActiveProductCategories } from "@/hooks/useActiveProductCategories";

/* -------------------------------------------------------
 * 🔐 Product 型別定義（Edit 成功回傳用）
 * ------------------------------------------------------- */
interface Product {
  id: number;
  name: string;
  categoryId: number;
  unitPrice: number;
  active: boolean;
}

/* -------------------------------------------------------
 * ⭐ 編輯商品頁面（穩定版）
 * ------------------------------------------------------- */
export const ProductEdit: React.FC = () => {
  const { categories, loading } = useActiveProductCategories();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="products"
      title="編輯商品"
      onSuccess={(data) => {
        const product = data as Product;

        showAlert({
          message: `商品「${product.name}」已成功更新`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "products"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🛒 編輯商品資訊
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 商品分類 */}
        <Box mb={2}>
          <SelectInput
            source="category.id"
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

        {/* 啟用 + 單價（同一列，不變動位置） */}
        <Box display="flex" gap={2} mb={2} alignItems="center">
          <Box flex={1}>
            <BooleanInput
              source="active"
              label="啟用"
            />
          </Box>

          <Box flex={1}>
            <TextInput
              source="unitPrice"
              label="單價 *"
              type="number"
              inputProps={{ min: 0 }}
              fullWidth
              validate={[required()]}
            />
          </Box>
        </Box>
      </Box>
    </GenericEditPage>
  );
};

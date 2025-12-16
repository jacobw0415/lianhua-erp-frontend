import React from "react";
import {
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  useRedirect,
} from "react-admin";
import { Box, Typography } from "@mui/material";

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

        {/* 啟用 + 單價（同一列，不變動位置） */}
        <Box display="flex" gap={2} mb={2} alignItems="center">
          <Box flex={1}>
            <BooleanInput
              source="active"
              label="啟用"
              defaultValue={true}
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
    </GenericCreatePage>
  );
};

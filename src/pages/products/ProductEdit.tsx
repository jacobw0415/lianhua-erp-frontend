import React, { useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  SelectInput,
  BooleanInput,
  required,
  useRedirect,
  useRecordContext, // 取得目前編輯的資料
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { useActiveProductCategories } from "@/hooks/useActiveProductCategories";

/* -------------------------------------------------------
 * ⭐ 封裝過的商品分類選擇器（解決 Out-of-range 警告）
 * ------------------------------------------------------- */
const CategorySelect = () => {
  const { categories, loading } = useActiveProductCategories();
  const record = useRecordContext(); // 取得正在編輯的 Product 資料
  
  // 核心邏輯：如果正在載入，且 record 裡有 category.id
  // 我們手動建立一個包含該 ID 的虛擬選項，騙過 MUI 的檢查機制
  const safeChoices = React.useMemo(() => {
    if (loading && record?.category?.id) {
      return [{ id: record.category.id, name: "載入中..." }];
    }
    return categories || [];
  }, [categories, loading, record]);

  return (
    <SelectInput
      source="category.id"
      label="商品分類 *"
      choices={safeChoices}
      optionText="name"
      optionValue="id"
      isLoading={loading}
      fullWidth
      validate={[required()]}
      sx={{ '& .MuiOutlinedInput-root': { minHeight: '56px' } }}
    />
  );
};

interface ProductRecord {
  id: number;
  name: string;
}

/* -------------------------------------------------------
 * ⭐ 編輯商品頁面
 * ------------------------------------------------------- */
export const ProductEdit: React.FC = () => {
  const theme = useTheme();
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="products"
      title="編輯商品"
      onSuccess={(data) => {
        const product = data as ProductRecord;
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
        <Box mb={2}>
          {/* 使用封裝後的選擇器 */}
          <CategorySelect />
        </Box>

        <Box mb={2}>
          <TextInput source="name" label="商品名稱 *" fullWidth validate={[required()]} />
        </Box>

        <FormFieldRow sx={{ mb: 2 }}>
          <BooleanInput source="active" label="啟用" />
          <TextInput
            source="unitPrice"
            label="單價 *"
            type="number"
            fullWidth
            validate={[required()]}
          />
        </FormFieldRow>
      </Box>
    </GenericEditPage>
  );
};
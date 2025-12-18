import React from "react";
import {
  TextInput,
  SelectInput,
  required,
  useRedirect,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { useActiveProducts } from "@/hooks/useActiveProducts";

/* -------------------------------------------------------
 * 🔐 Sale 型別定義（Create 成功回傳用）
 * ------------------------------------------------------- */
interface Sale {
  id: number;
  productId: number;
  productName: string;
  qty: number;
  amount: number;
  payMethod: string;
  saleDate: string;
}

/* -------------------------------------------------------
 * ⭐ 新增銷售紀錄頁面（UI 規格對齊 ProductCreate）
 * ------------------------------------------------------- */
export const SaleCreate: React.FC = () => {
  const { products, loading } = useActiveProducts();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="sales"
      title="新增銷售紀錄"
      onSuccess={(data) => {
        const sale = data as Sale;

        showAlert({
          message: `商品「${sale.productName}」銷售紀錄已成功建立`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "sales"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🧾 新增銷售紀錄
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Box display="flex" gap={2} mb={2} alignItems="center">
          {/* 商品 */}
          <Box  flex={1}>
            <SelectInput
              source="productId"
              label="商品 *"
              choices={products}
              optionText="name"
              optionValue="id"
              isLoading={loading}
              fullWidth
              validate={[required()]}
            />
          </Box>
          <Box flex={1}>
            <SelectInput
              source="payMethod"
              label="付款方式 *"
              choices={[
                { id: "CASH", name: "現金" },
                { id: "TRANSFER", name: "轉帳" },
                { id: "CARD", name: "刷卡" },
              ]}
              fullWidth
              validate={[required()]}
            />
          </Box>

        </Box>
        {/* 數量 */}
        <Box mb={2}>
          <TextInput
            source="qty"
            label="數量 *"
            type="number"
            inputProps={{ min: 1 }}
            fullWidth
            validate={[required()]}
          />
        </Box>

        <Box flex={1}>
          <LhDateInput source="payDate" label="銷售日期" />
        </Box>

      </Box>
    </GenericCreatePage>
  );
};

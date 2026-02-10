import React, { useEffect } from "react"; 
import {
  TextInput,
  SelectInput,
  required,
  useRedirect,
  useRecordContext,
} from "react-admin";
import { Box, Typography, useTheme } from "@mui/material"; 

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles"; 

/* -------------------------------------------------------
 * 🔐 Sale 型別定義（Edit 成功回傳用）
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
 * ⭐ 編輯銷售紀錄頁面（符合 ERP 設計邏輯）
 * ------------------------------------------------------- */
export const SaleEdit: React.FC = () => {
  const theme = useTheme(); // 取得當前主題
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  // 套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <GenericEditPage
      resource="sales"
      title="編輯銷售紀錄"
      onSuccess={(data) => {
        const sale = data as Sale;

        showAlert({
          message: `商品「${sale.productName}」銷售紀錄已成功更新`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "sales"));
      }}
    >
      <SaleFormFields />
    </GenericEditPage>
  );
};

/* -------------------------------------------------------
 * ⭐ 銷售紀錄表單欄位（區分唯讀與可編輯）
 * ------------------------------------------------------- */
const SaleFormFields: React.FC = () => {
  const record = useRecordContext<Sale>();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🧾 編輯銷售紀錄
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        {/* 第一列：唯讀欄位（商品 + 總金額）- 帶外框和標籤 */}
        <FormFieldRow sx={{ mb: 3 }}>
          {/* 商品 - 唯讀顯示，帶外框和標籤 */}
          <Box
            sx={(theme) => ({
              position: "relative",
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 1,
              p: 2,
              pt: 2.5,
              bgcolor: theme.palette.background.paper,
            })}
          >
            <Typography
              variant="caption"
              sx={(theme) => ({
                position: "absolute",
                top: -10,
                left: 8,
                bgcolor: theme.palette.background.paper,
                px: 1,
                fontWeight: 600,
                color: "text.primary",
              })}
            >
              品名
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontSize: "1rem",
                color: "text.primary",
              }}
            >
              {record.productName}
            </Typography>
          </Box>

          {/* 總金額 - 唯讀顯示，帶外框和標籤 */}
          <Box
            sx={(theme) => ({
              position: "relative",
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 1,
              p: 2,
              pt: 2.5,
              bgcolor: theme.palette.background.paper,
            })}
          >
            <Typography
              variant="caption"
              sx={(theme) => ({
                position: "absolute",
                top: -10,
                left: 8,
                bgcolor: theme.palette.background.paper,
                px: 1,
                fontWeight: 600,
                color: "text.primary",
              })}
            >
              總金額
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontSize: "1rem",
                fontWeight: 600,
                color: "text.primary",
              }}
            >
              {record.amount?.toLocaleString("zh-TW", {
                style: "currency",
                currency: "TWD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Typography>
          </Box>
        </FormFieldRow>

        {/* 第二列：可編輯欄位（付款方式 + 數量） */}
        <FormFieldRow sx={{ mb: 2 }}>
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
          <TextInput
              source="qty"
              label="數量 *"
              type="number"
              fullWidth
              validate={[required()]}
            />
        </FormFieldRow>

        {/* 第三列：銷售日期（可編輯）- 單獨一行 */}
        <Box mb={2}>
          <LhDateInput source="saleDate" label="銷售日期" />
        </Box>
      </Box>
    </>
  );
};
import React, { useEffect } from "react";
import {
  TextInput,
  SelectInput,
  required,
  useRedirect,
} from "react-admin";
import { Box, Typography, useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

/* -------------------------------------------------------
 * 🔐 OrderCustomer 型別定義（Edit 用）
 * ------------------------------------------------------- */
interface OrderCustomer {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  billingCycle: string;
  note: string;
}

/* -------------------------------------------------------
 *  編輯客戶訂單頁面（UI 規格對齊 Create）
 * ------------------------------------------------------- */
export const OrderCustomerEdit: React.FC = () => {
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
      resource="order_customers"
      title="編輯客戶"
      onSuccess={(data) => {
        const order = data as OrderCustomer;

        showAlert({
          message: `客戶「${order.name}」資料已更新成功`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "order_customers"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🧾 編輯客戶資料
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <FormFieldRow sx={{ mb: 2 }}>
          <TextInput
            source="name"
            label="客戶 *"
            fullWidth
            validate={[required()]}
          />
          <TextInput
            source="contactPerson"
            label="聯絡人 *"
            fullWidth
            validate={[required()]}
          />
        </FormFieldRow>

        <FormFieldRow sx={{ mb: 2 }}>
          <SelectInput
            source="billingCycle"
            label="結帳週期 *"
            fullWidth
            validate={[required()]}
            choices={[
              { id: "WEEKLY", name: "每週" },
              { id: "BIWEEKLY", name: "每兩週" },
              { id: "MONTHLY", name: "每月" },
            ]}
          />
          <TextInput source="phone" label="電話" fullWidth />
        </FormFieldRow>

        <FormFieldRow sx={{ mb: 2 }}>
          <TextInput source="address" label="地址" fullWidth />
          <TextInput source="note" label="備註" fullWidth />
        </FormFieldRow>
      </Box>
    </GenericEditPage>
  );
};

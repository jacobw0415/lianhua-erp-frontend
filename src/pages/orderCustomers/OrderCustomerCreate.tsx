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
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

/* -------------------------------------------------------
 *  OrderCustomer 型別定義（Create 成功回傳用）
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
 *  新增客戶訂單頁面（UI 規格對齊 SaleCreate）
 * ------------------------------------------------------- */
export const OrderCustomerCreate: React.FC = () => {

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
      resource="order_customers"
      title="新增客戶訂單"
      onSuccess={(data) => {
        const order = data as OrderCustomer;

        showAlert({
          message: `客戶「${order.name}」訂單已成功建立`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "order_customers"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🧾 新增客戶訂單
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
    </GenericCreatePage>
  );
};

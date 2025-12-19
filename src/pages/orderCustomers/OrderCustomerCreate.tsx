import React from "react";
import {
  TextInput,
  SelectInput,
  required,
  useRedirect,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

/* -------------------------------------------------------
 * 🔐 OrderCustomer 型別定義（Create 成功回傳用）
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
 * ⭐ 新增客戶訂單頁面（UI 規格對齊 SaleCreate）
 * ------------------------------------------------------- */
export const OrderCustomerCreate: React.FC = () => {

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
        {/* 客戶 / 聯絡人 */}
        <Box display="flex" gap={2} mb={2} alignItems="center">
          <Box flex={1}>
            <TextInput
              source="name"
              label="客戶 *"
              fullWidth
              validate={[required()]}
            />
          </Box>

          <Box flex={1}>
            <TextInput
              source="contactPerson"
              label="聯絡人 *"
              fullWidth
              validate={[required()]}
            />
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={2} alignItems="center">
          {/* 結帳週期 */}
          <Box flex={1}>
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
          </Box>
          {/* 電話 */}
          <Box flex={1}>
            <TextInput
              source="phone"
              label="電話"
              fullWidth
            />
          </Box>
        </Box>

        <Box display="flex" gap={2} mb={2} alignItems="center">
          {/* 地址 */}
          <Box flex={1}>
            <TextInput
              source="address"
              label="地址"
              fullWidth
            />
          </Box>
          {/* 備註 */}
          <Box flex={1}>
            <TextInput
              source="note"
              label="備註"
              fullWidth
            />
          </Box>
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

import React from "react";
import {
  NumberInput,
  TextInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  useRedirect,
} from "react-admin";
import { Box, Typography } from "@mui/material";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { useActiveOrderCustomers } from "@/hooks/useActiveOrderCustomers";
import { useActiveProducts } from "@/hooks/useActiveProducts";

/* -------------------------------------------------------
 * 🔐 Order 型別定義（對齊後端）
 * ------------------------------------------------------- */
interface Order {
  id: number;
  orderNo: string;
  customerId: number;
  orderDate: string;
  deliveryDate?: string;
  orderStatus: "PENDING" | "CONFIRMED";
  note?: string;
  items: Array<{
    productId: number | "";
    qty: number;
  }>;
}

/* =======================================================
 * 📄 OrderCreate（v2.7 對齊版）
 * ======================================================= */
export const OrderCreate: React.FC = () => {
  const { customers, loading: customersLoading } = useActiveOrderCustomers();
  const { products, loading: productsLoading } = useActiveProducts();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="orders"
      title="新增訂單"
      width="970px"
      onSuccess={(data) => {
        const order = data as Order;

        showAlert({
          title: "新增成功",
          message: `訂單「${order.orderNo}」已成功建立`,
          severity: "success",
          hideCancel: true,
        });

        setTimeout(() => redirect("list", "orders"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        📋 新增訂單資訊
      </Typography>

      {/* ===================================================
       * 🔲 主版型
       * =================================================== */}
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) 420px",
          },
        }}
      >
        {/* ================= 左側：訂單主資料 ================= */}
        <Box sx={{ width: "100%", minWidth: 0 }}>
          {/* 客戶 + 訂單狀態 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 2,
            }}
          >
            <SelectInput
              source="customerId"
              label="客戶"
              choices={customers}
              optionText="name"
              optionValue="id"
              fullWidth
              isLoading={customersLoading}
              validate={[required()]}
            />

            <SelectInput
              source="orderStatus"
              label="訂單狀態"
              fullWidth
              defaultValue="PENDING"
              choices={[
                { id: "PENDING", name: "待確認" },
                { id: "CONFIRMED", name: "已確認" },
              ]}
            />
          </Box>

          {/* 日期 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 2,
            }}
          >
            <LhDateInput
              source="orderDate"
              label="訂單日期"
              fullWidth
              validate={[required()]}
            />

            <LhDateInput
              source="deliveryDate"
              label="交貨日期"
              fullWidth
            />
          </Box>

          {/* 備註 */}
          <TextInput source="note" label="備註" fullWidth />
        </Box>

        {/* ================= 右側：訂單項目 ================= */}
        <Box
          sx={(theme) => ({
            borderRadius: 2,
            width: "100%",
            maxWidth: 420,
            bgcolor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.divider}`,
            p: 3,
            minHeight: 380,
            maxHeight: 600,
            overflowY: "auto",
          })}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            📄 訂單項目
          </Typography>

          <ArrayInput
            source="items"
            label=""
            defaultValue={[{ productId: "", qty: 1 }]}
          >
            <SimpleFormIterator
              disableAdd
              disableRemove
              getItemLabel={() => ""}
            >
              <SelectInput
                source="productId"
                label="產品"
                choices={products}
                optionText="name"
                optionValue="id"
                fullWidth
                isLoading={productsLoading}
                validate={[required()]}
              />

              <NumberInput
                source="qty"
                label="數量"
                fullWidth
                min={1}
                validate={[required()]}
              />
            </SimpleFormIterator>
          </ArrayInput>
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

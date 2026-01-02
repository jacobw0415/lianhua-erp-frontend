import React, { useState, useEffect } from "react";
import {
  TextInput,
  SelectInput,
  required,
  useRedirect,
} from "react-admin";
import { useFormContext } from "react-hook-form";
import { Box, Typography } from "@mui/material";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { useActiveOrderCustomers } from "@/hooks/useActiveOrderCustomers";
import { useActiveProducts } from "@/hooks/useActiveProducts";

import {
  OrderProductSelector,
  type OrderItem,
} from "@/pages/orders/OrderProductSelector";

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
  items: OrderItem[];
}

/* =======================================================
 * 📄 OrderCreate（商品選擇器正式版）
 * ======================================================= */
export const OrderCreate: React.FC = () => {
  const { customers, loading: customersLoading } =
    useActiveOrderCustomers();
  const { products, loading: productsLoading } =
    useActiveProducts();

  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  /* ===============================
   * 訂單項目狀態（核心）
   * =============================== */
  const [items, setItems] = useState<OrderItem[]>([]);

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
      <ItemsFormSync items={items} setItems={setItems} />
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        📋 新增訂單資訊
      </Typography>

      {/* ===================================================
       * 🔲 主版型（左右高度拉齊）
       * =================================================== */}
      <Box
        sx={{
          display: "grid",
          gap: 4,
          alignItems: "stretch", // ⭐ 核心：左右欄底部對齊
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) 420px",
          },
        }}
      >
        {/* ================= 左側：訂單主資料 ================= */}
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
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

            />

            <LhDateInput
              source="deliveryDate"
              label="交貨日期"
              fullWidth
            />
          </Box>

          {/* 備註 */}
          <TextInput
            source="note"
            label="備註"
            fullWidth
            multiline
            minRows={6.3}
            sx={{
              "& .MuiInputBase-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* ================= 右側：訂單項目（表頭固定 + 摘要） ================= */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <OrderProductSelector
            products={products}
            value={items}
            onChange={setItems}
            disabled={productsLoading}
            visibleRows={4}
          />
          {/* 錯誤提示區域：固定高度，避免布局跳動 */}
          <Box
            sx={{
              height: 15, // 固定高度，對應 variant="caption" 的高度 + margin
              mt: 1,
              ml: 1,
            }}
          >
            {items.length === 0 && (
              <Typography variant="caption" color="error">
                請至少選擇一項商品
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

/* -------------------------------------------------------
 * 同步 items 到表單字段的組件
 * 將 items 狀態同步到隱藏的表單字段，以便提交
 * ------------------------------------------------------- */
const ItemsFormSync: React.FC<{
  items: OrderItem[];
  setItems: (items: OrderItem[]) => void;
}> = ({ items }) => {
  const { setValue } = useFormContext();

  // 同步 items 到表單字段
  useEffect(() => {
    setValue("items", items, { shouldValidate: false, shouldDirty: false });
  }, [items, setValue]);

  // 隱藏的字段，用於表單驗證和提交
  return (
    <TextInput
      source="items"
      label=""
      sx={{ display: "none" }}
      validate={[
        (value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            return "請至少選擇一項商品";
          }
          return undefined;
        },
      ]}
    />
  );
};

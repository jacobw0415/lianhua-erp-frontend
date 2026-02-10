import { useState, useEffect } from "react";
import { useTheme } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { List, TextField, DateField, FunctionField } from "react-admin";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";
import { CurrencyField } from "@/components/money/CurrencyField";
import { OrderPaymentStatusField } from "@/components/common/OrderPaymentStatusField";

import { OrderDetailDrawer } from "./OrderDetailDrawer";

/* ================================
 * 型別定義
 * ================================ */
type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";

interface OrderListRow {
  id: number;
  orderNo: string;
  customerName: string;
  orderDate: string;
  deliveryDate?: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  note?: string;
}

type SelectedOrder = OrderListRow;

/* ================================
 * Component
 * ================================ */
export const OrderList = () => {
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder | null>(null);

  const openDetails = (record: OrderListRow) => {
    setSelectedOrder(record);
    setOpenDetailDrawer(true);
  };

  const mapOrderForDrawer = (order: OrderListRow) => ({
    id: order.id,
    orderNo: order.orderNo,
    customerName: order.customerName,
    orderDate: order.orderDate,
    deliveryDate: order.deliveryDate,
    status: order.orderStatus,
    totalAmount: order.totalAmount,
    paymentStatus: order.paymentStatus,
    note: order.note,
  });

  return (
    <>
      <List
        title="訂單管理"
        actions={false}
        empty={false}
        pagination={<CustomPaginationBar showPerPage />}
        perPage={10}
      >
        <StyledListWrapper
          /* =========================
           * 快速篩選
           * ========================= */
          quickFilters={[
            { type: "text", source: "orderNo", label: "訂單編號" },
            { type: "text", source: "customerName", label: "客戶名稱" },
          ]}

          /* =========================
           * 進階篩選（含日期區間＋會計期間）
           * ========================= */
          advancedFilters={[
            {
              type: "month",
              source: "accountingPeriod",
              label: "會計期間 (YYYY-MM)",
            },
            {
              type: "date",
              source: "orderDateFrom",
              label: "訂單日期（起）",
            },
            {
              type: "date",
              source: "orderDateTo",
              label: "訂單日期（迄）",
            },
            {
              type: "date",
              source: "deliveryDateFrom",
              label: "交貨日期（起）",
            },
            {
              type: "date",
              source: "deliveryDateTo",
              label: "交貨日期（迄）",
            },
            {
              type: "select",
              source: "orderStatus",
              label: "訂單狀態",
              choices: [
                { id: "PENDING", name: "待確認" },
                { id: "CONFIRMED", name: "已確認" },
                { id: "DELIVERED", name: "已交付" },
              ],
            },
            {
              type: "select",
              source: "paymentStatus",
              label: "付款狀態",
              choices: [
                { id: "UNPAID", name: "未收款" },
                { id: "PAID", name: "已收款" },
              ],
            },
          ]}

          /* =========================
           * 匯出設定
           * ========================= */
          exportConfig={{
            filename: "order_export",
            format: "excel",
            columns: [
              { header: "訂單編號", key: "orderNo", width: 15 },
              { header: "客戶名稱", key: "customerName", width: 25 },
              { header: "訂單狀態", key: "orderStatus", width: 15 },
              { header: "付款狀態", key: "paymentStatus", width: 15 },
              { header: "訂單金額", key: "totalAmount", width: 18 },
              { header: "訂單日期", key: "orderDate", width: 15 },
              { header: "交貨日期", key: "deliveryDate", width: 15 },
              { header: "備註", key: "note", width: 15 },
            ],
          }}
        >
          <ResponsiveListDatagrid rowClick={false} tabletLayout="card">
            <TextField source="orderNo" label="訂單編號" />
            <TextField source="customerName" label="客戶" />
            <TextField source="orderStatus" label="訂單狀態" />
            <OrderPaymentStatusField source="paymentStatus" label="收款狀態" />
            <CurrencyField source="totalAmount" label="訂單金額" />
            <DateField source="orderDate" label="訂單日期" />
            <DateField source="deliveryDate" label="交貨日期" />

            <FunctionField
              label="明細"
              render={(record: OrderListRow) => (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetails(record);
                  }}
                  title="查看訂單明細"
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />

            <FunctionField
              label="操作"
              source="action"
              className="column-action"
              render={() => <ActionColumns />}
            />
          </ResponsiveListDatagrid>
        </StyledListWrapper>
      </List>

      <OrderDetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        order={selectedOrder ? mapOrderForDrawer(selectedOrder) : undefined}
      />
    </>
  );
};

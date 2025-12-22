import { useState } from "react";
import { List, TextField, DateField, FunctionField } from "react-admin";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { ActionColumns } from "@/components/common/ActionColumns";
import { CurrencyField } from "@/components/money/CurrencyField";

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
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder | null>(null);

  const openDetails = (record: OrderListRow) => {
    setSelectedOrder(record);
    setOpenDetailDrawer(true);
  };

  // Map OrderListRow to OrderDetailDrawer order format（保持型別對齊，僅重命名欄位）
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
          quickFilters={[
            { type: "text", source: "customerName", label: "客戶名稱" },
            { type: "text", source: "note", label: "備註" },
          ]}
          advancedFilters={[
            {
              type: "select",
              source: "orderStatus",
              label: "訂單狀態",
              choices: [
                { id: "PENDING", name: "待確認" },
                { id: "CONFIRMED", name: "已確認" },
                { id: "DELIVERED", name: "已交付" },
                { id: "CANCELLED", name: "已取消" },
              ],
            },
            {
              type: "select",
              source: "paymentStatus",
              label: "付款狀態",
              choices: [
                { id: "UNPAID", name: "未收款" },
                { id: "PARTIAL", name: "部分收款" },
                { id: "PAID", name: "已全額收款" },
              ],
            },
          ]}
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
          <StyledListDatagrid>
            <TextField source="orderNo" label="訂單編號" />
            <TextField source="customerName" label="客戶" />
            <TextField source="orderStatus" label="訂單狀態" />
            <TextField source="paymentStatus" label="付款狀態" />
            <CurrencyField source="totalAmount" label="訂單金額" />
            <DateField source="orderDate" label="訂單日期" />
            <DateField source="deliveryDate" label="交貨日期" />
            <TextField source="note" label="備註" />

            <FunctionField
              label="明細"
              render={(record: OrderListRow) => (
                <IconButton size="small" onClick={() => openDetails(record)}>
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
          </StyledListDatagrid>
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

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

/* =========================================================
 * 型別定義
 * ========================================================= */

interface OrderListRow {
  id: number;
  orderNo: string;
  customerName: string;
  orderDate: string;
  deliveryDate?: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  paidAmount?: number;
  balance?: number;
  note?: string;
  payments?: Array<{
    amount: number;
    payDate: string;
    method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
    note?: string;
  }>;
}

/* =========================================================
 * Drawer 資料來源
 * ========================================================= */

type SelectedOrder = {
  id: number;
  orderNo: string;
  customerName: string;
  orderDate: string;
  deliveryDate?: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  paidAmount?: number;
  balance?: number;
  note?: string;
  payments?: Array<{
    amount: number;
    payDate: string;
    method: "CASH" | "TRANSFER" | "CARD" | "CHECK";
    note?: string;
  }>;
};

/* =========================================================
 * Component
 * ========================================================= */

/**
 * 訂單列表
 */
export const OrderList = () => {
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder | null>(
    null
  );

  const openDetails = (record: OrderListRow) => {
    setSelectedOrder({
      id: record.id,
      orderNo: record.orderNo,
      customerName: record.customerName,
      orderDate: record.orderDate,
      deliveryDate: record.deliveryDate,
      status: record.status,
      totalAmount: record.totalAmount,
      paidAmount: record.paidAmount,
      balance: record.balance,
      note: record.note,
      payments: record.payments ?? [],
    });

    setOpenDetailDrawer(true);
  };

  return (
    <>
      <List
        title="訂單管理"
        actions={false}
        empty={false}
        pagination={<CustomPaginationBar showPerPage={true} />}
        perPage={10}
      >
        <StyledListWrapper
          /* =========================
           * 快速搜尋
           * ========================= */
          quickFilters={[
            { type: "text", source: "customerName", label: "客戶名稱" },
            { type: "text", source: "note", label: "備註" },
          ]}
          /* =========================
           * 進階搜尋
           * ========================= */
          advancedFilters={[
            {
              type: "select",
              source: "status",
              label: "訂單狀態",
              choices: [
                { id: "PENDING", name: "待處理" },
                { id: "CONFIRMED", name: "已確認" },
                { id: "DELIVERED", name: "已出貨" },
                { id: "COMPLETED", name: "已完成" },
                { id: "CANCELLED", name: "已取消" },
                { id: "PAID", name: "已付款" },
              ],
            },
            {
              type: "dateRange",
              sourceFrom: "orderDateFrom",
              sourceTo: "orderDateTo",
              label: "訂單日期",
            },
            {
              type: "dateRange",
              sourceFrom: "deliveryDateFrom",
              sourceTo: "deliveryDateTo",
              label: "交貨日期",
            },
            {
              type: "numberRange",
              sourceMin: "totalAmountMin",
              sourceMax: "totalAmountMax",
              label: "訂單金額",
            },
            {
              type: "text",
              source: "accountingPeriod",
              label: "會計期間（YYYY-MM）",
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
              { header: "訂單狀態", key: "status", width: 15 },
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
            <TextField source="status" label="狀態" />
            <CurrencyField source="totalAmount" label="訂單金額" />
            <DateField source="orderDate" label="訂單日期" />
            <DateField source="deliveryDate" label="交貨日期" />
            <TextField source="note" label="備註" />

            {/* 📋 明細 */}
            <FunctionField
              label="明細"
              render={(record: OrderListRow) => (
                <IconButton size="small" onClick={() => openDetails(record)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            />

            {/* 操作欄（查看 / 編輯 / 刪除） */}
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
        order={selectedOrder ?? undefined}
      />
    </>
  );
};

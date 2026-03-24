import { useEffect } from "react";
import {
  List,
  DateField,
  FunctionField,
  TextField,
  useRedirect,
} from "react-admin";
import { Button, useTheme } from "@mui/material";

import { ResponsiveListDatagrid } from "@/components/common/ResponsiveListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { CurrencyField } from "@/components/money/CurrencyField";
import { ReceiptStatusField } from "@/components/common/ReceiptStatusField";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { ReceiptActionColumns } from "./ReceiptActionColumns";

export type ReceiptMethod = "CASH" | "TRANSFER" | "CARD" | "CHECK";
export type ReceiptStatus = "ACTIVE" | "VOIDED";

export interface ReceiptListRow {
  id: number;
  orderId: number;
  orderNo: string;
  customerName: string;
  receivedDate: string;
  amount: number;
  method: ReceiptMethod;
  status?: ReceiptStatus;
  note?: string;
}

export const ReceiptList = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  return (
    <List
      title="收款管理"
      actions={false}
      empty={false}
      pagination={<CustomPaginationBar showPerPage />}
      perPage={10}
      sort={{ field: "receivedDate", order: "DESC" }}
    >
      <StyledListWrapper
        quickFilters={[{ type: "text", source: "customerName", label: "客戶名稱" }]}
        advancedFilters={[
          {
            type: "select",
            source: "method",
            label: "收款方式",
            choices: [
              { id: "CASH", name: "現金" },
              { id: "TRANSFER", name: "轉帳" },
              { id: "CARD", name: "刷卡" },
              { id: "CHECK", name: "支票" },
            ],
          },
          {
            type: "select",
            source: "status",
            label: "狀態",
            choices: [
              { id: "ACTIVE", name: "有效" },
              { id: "VOIDED", name: "作廢" },
            ],
          },
          {
            type: "month",
            source: "accountingPeriod",
            label: "會計期間 (YYYY-MM)",
          },
          {
            type: "dateRange",
            source: "receivedDate",
            label: "收款日期",
          },
        ]}
        exportConfig={{
          filename: "receipt_export",
          format: "excel",
          exportPickerTitle: "匯出收款紀錄",
          exportColumnPicker: false,
          backendExport: {
            resource: "receipts",
            defaultFormat: "xlsx",
            defaultScope: "all",
          },
          backendExportDateFilter: {
            source: "receivedDate",
            label: "收款日期（匯出條件）",
            mode: "range",
            listRangeFilterKeys: {
              from: "receivedDateStart",
              to: "receivedDateEnd",
            },
          },
          columns: [],
        }}
      >
        <ResponsiveListDatagrid tabletLayout="card">
          <FunctionField
            label="訂單編號"
            render={(record: ReceiptListRow) => <ReceiptOrderNoField record={record} />}
          />
          <TextField source="customerName" label="客戶" />
          <DateField source="receivedDate" label="收款日期" />
          <CurrencyField source="amount" label="收款金額" />
          <FunctionField
            label="收款方式"
            render={(record: ReceiptListRow) => {
              const methodMap: Record<ReceiptMethod, string> = {
                CASH: "現金",
                TRANSFER: "轉帳",
                CARD: "刷卡",
                CHECK: "支票",
              };
              return methodMap[record.method] || record.method;
            }}
          />
          <FunctionField
            label="狀態"
            className="cell-centered"
            render={(record: ReceiptListRow) => <ReceiptStatusField record={record} />}
          />
          <TextField source="accountingPeriod" label="會計期間" />
          <TextField source="note" label="備註" />
          <FunctionField
            label="操作"
            source="action"
            className="column-action"
            render={() => <ReceiptActionColumns />}
          />
        </ResponsiveListDatagrid>
      </StyledListWrapper>
    </List>
  );
};

const ReceiptOrderNoField = ({ record }: { record: ReceiptListRow }) => {
  const redirect = useRedirect();

  return (
    <Button
      variant="text"
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        redirect(`/orders/${record.orderId}`);
      }}
      sx={{
        color: "primary.main",
        fontWeight: 600,
        textTransform: "none",
        px: 0.5,
        "&:hover": { textDecoration: "underline" },
      }}
    >
      {record.orderNo}
    </Button>
  );
};
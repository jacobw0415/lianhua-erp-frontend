import {
  List,
  DateField,
  FunctionField,
  TextField,
  useRedirect,
} from "react-admin";
import { Button } from "@mui/material";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { CurrencyField } from "@/components/money/CurrencyField";
import { ReceiptStatusField } from "@/components/common/ReceiptStatusField";

/* ================================
 * 型別定義（對齊 ReceiptListResponseDto）
 * ================================ */
type ReceiptMethod = "CASH" | "TRANSFER" | "CARD" | "CHECK";
type ReceiptStatus = "ACTIVE" | "VOIDED";

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

/* ================================
 * Component
 * ================================ */
export const ReceiptList = () => {
  return (
    <List
      title="收款管理"
      actions={false}
      empty={false}
      pagination={<CustomPaginationBar showPerPage />}
      perPage={10}
    >
      <StyledListWrapper
        quickFilters={[
          { type: "text", source: "customerName", label: "客戶名稱" },
        ]}
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
            sourceFrom: "receivedDateFrom",
            sourceTo: "receivedDateTo",
            label: "收款日期",
          },
        ]}
        exportConfig={{
          filename: "receipt_export",
          format: "excel",
          columns: [
            { header: "收款日期", key: "receivedDate", width: 15 },
            { header: "訂單編號", key: "orderNo", width: 18 },
            { header: "客戶名稱", key: "customerName", width: 25 },
            { header: "收款金額", key: "amount", width: 18 },
            { header: "收款方式", key: "method", width: 15 },
            { header: "狀態", key: "status", width: 12 },
            { header: "會計期間", key: "accountingPeriod", width: 15 },
            { header: "備註", key: "note", width: 30 },
          ],
        }}
      >
        <StyledListDatagrid>

          {/* 訂單編號（可點擊） */}
          <FunctionField
            label="訂單編號"
            render={(record: ReceiptListRow) => (
              <ReceiptOrderNoField record={record} />
            )}
          />

          {/* 客戶 */}
          <TextField source="customerName" label="客戶" />

          {/* 收款日期 */}
          <DateField source="receivedDate" label="收款日期" />

          {/* 收款金額 */}
          <CurrencyField source="amount" label="收款金額" />

          {/* 收款方式 */}
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

          {/* 狀態 */}
          <FunctionField
            label="狀態"
            className="cell-centered"
            render={(record: ReceiptListRow) => (
              <ReceiptStatusField record={record} />
            )}
          />

          {/* 會計期間 */}
          <TextField source="accountingPeriod" label="會計期間" />

          {/* 備註 */}
          <TextField source="note" label="備註" />
        </StyledListDatagrid>
      </StyledListWrapper>
    </List>
  );
};

/* =========================================================
 * 訂單編號欄位（可點擊跳轉）
 * ========================================================= */
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



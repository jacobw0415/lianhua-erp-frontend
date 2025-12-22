import { useState } from "react";
import {
  List,
  DateField,
  FunctionField,
  TextField,
  useDataProvider,
  useNotify,
  useRefresh,
  useRedirect,
} from "react-admin";
import { Button, Stack, Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CancelIcon from "@mui/icons-material/Cancel";

import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { CurrencyField } from "@/components/money/CurrencyField";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

import { ReceiptDetailDrawer } from "./ReceiptDetailDrawer";

/* ================================
 * 型別定義（對齊 ReceiptListResponseDto）
 * ================================ */
type ReceiptStatus = "ACTIVE" | "VOID";
type ReceiptMethod = "CASH" | "TRANSFER" | "CARD" | "CHECK" | "SYSTEM_AUTO";

export interface ReceiptListRow {
  id: number;
  orderId: number;
  orderNo: string;
  customerName: string;
  receivedDate: string;
  amount: number;
  method: ReceiptMethod;
  status: ReceiptStatus;
  note?: string;
}

/* ================================
 * Component
 * ================================ */
export const ReceiptList = () => {
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptListRow | null>(
    null
  );

  const openDetails = (record: ReceiptListRow) => {
    setSelectedReceipt(record);
    setOpenDetailDrawer(true);
  };

  return (
    <>
      <List
        title="收款管理"
        actions={false}
        empty={false}
        pagination={<CustomPaginationBar showPerPage />}
        perPage={10}
      >
        <StyledListWrapper
          quickFilters={[
            { type: "text", source: "orderNo", label: "訂單編號" },
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
                { id: "SYSTEM_AUTO", name: "系統產生" },
              ],
            },
            {
              type: "select",
              source: "status",
              label: "狀態",
              choices: [
                { id: "ACTIVE", name: "正常" },
                { id: "VOID", name: "作廢" },
              ],
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
            ],
          }}
        >
          <StyledListDatagrid>
            {/* 收款日期 */}
            <DateField source="receivedDate" label="收款日期" />

            {/* 訂單編號（可點擊） */}
            <FunctionField
              label="訂單編號"
              render={(record: ReceiptListRow) => (
                <ReceiptOrderNoField record={record} />
              )}
            />

            {/* 客戶 */}
            <TextField source="customerName" label="客戶" />

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
                  SYSTEM_AUTO: "系統產生",
                };
                return methodMap[record.method] || record.method;
              }}
            />

            {/* 狀態 */}
            <FunctionField
              label="狀態"
              render={(record: ReceiptListRow) => (
                <Chip
                  size="small"
                  label={record.status === "ACTIVE" ? "正常" : "作廢"}
                  color={record.status === "ACTIVE" ? "success" : "default"}
                  variant="outlined"
                />
              )}
            />

            {/* 操作 */}
            <FunctionField
              label="操作"
              render={(record: ReceiptListRow) => (
                <ReceiptActions record={record} onView={openDetails} />
              )}
            />
          </StyledListDatagrid>
        </StyledListWrapper>
      </List>

      <ReceiptDetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        receipt={selectedReceipt ?? undefined}
      />
    </>
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

/* =========================================================
 * 收款操作（檢視 / 作廢）
 * ========================================================= */
const ReceiptActions = ({
  record,
  onView,
}: {
  record: ReceiptListRow;
  onView: (record: ReceiptListRow) => void;
}) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [openVoidConfirm, setOpenVoidConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVoid = async () => {
    if (loading || record.status === "VOID") return;

    setLoading(true);
    try {
      await dataProvider.update("receipts", {
        id: record.id,
        data: { status: "VOID" },
        previousData: record,
      });

      notify("收款記錄已作廢", { type: "success" });
      refresh();
    } catch (error: unknown) {
      let message = "作廢失敗";

      if (error && typeof error === "object") {
        if (
          "body" in error &&
          error.body &&
          typeof error.body === "object" &&
          "message" in error.body
        ) {
          message = String(error.body.message || "");
        } else if ("message" in error) {
          message = String((error as { message?: string }).message || "");
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      notify(message, { type: "error" });
    } finally {
      setLoading(false);
      setOpenVoidConfirm(false);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          size="small"
          variant="text"
          startIcon={<VisibilityIcon fontSize="small" />}
          onClick={(e) => {
            e.stopPropagation();
            onView(record);
          }}
        >
          檢視
        </Button>

        {record.status === "ACTIVE" && (
          <Button
            size="small"
            color="error"
            variant="text"
            startIcon={<CancelIcon fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              setOpenVoidConfirm(true);
            }}
            disabled={loading}
          >
            作廢
          </Button>
        )}
      </Stack>

      <GlobalAlertDialog
        open={openVoidConfirm}
        title="確認作廢"
        description={`確定要作廢收款記錄「${record.orderNo}」嗎？`}
        severity="error"
        confirmLabel="作廢"
        cancelLabel="取消"
        onClose={() => setOpenVoidConfirm(false)}
        onConfirm={handleVoid}
      />
    </>
  );
};

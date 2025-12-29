import { useState } from "react";
import {
  List,
  TextField,
  DateField,
  FunctionField,
  useRedirect,
  useUpdate,
  useNotify,
  useRefresh,
} from "react-admin";
import { Typography, } from "@mui/material";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";
import { StyledListWrapper } from "@/components/common/StyledListWrapper";
import { CurrencyField } from "@/components/money/CurrencyField";
import { CustomPaginationBar } from "@/components/pagination/CustomPagination";
import { PaymentStatusField } from "@/components/common/PaymentStatusField";
import { VoidReasonDialog } from "@/components/common/VoidReasonDialog";

/* =========================================================
 * 型別定義（Payment List Row）
 * ========================================================= */

interface PaymentListRow {
  id: number;

  payDate: string;
  supplierName: string;
  amount: number;
  method: "CASH" | "TRANSFER" | "CARD" | "CHECK";

  purchaseId?: number;
  purchaseNo?: string;

  accountingPeriod: string;
  note?: string;

  status?: "ACTIVE" | "VOIDED";
  voidedAt?: string;
  voidReason?: string;
}

/* =========================================================
 * Component
 * ========================================================= */

export const PaymentList = () => {
  const redirect = useRedirect();
  const [openVoidDialog, setOpenVoidDialog] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [update, ] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();


  const handleVoid = (reason?: string) => {
    if (!selectedPaymentId) {
      notify("無法取得付款單 ID", { type: "error" });
      return;
    }

    update(
      "payments",
      {
        id: selectedPaymentId,
        data: { reason },
        meta: { endpoint: "void" },
      },
      {
        onSuccess: () => {
          notify("付款單已成功作廢", { type: "success" });
          setOpenVoidDialog(false);
          setSelectedPaymentId(null);
          refresh();
        },
        onError: (error) => {
          const errorMessage =
            (error as any)?.body?.message || (error as any)?.message || "作廢失敗";
          notify(errorMessage, { type: "error" });
        },
      }
    );
  };

  return (
    <List
      title="付款紀錄"
      actions={false}
      pagination={<CustomPaginationBar showPerPage />}
      perPage={10}
    >
      <StyledListWrapper
        disableCreate
        quickFilters={[
          { type: "text", source: "supplierName", label: "供應商名稱" },
        ]}
        advancedFilters={[
          {
            type: "select",
            source: "method",
            label: "付款方式",
            choices: [
              { id: "CASH", name: "現金" },
              { id: "TRANSFER", name: "匯款" },
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
          { type: "date", source: "fromDate", label: "付款日（起）" },
          { type: "date", source: "toDate", label: "付款日（迄）" },
        ]}
        exportConfig={{
          filename: "payment_export",
          format: "excel",
          columns: [
            { header: "進貨單號", key: "purchaseNo", width: 18 },
            { header: "付款日期", key: "payDate", width: 14 },
            { header: "供應商", key: "supplierName", width: 20 },
            { header: "金額", key: "amount", width: 12 },
            { header: "付款方式", key: "method", width: 10 },
            { header: "狀態", key: "status", width: 10 },
            { header: "會計期間", key: "accountingPeriod", width: 10 },
            { header: "備註", key: "note", width: 20 },
          ],
        }}
      >
        <StyledListDatagrid>
          {/* 進貨單號（可點擊） */}
          <FunctionField
            label="進貨單號"
            render={(record: PaymentListRow) =>
              record.purchaseNo && record.purchaseId ? (
                <Typography
                  sx={{
                    color: "primary.main",
                    cursor: "pointer",
                    fontWeight: 600,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    redirect(`/purchases/${record.purchaseId}`);
                  }}
                >
                  #{record.purchaseNo}
                </Typography>
              ) : (
                "-"
              )
            }
          />

          <TextField source="supplierName" label="供應商" />
          <DateField source="payDate" label="付款日期" />
          <CurrencyField source="amount" label="金額" />
          <TextField source="method" label="付款方式" />
          {/* 狀態欄位 */}
          <FunctionField
            label="狀態"
            render={(record: PaymentListRow) => (
              <PaymentStatusField
                source="status"
                record={record}
              />
            )}
          />
          <TextField source="accountingPeriod" label="會計期間" />
          <TextField source="note" label="備註" />
        </StyledListDatagrid>
      </StyledListWrapper>

      {/* 作廢原因輸入對話框 */}
      <VoidReasonDialog
        open={openVoidDialog}
        title="作廢付款單"
        description="確定要作廢此付款單嗎？作廢後系統會重新計算相關進貨單的付款狀態。"
        confirmLabel="確認作廢"
        cancelLabel="取消"
        onClose={() => {
          setOpenVoidDialog(false);
          setSelectedPaymentId(null);
        }}
        onConfirm={handleVoid}
      />
    </List>
  );
};
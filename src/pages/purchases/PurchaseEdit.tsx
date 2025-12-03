import React from "react";
import {
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
  SelectInput,
  useRecordContext,
  useRedirect,
} from "react-admin";

import { useWatch } from "react-hook-form";
import { Box, Typography, Alert } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { GenericSubTablePanel } from "@/components/common/GenericSubTablePanel";
import { CustomClearButton } from "@/components/forms/CustomClearButton";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput"; 


/* ================================
 * 📄 PurchaseEdit 主頁（修正版）
 * ================================ */
export const PurchaseEdit: React.FC = () => {
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="purchases"
      title="編輯進貨資料"
      width="970px"
      onSuccess={(data) => {
        showAlert({
          title: "更新成功",
          message: `已成功更新進貨單「${data.item}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "purchases"), 600);
      }}
      onDeleteSuccess={(record) => {
        showAlert({
          title: "刪除成功",
          message: `已成功刪除進貨單「${record.item}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "purchases"), 600);
      }}
    >
      <PurchaseFormFields />
    </GenericEditPage>
  );
};


/* ================================
 * 📌 主內容區：左右雙欄
 * ================================ */
const PurchaseFormFields: React.FC = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

  const payments = record.payments || [];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        📦 編輯進貨資訊
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          gap: 4,
          alignItems: "start",
        }}
      >
        {/* 左側：歷史付款紀錄 + 狀態 */}
        <Box sx={{ width: "100%" }}>
          <GenericSubTablePanel
            title="💰 歷史付款紀錄"
            rows={payments}
            columns={[
              { source: "amount", label: "金額", type: "currency" },
              { source: "payDate", label: "付款日期", type: "date" },
              { source: "method", label: "付款方式", type: "text" },
              { source: "note", label: "備註", type: "text" },
            ]}
          />

          {/* 目前付款狀態區 */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              p: 2,
              mt: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              💡 目前付款狀況
            </Typography>

            <Typography>💰 總金額：<b>${record.totalAmount?.toFixed(2)}</b></Typography>
            <Typography>✅ 已付款：<b>${record.paidAmount?.toFixed(2)}</b></Typography>
            <Typography>💸 剩餘額：<b>${record.balance?.toFixed(2)}</b></Typography>

            <Alert
              severity={
                record.status === "PAID"
                  ? "success"
                  : record.status === "PARTIAL"
                  ? "warning"
                  : "info"
              }
              sx={{ mt: 1 }}
            >
              狀態：{record.status}
            </Alert>
          </Box>
        </Box>

        {/* 右側：新增付款紀錄 */}
        <Box
          sx={{
            width: "400px",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            p: 3,
            minHeight: "425px",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            ➕ 新增付款紀錄
          </Typography>

          <PaymentArrayInput />
        </Box>
      </Box>
    </Box>
  );
};


/* ================================
 * 🔧 新增付款紀錄輸入區
 * ================================ */
const PaymentArrayInput: React.FC = () => {
  const payments = useWatch({ name: "newPayments" });
  const hasPayment = Array.isArray(payments) && payments.length > 0;

  return (
    <ArrayInput source="newPayments" label="">
      <SimpleFormIterator
        disableAdd={hasPayment}
        disableRemove={true}
        getItemLabel={() => ""}
      >
        <NumberInput source="amount" label="金額" sx={{ flex: 1 }} />

        {/* ⭐ 改成你自己的日期元件 */}
        <LhDateInput source="payDate" label="付款日期" />

        <SelectInput
          source="method"
          label="付款方式"
          choices={[
            { id: "CASH", name: "現金" },
            { id: "TRANSFER", name: "轉帳" },
            { id: "CARD", name: "刷卡" },
            { id: "CHECK", name: "支票" },
          ]}
          sx={{ flex: 1 }}
        />

        <CustomClearButton
          onClear={({ setValue }) => {
            setValue("newPayments.0.amount", "");
            setValue("newPayments.0.payDate", "");
            setValue("newPayments.0.method", "");
          }}
        />
      </SimpleFormIterator>
    </ArrayInput>
  );
};

import React from "react";
import {
  NumberInput,
  DateInput,
  ArrayInput,
  SimpleFormIterator,
  SelectInput,
  useRecordContext,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { Box, Typography, Alert } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { GenericSubTablePanel } from "@/components/common/GenericSubTablePanel";
import { CustomClearButton } from "@/components/forms/CustomClearButton";


/**
 * ================================
 * 📄 PurchaseEdit 主頁
 * ================================
 */
export const PurchaseEdit: React.FC = () => (
  <GenericEditPage
    resource="purchases"
    title="編輯進貨紀錄"
    successMessage="✅ 進貨資料已成功修改"
    errorMessage="❌ 修改失敗，請確認欄位或伺服器狀態"
    width="970px"
  >
    <PurchaseFormFields />
  </GenericEditPage>
);

/**
 * ================================
 * 📌 主內容區：左右雙欄
 * ================================
 */
const PurchaseFormFields: React.FC = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

  const payments = record.payments || [];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        📦 編輯進貨資訊
      </Typography>

      {/* =======================
          🧱 雙欄佈局（左固定寬度）
         ======================= */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "400px 1fr", // ⭐ 左側固定寬度、右側自適應
          gap: 4,
          alignItems: "start",
        }}
      >
        {/* =======================
            📌 左側：歷史紀錄 + 狀態區
           ======================= */}
        <Box sx={{ width: "100%" }}>
          {/* 💰 歷史付款紀錄 */}
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

          {/* 💡 目前付款狀況 */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              p: 2,
              mt: 2,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              💡 目前付款狀況
            </Typography>

            <Typography sx={{ mb: 0.5 }}>
              💰 總金額：<b>${record.totalAmount?.toFixed(2)}</b>
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              ✅ 已付款：<b>${record.paidAmount?.toFixed(2)}</b>
            </Typography>
            <Typography sx={{ mb: 0.5 }}>
              💸 剩餘額：<b>${record.balance?.toFixed(2)}</b>
            </Typography>

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

        {/* =======================
            📌 右側：新增付款紀錄
           ======================= */}
        <Box
          sx={{
            width: "400px",
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            p: 3,
            minHeight: "425px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            ➕ 新增付款紀錄
          </Typography>

          <PaymentArrayInput />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * ================================
 * 🔧 新增付款紀錄輸入區
 * ================================
 */
const PaymentArrayInput: React.FC = () => {
  const payments = useWatch({ name: "newPayments" });
  const hasPayment = Array.isArray(payments) && payments.length > 0;

  return (
    <ArrayInput source="newPayments" label="">
      <SimpleFormIterator
        disableAdd={hasPayment}
        disableRemove={true}
        getItemLabel={() => ""}
        sx={{
          "& .RaSimpleFormIterator-line": {
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1,
          },
          "& .RaSimpleFormIterator-add": {
            display: hasPayment ? "none" : "flex",
          },
        }}
      >
        <NumberInput source="amount" label="金額" sx={{ flex: 1 }} />
        <DateInput source="payDate" label="付款日期" sx={{ flex: 1 }} />
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
            setValue("newPayments.0.payDate", null);
            setValue("newPayments.0.method", "");
          }}
        />

      </SimpleFormIterator>
    </ArrayInput>
  );
};

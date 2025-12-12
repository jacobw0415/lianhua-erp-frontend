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
import { CurrencyField } from "@/components/money/CurrencyField";


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
        setTimeout(() => redirect("list", "purchases"));
      }}
      onDeleteSuccess={(record) => {
        showAlert({
          title: "刪除成功",
          message: `已成功刪除進貨單「${record.item}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "purchases"));
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
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        📦 編輯進貨資訊
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "400px 1fr",
          gap: 4,
          alignItems: "start",
          height: "370px",
        }}
      >
        {/* 左側：歷史付款紀錄 + 狀態 */}
        <Box sx={{ width: "100%", }}>
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
            sx={(theme) => ({
              borderRadius: "10px",
              bgcolor: theme.palette.background.paper, //  卡片背景
              border: `2px solid ${theme.palette.divider}`, //  統一邊框風格
              p: 0.7,
              mt: 0.7,
            })}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, backgroundColor: "#9d99995b", borderRadius: "5px", }}>
              💡 目前付款進度
            </Typography>

            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              💰 總金額：
              <b><CurrencyField source="totalAmount" /></b>
            </Typography>

            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              ✅ 已付款：
              <b><CurrencyField source="paidAmount" /></b>
            </Typography>

            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              💸 剩餘額：
              <b><CurrencyField source="balance" /></b>
            </Typography>

            <Alert
              severity={
                record.status === "PAID"
                  ? "success"
                  : record.status === "PARTIAL"
                    ? "warning"
                    : "info"
              }
              sx={{ mt: 0.3 }}
            >
              狀態：{record.status}
            </Alert>
          </Box>
        </Box>

        {/* 右側：新增付款紀錄 */}
        <Box
          sx={(theme) => ({
            borderRadius: 2,
            width: "400px",
            bgcolor: theme.palette.background.paper, //  卡片背景
            border: `2px solid ${theme.palette.divider}`, //  統一邊框風格
            p: 3,
            minHeight: "380px",
          })}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
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
        disableReordering={true}
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
          sx={{ flex: 1, marginTop: 2.5 }}
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

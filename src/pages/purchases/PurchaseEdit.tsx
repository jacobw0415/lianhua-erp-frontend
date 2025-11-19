import React from "react";
import {
  NumberInput,
  DateInput,
  ArrayInput,
  SimpleFormIterator,
  SelectInput,
  useRecordContext,
  NumberField,
  DateField,
  TextField,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { Box, Typography, Alert } from "@mui/material";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { StyledListDatagrid } from "@/components/StyledListDatagrid";

export const PurchaseEdit: React.FC = () => (
  <GenericEditPage
    resource="purchases"
    title="編輯進貨紀錄"
    successMessage="✅ 進貨資料已成功修改"
    errorMessage="❌ 修改失敗，請確認欄位或伺服器狀態"
    width="1100px"
  >
    <PurchaseFormFields />
  </GenericEditPage>
);

const PurchaseFormFields: React.FC = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

  const payments = record.payments || [];
  const enableScroll = payments.length > 2;
  const maxHeight = enableScroll ? "140px" : "auto";

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        📦 編輯進貨資訊
      </Typography>

      {/* 🧱 雙欄配置 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          alignItems: "start",
        }}
      >
        {/* ===== 左半部 ===== */}
        <Box>
          {/* 💰 歷史付款紀錄 */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              p: 1.5,
              mb: 1.5,
              transition: "box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              },
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              💰 歷史付款紀錄
            </Typography>

            {payments.length ? (
              <StyledListDatagrid
                data={payments}
                rowClick={false}
                bulkActionButtons={false}
                maxHeight={maxHeight} // ✅ 多筆時固定框高並可滾動
                sx={{
                  "& .MuiTable-root": {
                    tableLayout: "auto",
                    width: "100%",
                  },
                  "& .MuiTableCell-root": {
                    py: 0.8,
                    px: 1.5,
                    whiteSpace: "nowrap",
                  },
                  "& .column-amount": { minWidth: "100px" },
                  "& .column-payDate": { minWidth: "120px" },
                  "& .column-method": { minWidth: "100px" },
                  "& .column-note": { minWidth: "140px" },
                }}
              >
                <NumberField
                  source="amount"
                  label="金額"
                  options={{
                    style: "currency",
                    currency: "TWD",
                    minimumFractionDigits: 0,
                  }}
                />
                <DateField source="payDate" label="付款日期" />
                <TextField source="method" label="付款方式" />
                <TextField source="note" label="備註" />
              </StyledListDatagrid>
            ) : (
              <Typography color="text.secondary">目前尚無付款紀錄</Typography>
            )}
          </Box>

          {/* 💡 目前付款狀況 */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              p: 1,
              transition: "box-shadow 0.2s ease",
              "&:hover": {
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              },
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

        {/* ===== 右半部：新增付款紀錄 ===== */}
        <Box
          sx={{
            border: "1px dashed #bdbdbd",
            borderRadius: "10px",
            p: 2.5,
            transition: "box-shadow 0.2s ease",
            "&:hover": {
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            },
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

          {/* ✅ 動態控制表單 */}
          <PaymentArrayInput />
        </Box>
      </Box>
    </Box>
  );
};

/**
 * ✅ PaymentArrayInput 子元件
 * 使用 useWatch 動態監聽輸入狀態，自動控制「＋」按鈕顯示。
 */
const PaymentArrayInput: React.FC = () => {
  const payments = useWatch({ name: "newPayments" });
  const hasPayment = Array.isArray(payments) && payments.length > 0;

  return (
    <ArrayInput source="newPayments" label="">
      <SimpleFormIterator
        disableAdd={hasPayment}
        disableRemove={false}
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
      </SimpleFormIterator>
    </ArrayInput>
  );
};

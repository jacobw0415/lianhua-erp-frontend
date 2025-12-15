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
import { Box, Typography, Alert, Chip } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { GenericSubTablePanel } from "@/components/common/GenericSubTablePanel";
import { CustomClearButton } from "@/components/forms/CustomClearButton";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { CurrencyField } from "@/components/money/CurrencyField";


/* -------------------------------------------------------
 * 🔐 Purchase 型別定義（Edit 成功回傳 / Record 用）
 * ------------------------------------------------------- */
interface Purchase {
  id: number;
  purchaseNo: string;
  supplierName?: string;     //  只讀顯示用
  purchaseDate?: string;     //  只讀顯示用
  status?: "PENDING" | "PARTIAL" | "PAID";
  totalAmount?: number;
  paidAmount?: number;
  balance?: number;
  payments?: Array<{
    amount?: number;
    payDate?: string;
    method?: string;
    note?: string;
  }>;
}

/* ================================
 * 📄 PurchaseEdit 主頁
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
        const purchase = data as Purchase;
        showAlert({
          title: "更新成功",
          message: `已成功更新進貨單「${purchase.purchaseNo}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "purchases"));
      }}
      onDeleteSuccess={(record) => {
        const purchase = record as Purchase;
        showAlert({
          title: "刪除成功",
          message: `已成功刪除進貨單「${purchase.purchaseNo}」`,
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
  const record = useRecordContext<Purchase>();
  if (!record) return <Typography>載入中...</Typography>;

  const payments = (record.payments || []).map((p, index) => ({
    id: index + 1,       // 付款編號
    ...p,
  }));


  return (
    <Box>
      {/* 🔹 Header Row：固定左右欄位，不因內容改變 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "430px 1fr",
          alignItems: "center",
        }}
      >
        {/* 左側標題（永遠穩定） */}
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📦 編輯進貨資訊
        </Typography>

        {/* 右側 Read-only Summary（固定寬度） */}
        <Box
          sx={ ({
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            py: 0.25,
            fontSize: "0.8rem",
            overflow: "hidden",          
          })}
        >
          {/* PO No（不截） */}
          <Box component="span" sx={{ fontWeight: 600, flexShrink: 0 }}>
            {record.purchaseNo}
          </Box>

          {/* 供應商（唯一可伸縮） */}
          {record.supplierName && (
            <Box
              component="span"
              sx={{
                flex: 1,                  // ⭐ 吃剩餘空間
                minWidth: 0,              // ⭐ ellipsis 必要
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={record.supplierName}
            >
              ｜{record.supplierName}
            </Box>
          )}

          {/* 日期（固定） */}
          {record.purchaseDate && (
            <Box component="span" sx={{ flexShrink: 0 }}>
              ｜{record.purchaseDate}
            </Box>
          )}

          {/* 狀態 Chip（固定，不影響布局） */}
          {record.status && (
            <Chip
              size="small"
              label={record.status}
              color={
                record.status === "PAID"
                  ? "success"
                  : record.status === "PARTIAL"
                    ? "warning"
                    : "default"
              }
             
            />
          )}
        </Box>
      </Box>

      {/* 🔹 主要內容區（高度完全不動） */}
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

          <Box
            sx={(theme) => ({
              borderRadius: "10px",
              bgcolor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.divider}`,
              p: 0.7,
              mt: 0.7,
            })}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                mb: 1,
                backgroundColor: "#9d99995b",
                borderRadius: "5px",
              }}
            >
              💡 目前付款進度
            </Typography>

            <Typography>
              💰 總金額：<b><CurrencyField source="totalAmount" /></b>
            </Typography>
            <Typography>
              ✅ 已付款：<b><CurrencyField source="paidAmount" /></b>
            </Typography>
            <Typography>
              💸 剩餘額：<b><CurrencyField source="balance" /></b>
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
            bgcolor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.divider}`,
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
        disableRemove
        disableReordering
        getItemLabel={() => ""}
      >
        <NumberInput source="amount" label="金額" />

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
          sx={{ mt: 2.5 }}
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
import React, { useEffect } from "react";
import {
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
  SelectInput,
  useRecordContext,
  useRedirect,
} from "react-admin";

import { useWatch } from "react-hook-form";
import { Box, Typography, Alert, Chip, useTheme } from "@mui/material";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { GenericSubTablePanel } from "@/components/common/GenericSubTablePanel";
import { FormFieldRow } from "@/components/common/FormFieldRow";
import { CustomClearButton } from "@/components/forms/CustomClearButton";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { CurrencyField } from "@/components/money/CurrencyField";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

/* -------------------------------------------------------
 * 🔐 Purchase 型別定義 (同步 Drawer 的欄位)
 * ------------------------------------------------------- */
interface Purchase {
  id: number;
  purchaseNo: string;
  supplierName?: string;
  purchaseDate?: string;
  status?: "PENDING" | "PARTIAL" | "PAID";
  totalAmount?: number;
  paidAmount?: number;
  balance?: number;
  // --- 同步 Drawer 的作廢欄位 ---
  recordStatus?: "ACTIVE" | "VOIDED"; 
  voidedAt?: string;
  voidReason?: string;
  // ----------------------------
  payments?: Array<{
    amount?: number;
    payDate?: string;
    method?: string;
    note?: string;
    status?: string;
  }>;
}

/* ================================
 * 📄 PurchaseEdit 主頁
 * ================================ */
export const PurchaseEdit: React.FC = () => {
  const theme = useTheme();
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="purchases"
      title="進貨單付款管理"
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

  // 修改判斷邏輯：同步 Drawer 使用 recordStatus
  const isVoided = record.recordStatus === "VOIDED";

  const payments = (record.payments || []).map((p, index) => ({
    id: index + 1,
    ...p,
  }));

  return (
    <Box>
      {/* 🔹 Header（響應式：手機各區塊直立單列、電腦橫向排列） */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1.5, sm: 2 },
          mb: isVoided ? 2 : 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📦 編輯進貨付款資訊
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            flexWrap: "wrap",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: { xs: 0.75, sm: 1 },
            fontSize: "0.8rem",
            flex: { sm: 1 },
            justifyContent: { xs: "flex-start", sm: "flex-end" },
            width: "100%",
          }}
        >
          {/* 手機：第一行 單號｜日期｜狀態，第二行 廠商 */}
          {/* 電腦：單行 單號｜廠商｜日期｜狀態 */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Box component="span" sx={{ fontWeight: 600 }}>
              {record.purchaseNo}
            </Box>
            {record.supplierName && (
              <Box
                component="span"
                sx={{
                  color: "text.secondary",
                  display: { xs: "none", sm: "inline" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 200,
                }}
                title={record.supplierName}
              >
                ｜{record.supplierName}
              </Box>
            )}
            {record.purchaseDate && (
              <Box component="span" sx={{ color: "text.secondary" }}>
                ｜{record.purchaseDate}
              </Box>
            )}
            <Chip
              size="small"
              label={isVoided ? "已作廢" : record.status}
              color={
                isVoided ? "error" :
                record.status === "PAID" ? "success" :
                record.status === "PARTIAL" ? "warning" : "default"
              }
            />
          </Box>
          {record.supplierName && (
            <Box
              sx={{
                width: "100%",
                color: "text.secondary",
                fontSize: "0.8rem",
                display: { xs: "block", sm: "none" },
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
              }}
              title={record.supplierName}
            >
              廠商：{record.supplierName}
            </Box>
          )}
        </Box>
      </Box>

      {/* ⚠️ 作廢資訊顯示區 (欄位已同步為 voidedAt 與 voidReason) */}
      {isVoided && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            borderRadius: "8px",
            bgcolor: "rgba(33, 22, 10, 0.8)", 
            border: "1px solid rgba(255, 165, 0, 0.4)",
          }}
        >
          <Typography sx={{ color: "#FFB74D", fontWeight: "bold", mb: 0.5 }}>
            ⚠️ 此進貨單已作廢，無法編輯
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 3.5 }}>
            作廢時間：{record.voidedAt || "未紀錄"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", opacity: 0.9, ml: 3.5 }}>
            作廢原因：{record.voidReason || "無"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#E0E0E0", ml: 3.5, mt: 1 }}>
            如需更正，請建立新紀錄。
          </Typography>
        </Box>
      )}

      {/* 🔹 主要內容區 (響應式：手機單欄、電腦雙欄) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "400px 1fr" },
          gap: 4,
          alignItems: "start",
          minHeight: { xs: "auto", md: "370px" },
        }}
      >
        {/* 左側：歷史付款紀錄（手機時直立單列） */}
        <Box sx={{ width: "100%", minWidth: 0 }}>
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
              p: { xs: 1.5, sm: 0.7 },
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
                px: 1,
              }}
            >
              💡 目前付款進度
            </Typography>

            <Typography sx={{ px: 1 }}>
              💰 總金額：<b><CurrencyField source="totalAmount" /></b>
            </Typography>
            <Typography sx={{ px: 1 }}>
              ✅ 已付款：<b><CurrencyField source="paidAmount" /></b>
            </Typography>
            <Typography sx={{ px: 1 }}>
              💸 剩餘額：<b><CurrencyField source="balance" /></b>
            </Typography>

            <Alert
              severity={isVoided ? "error" : record.status === "PAID" ? "success" : "info"}
              sx={{ mt: 0.3 }}
            >
              狀態：{isVoided ? "已作廢" : record.status}
            </Alert>
          </Box>
        </Box>

        {/* 右側：新增區 (作廢時鎖定) */}
        <Box
          sx={(theme) => ({
            borderRadius: 2,
            width: { xs: "100%", md: "400px" },
            maxWidth: "100%",
            bgcolor: theme.palette.background.paper,
            border: `2px solid ${theme.palette.divider}`,
            p: { xs: 2, sm: 3 },
            minHeight: { xs: "auto", md: "380px" },
            ...(isVoided && {
              opacity: 0.5,
              pointerEvents: "none",
            }),
          })}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {isVoided ? "🚫 單據已鎖定" : "➕ 新增付款紀錄"}
            </Typography>
          </Box>

          {!isVoided ? (
            <PaymentArrayInput />
          ) : (
            <Box sx={{ mt: 10, textAlign: 'center', py: 5 }}>
              <Typography color="error" sx={{ fontWeight: 'bold' }}>
                🔒 此單據已作廢，功能已鎖定
              </Typography>
            </Box>
          )}
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
        <FormFieldRow sx={{ mb: 2 }}>
          <NumberInput source="amount" label="金額" fullWidth />
        </FormFieldRow>
        <FormFieldRow sx={{ mb: 2 }}>
          <LhDateInput source="payDate" label="付款日期" fullWidth />
        </FormFieldRow>
        <FormFieldRow sx={{ mb: 2 }}>
          <SelectInput
            source="method"
            label="付款方式"
            fullWidth
            choices={[
              { id: "CASH", name: "現金" },
              { id: "TRANSFER", name: "轉帳" },
              { id: "CARD", name: "刷卡" },
              { id: "CHECK", name: "支票" },
            ]}
          />
        </FormFieldRow>
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
import React from "react";
import {
  NumberInput,
  TextInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  useRedirect,
} from "react-admin";
import { useWatch } from "react-hook-form";
import { Box, Typography } from "@mui/material";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { CustomClearButton } from "@/components/forms/CustomClearButton";
import { useActiveSuppliers } from "@/hooks/useActiveSuppliers";

/* -------------------------------------------------------
 * 🔐 Purchase 型別定義（Create 成功回傳用）
 * ------------------------------------------------------- */
interface Purchase {
  id: number;
  purchaseNo: string;
  supplierId: number;
  note?: string;
  qty?: number;
  unit?: string;
  unitPrice?: number;
  purchaseDate?: string;
  payments?: Array<{
    amount?: number;
    payDate?: string;
    method?: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  }>;
}

export const PurchaseCreate: React.FC = () => {
  const { suppliers, loading } = useActiveSuppliers();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="purchases"
      title="新增進貨紀錄"
      width="970px"
      onSuccess={(data) => {
        const purchase = data as Purchase;

        showAlert({
          title: "新增成功",
          message: `進貨單「${purchase.purchaseNo}」已成功建立`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "purchases"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        📦 新增進貨資訊
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 4 }}>
        {/* 左側欄位 */}
        <Box sx={{ maxWidth: 600, width: "100%" }}>
          {/* 第一列：供應商 */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <SelectInput
                source="supplierId"
                label="供應商"
                choices={suppliers}
                optionText="name"
                optionValue="id"
                fullWidth
                isLoading={loading}
                validate={[required()]}
              />
            </Box>

            <Box flex={1}>
              <SelectInput
                source="unit"
                label="單位"
                fullWidth
                validate={[required()]}
                choices={[
                  { id: "斤", name: "斤" },
                  { id: "公斤", name: "公斤" },
                  { id: "箱", name: "箱" },
                  { id: "盒", name: "盒" },
                  { id: "包", name: "包" },
                  { id: "瓶", name: "瓶" },
                  { id: "顆", name: "顆" },
                  { id: "本", name: "本" },
                ]}
              />
            </Box>
          </Box>

          {/* 第三列：數量 + 單價 */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <NumberInput
                source="qty"
                label="數量"
                fullWidth
                validate={[required()]}
              />
            </Box>

            <Box flex={1}>
              <NumberInput
                source="unitPrice"
                label="單價"
                fullWidth
                validate={[required()]}
              />
            </Box>
          </Box>

          {/* 第二列：品項 + 備註 */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <TextInput
                source="item"
                label="品項"
                fullWidth
                validate={[required()]}
              />
            </Box>
            <Box flex={1}>
              <TextInput
                source="note"
                label="備註"
                fullWidth
                minRows={2}
              />
            </Box>
          </Box>

          {/* 第四列：單位 + 進貨日期（兩兩相並） */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <LhDateInput
                source="purchaseDate"
                label="進貨日期"
                fullWidth
              />
            </Box>
          </Box>
        </Box>

        {/* 右側付款區 */}
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
    </GenericCreatePage>
  );
};

/* -------------------------------------------------------
 * 🔧 付款區
 * ------------------------------------------------------- */
const PaymentArrayInput: React.FC = () => {
  const payments = useWatch({ name: "payments" });
  const hasPayment = Array.isArray(payments) && payments.length > 0;

  return (
    <ArrayInput source="payments" label="">
      <SimpleFormIterator
        disableAdd={hasPayment}
        disableRemove
        getItemLabel={() => ""}
      >
        <NumberInput source="amount" label="金額" sx={{ flex: 1 }} />

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
            setValue("payments.0.amount", "");
            setValue("payments.0.payDate", null);
            setValue("payments.0.method", "");
          }}
        />
      </SimpleFormIterator>
    </ArrayInput>
  );
};
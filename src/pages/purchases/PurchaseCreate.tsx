import React, { useState, useEffect } from "react";
import {
  TextInput,
  SelectInput,
  NumberInput,
  ArrayInput,
  SimpleFormIterator,
  required,
  useRedirect,
  minValue,
} from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";
import { Box, Typography, useTheme } from "@mui/material";
import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { LhDateInput } from "@/components/inputs/LhDateInput";
import { CustomClearButton } from "@/components/forms/CustomClearButton";
import { useActiveSuppliers } from "@/hooks/useActiveSuppliers";
import {
  PurchaseItemSelector,
  type PurchaseItem,
} from "@/pages/purchases/PurchaseItemSelector";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles"; 

/* -------------------------------------------------------
 * 🔐 Purchase 型別定義（Create 成功回傳用）
 * ------------------------------------------------------- */
interface Purchase {
  id: number;
  purchaseNo: string;
  supplierId: number;
  purchaseDate?: string;
  items: PurchaseItem[];
  payments?: Array<{
    amount?: number;
    payDate?: string;
    method?: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  }>;
}

/* =======================================================
 * 📄 PurchaseCreate（進貨項目選擇器版）
 * ======================================================= */
export const PurchaseCreate: React.FC = () => {
  
  const theme = useTheme();
  //  套用 Scrollbar 樣式 (Component Mount 時執行)
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);
  
  const { suppliers, loading: suppliersLoading } = useActiveSuppliers();
  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  /* ===============================
   * 進貨項目狀態（核心）
   * =============================== */
  const [items, setItems] = useState<PurchaseItem[]>([]);

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
      <ItemsFormSync items={items} setItems={setItems} />
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        📦 新增進貨資訊
      </Typography>

      {/* ===================================================
       * 🔲 主版型（左右高度拉齊）
       * =================================================== */}
      <Box
        sx={{
          display: "grid",
          gap: 4,
          alignItems: "stretch", // ⭐ 核心：左右欄底部對齊
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(0, 1fr) 420px",
          },
        }}
      >
        {/* ================= 左側：進貨主資料 ================= */}
        <Box
          sx={{
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 供應商 + 進貨日期 (響應式：手機單欄、電腦雙欄) */}
          <FormFieldRow sx={{ mb: 3 }}>
            <SelectInput
              source="supplierId"
              label="供應商"
              choices={suppliers}
              optionText="name"
              optionValue="id"
              fullWidth
              isLoading={suppliersLoading}
              validate={[required()]}
            />
            <LhDateInput source="purchaseDate" label="進貨日期" fullWidth />
          </FormFieldRow>

          {/* 新增付款紀錄 */}
          <Box
            sx={(theme) => ({
              borderRadius: 2,
              bgcolor: theme.palette.background.paper,
              border: `2px solid ${theme.palette.divider}`,
              mt: -3,
              p: 1.5,
              flex: 0.92,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            })}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              ➕ 新增付款紀錄
            </Typography>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <PaymentArrayInput />
            </Box>
          </Box>
        </Box>

        {/* ================= 右側：進貨項目（表頭固定 + 摘要） ================= */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <PurchaseItemSelector
            value={items}
            onChange={setItems}
            disabled={false}
            visibleRows={2}
          />
          {/* 錯誤提示區域：固定高度，避免布局跳動 */}
          <Box
            sx={{
              height: 15, // 固定高度，對應 variant="caption" 的高度 + margin
              mt: 1,
              ml: 1,
            }}
          >
            {items.length === 0 && (
              <Typography variant="caption" color="error">
                請至少新增一項進貨項目
              </Typography>
            )}
          </Box>
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
    <ArrayInput
      source="payments"
      label=""
      sx={{
        "& .MuiFormHelperText-root": { display: "none" },
      }}
    >
      <SimpleFormIterator
        disableAdd={hasPayment}
        disableRemove
        getItemLabel={() => ""}
        sx={{
          "& .RaSimpleFormIterator-line": {
            padding: 0,
          },
          "& .RaSimpleFormIterator-form": {
            gap: 1,
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <NumberInput
          source="amount"
          label="金額"
          fullWidth
          min={0}
          step={1}
          validate={[minValue(0, "金額不能為負數")]}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            alignItems: "start",
            "& .MuiFormControl-root": {
              marginTop: 0,
            },
            "& .MuiInputLabel-root": {
              top: 0,
              transformOrigin: "top left",
            },
          }}
        >
          <LhDateInput source="payDate" label="付款日期" fullWidth />

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
        </Box>

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


/* -------------------------------------------------------
 * 同步 items 到表單字段的組件
 * 將 items 狀態同步到隱藏的表單字段，以便提交
 * ------------------------------------------------------- */
const ItemsFormSync: React.FC<{
  items: PurchaseItem[];
  setItems: (items: PurchaseItem[]) => void;
}> = ({ items }) => {
  const { setValue } = useFormContext();

  // 同步 items 到表單字段
  useEffect(() => {
    setValue("items", items, { shouldValidate: false, shouldDirty: false });
  }, [items, setValue]);

  // 隱藏的字段，用於表單驗證和提交
  return (
    <TextInput
      source="items"
      label=""
      sx={{ display: "none" }}
      validate={[
        (value) => {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            return "請至少新增一項進貨項目";
          }
          return undefined;
        },
      ]}
    />
  );
};
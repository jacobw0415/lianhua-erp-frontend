import React from "react";
import {
  NumberInput,
  TextInput,
  DateInput,
  ReferenceInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
} from "react-admin";
import { Box, Typography } from "@mui/material";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";

export const PurchaseCreate: React.FC = () => (
  <GenericCreatePage
    resource="purchases"
    title="新增進貨紀錄"
    successMessage="✅ 進貨資料已成功新增"
    errorMessage="❌ 新增失敗，請確認欄位或伺服器狀態"
    width="700px" // ✅ 可指定統一寬度
  >
    {/* ===== 表單標題 ===== */}
    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
      📦 新增進貨資訊
    </Typography>

    {/* ===== 基本欄位 ===== */}
    <ReferenceInput
      source="supplierId"
      reference="suppliers"
      label="供應商"
      perPage={50}
    >
      <SelectInput optionText="name" fullWidth />
    </ReferenceInput>

    <TextInput source="item" label="品項" fullWidth />

    {/* 數量與單價左右排列 */}
    <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
      <NumberInput source="qty" label="數量" sx={{ flex: 1 }} />
      <NumberInput source="unitPrice" label="單價" sx={{ flex: 1 }} />
    </Box>

    <DateInput source="purchaseDate" label="進貨日期" fullWidth />
    <TextInput source="note" label="備註" fullWidth multiline />

    {/* ===== 付款資訊 (嵌套子表單) ===== */}
    <ArrayInput source="payments" label="付款資訊">
      <SimpleFormIterator
        inline
        sx={{
          "& .RaSimpleFormIterator-line": {
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "nowrap",
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
  </GenericCreatePage>
);

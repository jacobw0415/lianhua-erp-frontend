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
import { Box, Typography, Divider } from "@mui/material";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";

export const PurchaseCreate: React.FC = () => (
  <GenericCreatePage
    resource="purchases"
    title="新增進貨紀錄"
    successMessage="✅ 進貨資料已成功新增"
    errorMessage="❌ 新增失敗，請確認欄位或伺服器狀態"
    width="1100px" // ✅ 調整頁面寬度，容納雙欄
  >
    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
      📦 新增進貨資訊
    </Typography>

    {/* 🧱 雙欄配置區塊 */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr", // 左右兩欄 1:1
        gap: 4,
        alignItems: "start",
      }}
    >
      {/* ===== 左半部：進貨基本資訊 ===== */}
      <Box>
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
        <Box sx={{ display: "flex", gap: 2 }}>
          <NumberInput source="qty" label="數量" sx={{ flex: 1 }} />
          <NumberInput source="unitPrice" label="單價" sx={{ flex: 1 }} />
        </Box>

        <DateInput source="purchaseDate" label="進貨日期" fullWidth />
        <TextInput source="note" label="備註" fullWidth multiline />
      </Box>

      {/* ===== 右半部：付款資訊 ===== */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          💰 付款資訊
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <ArrayInput source="payments" label="付款資訊">
          <SimpleFormIterator
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
      </Box>
    </Box>
  </GenericCreatePage>
);

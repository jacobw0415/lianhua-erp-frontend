import React from "react";
import {
  NumberInput,
  TextInput,
  DateInput,
  SelectInput,
  ArrayInput,
  SimpleFormIterator,
  required, 
} from "react-admin";
import { Box, Typography, Divider } from "@mui/material";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";

// ⭐ 引入 Hook：使用啟用中的供應商
import { useActiveSuppliers } from "@/hooks/useActiveSuppliers";

export const PurchaseCreate: React.FC = () => {
  const { suppliers, loading } = useActiveSuppliers();

  return (
    <GenericCreatePage
      resource="purchases"
      title="新增進貨紀錄"
      successMessage="✅ 進貨資料已成功新增"
      errorMessage="❌ 新增失敗，請確認欄位或伺服器狀態"
      width="1100px"
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        📦 新增進貨資訊
      </Typography>

      {/* 🧱 雙欄配置區塊 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 4,
          alignItems: "start",
        }}
      >
        {/* ===== 左半部：進貨基本資訊 ===== */}
        <Box>
          {/* ⭐ 改為 SelectInput + 啟用供應商列表 */}
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

          <TextInput source="item" label="品項" fullWidth />

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
            <SimpleFormIterator>
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
};

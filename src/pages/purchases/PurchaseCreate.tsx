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
        showAlert({
          title: "新增成功",
          message: `進貨單「${data.item}」已成功建立`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "purchases"), 600);
      }}
      onError={(error) => {
        showAlert({
          title: "新增失敗",
          message: error?.message ?? "請確認欄位或伺服器狀態",
          severity: "error",
          hideCancel: true,
        });
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        📦 新增進貨資訊
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 4 }}>
        {/* 左側欄位 */}
        <Box sx={{ maxWidth: 600, width: "100%" }}>
          
          {/* 第一列：供應商（加上 mb=2） */}
          <Box mb={2}>
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

           {/* 第二列：品項 + 備註（你選擇放兩欄 → 維持） */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <TextInput source="item" label="品項" fullWidth />
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

          {/* 第三列：數量 + 單價 */}
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1}>
              <NumberInput source="qty" label="數量" fullWidth />
            </Box>

            <Box flex={1}>
              <NumberInput source="unitPrice" label="單價" fullWidth />
            </Box>
          </Box>

          {/* 第四列：進貨日期（單欄） */}
          <Box mb={2}>
            <LhDateInput source="purchaseDate" label="進貨日期" fullWidth />
          </Box>

        </Box>

        {/* 右側付款區保持不變 */}
        <PaymentArrayInput />
      </Box>
    </GenericCreatePage>
  );
};

/* 🔧 付款區 */
const PaymentArrayInput: React.FC = () => {
  const payments = useWatch({ name: "payments" });
  const hasPayment = Array.isArray(payments) && payments.length > 0;

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        p: 1,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        ➕ 新增付款紀錄
      </Typography>

      <ArrayInput source="payments" label="">
        <SimpleFormIterator
          disableAdd={hasPayment}
          disableRemove={true}
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
    </Box>
  );
};

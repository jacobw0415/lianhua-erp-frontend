import React from "react";
import {
  NumberInput,
  DateInput,
  ArrayInput,
  SimpleFormIterator,
  SelectInput,
  useRecordContext,
} from "react-admin";
import {
  Box,
  Typography,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { GenericEditPage } from "@/components/common/GenericEditPage";

export const PurchaseEdit: React.FC = () => (
  <GenericEditPage
    resource="purchases"
    title="編輯進貨紀錄"
    successMessage="✅ 進貨資料已成功修改"
    errorMessage="❌ 修改失敗，請確認欄位或伺服器狀態"
    width="1100px" // ✅ 與 PurchaseCreate 一致
  >
    <PurchaseFormFields />
  </GenericEditPage>
);

const PurchaseFormFields: React.FC = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

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
              p: 2,
              mb: 3,
          
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              💰 歷史付款紀錄
            </Typography>

            {record.payments?.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>金額</TableCell>
                    <TableCell>付款日期</TableCell>
                    <TableCell>付款方式</TableCell>
                    <TableCell>備註</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {record.payments.map((p: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell>${p.amount?.toFixed(2)}</TableCell>
                      <TableCell>{p.payDate}</TableCell>
                      <TableCell>{p.method}</TableCell>
                      <TableCell>{p.note || ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">目前尚無付款紀錄</Typography>
            )}
          </Box>

          {/* 💡 目前付款狀況 */}
          <Box
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "10px",
              p: 2,
          
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
         
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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

          <ArrayInput source="newPayments" label="">
            <SimpleFormIterator
          
              sx={{
                "& .RaSimpleFormIterator-line": {
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 1,
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
        </Box>
      </Box>
    </Box>
  );
};

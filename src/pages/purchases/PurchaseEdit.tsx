import {
  Edit, TextInput, NumberInput, ArrayInput, SimpleFormIterator, SelectInput,
  DateInput, Datagrid, TextField, NumberField, DateField, FunctionField, useRecordContext
} from 'react-admin';
import { GenericEditForm } from '@/components/GenericEditForm';
import { Box, Paper, Typography, Divider, Alert } from '@mui/material';

type PaymentInput = { amount?: number; payDate?: string; method?: string };

export const PurchaseEdit = () => (
  <Edit
    mutationMode="pessimistic"
    transform={(data: { newPayments?: PaymentInput[] }) => ({
      payments: data.newPayments?.filter(p => p.amount && p.payDate && p.method),
    })}
    title="編輯進貨單"
  >
    <GenericEditForm resource="purchases">
      <PurchaseFormFields />
    </GenericEditForm>
  </Edit>
);

const PurchaseFormFields = () => {
  const record = useRecordContext();
  if (!record) return <Typography>載入中...</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">📦 進貨資訊</Typography>
        <Divider sx={{ my: 2 }} />
        <TextInput source="supplierName" label="供應商" fullWidth disabled />
        <TextInput source="item" label="品項" fullWidth disabled />
        <NumberInput source="qty" label="數量" disabled fullWidth />
        <NumberInput source="unitPrice" label="單價" disabled fullWidth />
        <NumberInput source="totalAmount" label="總金額" disabled fullWidth />
        <NumberInput source="paidAmount" label="已付款" disabled fullWidth />
        <NumberInput source="balance" label="餘額" disabled fullWidth />
        <TextInput source="status" label="狀態" disabled fullWidth />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">💡 目前付款狀況</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography>💰 總金額：<b>${record.totalAmount?.toFixed(2)}</b></Typography>
        <Typography>✅ 已付款：<b>${record.paidAmount?.toFixed(2)}</b></Typography>
        <Typography>💸 剩餘額：<b>${record.balance?.toFixed(2)}</b></Typography>
        <Alert
          severity={record.status === 'PAID' ? 'success' :
            record.status === 'PARTIAL' ? 'warning' : 'info'}
          sx={{ mt: 1 }}
        >
          狀態：{record.status}
        </Alert>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">💰 歷史付款紀錄</Typography>
        <Divider sx={{ my: 2 }} />
        {record.payments?.length ? (
          <Datagrid data={record.payments} bulkActionButtons={false} sx={{
            
            // ✅ 金額欄靠左對齊
            '& .column-amount': {
              textAlign: 'left',
              paddingLeft: 2, // 去除多餘內距
            },
            '& .column-amount span': {
              display: 'inline-block',
              textAlign: 'left',
            },
          }}>
            <NumberField source="amount" label="金額" />
            <DateField source="payDate" label="付款日期" />
            <TextField source="method" label="付款方式" />
            <FunctionField label="備註" render={(rec) => rec.note || ''} />
          </Datagrid>
        ) : (
          <Typography color="text.secondary">目前尚無付款紀錄</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">➕ 新增付款紀錄</Typography>
        <Divider sx={{ my: 2 }} />
        <ArrayInput source="newPayments" label="">
          <SimpleFormIterator inline>
            <NumberInput source="amount" label="金額" />
            <DateInput source="payDate" label="付款日期" />
            <SelectInput
              source="method"
              label="付款方式"
              choices={[
                { id: 'CASH', name: '現金' },
                { id: 'TRANSFER', name: '轉帳' },
                { id: 'CARD', name: '刷卡' },
                { id: 'CHECK', name: '支票' },
              ]}
            />
          </SimpleFormIterator>
        </ArrayInput>
      </Paper>
    </Box>
  );
};

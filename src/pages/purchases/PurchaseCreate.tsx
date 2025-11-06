// src/pages/purchases/PurchaseCreate.tsx
import {
  Create, SimpleForm, TextInput, NumberInput, DateInput, SelectInput
} from "react-admin";

export const PurchaseCreate = () => (
  <Create title="新增進貨紀錄">
    <SimpleForm>
      <TextInput source="supplierName" label="供應商" />
      <TextInput source="item" label="品項" />
      <NumberInput source="qty" label="數量" />
      <NumberInput source="unitPrice" label="單價" />
      <DateInput source="purchaseDate" label="進貨日期" />
      <SelectInput source="status" label="狀態" choices={[
        { id: 'PENDING', name: '未付款' },
        { id: 'PARTIAL', name: '部分付款' },
        { id: 'PAID', name: '已付款' },
      ]}/>
      <TextInput source="note" label="備註" fullWidth multiline />
    </SimpleForm>
  </Create>
);

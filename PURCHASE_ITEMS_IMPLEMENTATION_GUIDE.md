# PurchaseCreate 多筆進貨項目實作說明

## 📋 現況分析

### 當前架構
- **左側欄位**：單筆進貨項目（item, qty, unitPrice, unit, note）
- **右側欄位**：付款區（已使用 `ArrayInput` 支援多筆付款）
- **布局**：使用 `gridTemplateColumns: "1fr 400px"` 的雙欄布局

### 後端資料結構
根據 `PurchaseDetailDrawer.tsx` 和 `PurchaseList.tsx`，後端支援：
```typescript
interface PurchaseItemRow {
  id: number;
  purchaseId: number;
  item: string;
  unit: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  subtotal: number;
  note?: string;
}
```

## 🎯 實作方案

### 方案概述
將左側的單筆進貨項目改為使用 `ArrayInput` + `SimpleFormIterator`，**完全參考右側付款區的實作模式**，保持 UI 架構一致性。

### 核心原則
1. **保持現有布局**：維持左右雙欄結構（`gridTemplateColumns: "1fr 400px"`）
2. **參考付款區模式**：使用相同的 `ArrayInput` + `SimpleFormIterator` 模式
3. **最小化變更**：只將單筆欄位改為陣列輸入，其他邏輯不變

## 🔧 實作步驟

### 步驟 1：修改型別定義

```typescript
interface Purchase {
  id: number;
  purchaseNo: string;
  supplierId: number;
  purchaseDate?: string;
  items?: Array<{           // ⭐ 改為陣列
    item: string;
    qty: number;
    unitPrice: number;
    unit: string;
    note?: string;
  }>;
  payments?: Array<{
    amount?: number;
    payDate?: string;
    method?: "CASH" | "TRANSFER" | "CARD" | "CHECK";
  }>;
}
```

### 步驟 2：重構左側欄位為 ArrayInput

將原本的單筆欄位：
```tsx
<Box sx={{ maxWidth: 600, width: "100%" }}>
  {/* 第一列：品項 + 備註 */}
  <Box display="flex" gap={2} mb={2}>
    <TextInput source="item" ... />
    <TextInput source="note" ... />
  </Box>
  {/* ... 其他欄位 */}
</Box>
```

改為：
```tsx
<Box sx={{ maxWidth: 600, width: "100%" }}>
  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
    📦 進貨項目
  </Typography>
  
  <PurchaseItemsArrayInput />
</Box>
```

### 步驟 3：建立 PurchaseItemsArrayInput 組件

**完全參考 `PaymentArrayInput` 的實作模式**：

```tsx
const PurchaseItemsArrayInput: React.FC = () => {
  const items = useWatch({ name: "items" });
  const hasItems = Array.isArray(items) && items.length > 0;

  return (
    <ArrayInput source="items" label="">
      <SimpleFormIterator
        disableAdd={false}  // ⭐ 允許新增多筆
        disableRemove={false}  // ⭐ 允許刪除
        getItemLabel={(index) => `項目 ${index + 1}`}
      >
        {/* 第一列：品項 + 備註 */}
        <Box display="flex" gap={2} mb={2} sx={{ width: "100%" }}>
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

        {/* 第二列：數量 + 單價 */}
        <Box display="flex" gap={2} mb={2} sx={{ width: "100%" }}>
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

        {/* 第三列：單位 */}
        <Box display="flex" gap={2} mb={2} sx={{ width: "100%" }}>
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
      </SimpleFormIterator>
    </ArrayInput>
  );
};
```

### 步驟 4：調整共用欄位位置

**供應商和進貨日期**應該移到 ArrayInput 外面，因為它們是整張進貨單的共用欄位：

```tsx
<Box sx={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 4 }}>
  {/* 左側欄位 */}
  <Box sx={{ maxWidth: 600, width: "100%" }}>
    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
      📦 新增進貨資訊
    </Typography>

    {/* ⭐ 共用欄位：供應商 + 進貨日期 */}
    <Box display="flex" gap={2} mb={3}>
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
        <LhDateInput
          source="purchaseDate"
          label="進貨日期"
          fullWidth
        />
      </Box>
    </Box>

    {/* ⭐ 進貨項目陣列 */}
    <PurchaseItemsArrayInput />
  </Box>

  {/* 右側付款區（保持不變） */}
  <Box sx={{ ... }}>
    <PaymentArrayInput />
  </Box>
</Box>
```

## 📐 UI 架構保持

### 布局結構（不變）
```
┌─────────────────────────────────────────┬──────────────┐
│  左側：進貨資訊區                        │  右側：付款區 │
│  ┌───────────────────────────────────┐  │              │
│  │ 共用欄位：供應商 + 進貨日期        │  │  ┌────────┐ │
│  └───────────────────────────────────┘  │  │ 付款 1  │ │
│  ┌───────────────────────────────────┐  │  └────────┘ │
│  │ ArrayInput: 進貨項目               │  │              │
│  │ ┌───────────────────────────────┐ │  │              │
│  │ │ 項目 1: 品項、數量、單價...    │ │  │              │
│  │ └───────────────────────────────┘ │  │              │
│  │ [+ 新增項目]                      │  │              │
│  └───────────────────────────────────┘  │              │
└─────────────────────────────────────────┴──────────────┘
```

### 關鍵設計決策

1. **共用欄位外置**：`supplierId` 和 `purchaseDate` 放在 ArrayInput 外面，因為它們屬於整張進貨單
2. **項目欄位內置**：`item`, `qty`, `unitPrice`, `unit`, `note` 放在 ArrayInput 內，因為它們屬於個別進貨項目
3. **保持右側不變**：付款區完全維持現狀，確保一致性

## ✅ 優點

1. **最小化變更**：只重構左側欄位，右側付款區完全不動
2. **UI 一致性**：左右兩側都使用相同的 `ArrayInput` 模式
3. **向後相容**：如果後端支援，可以預設建立一筆空項目，保持單筆使用體驗
4. **擴展性**：未來可以輕鬆加入項目級別的驗證或計算邏輯

## 🔍 注意事項

1. **後端 API 對應**：確認後端 API 期望的資料格式是 `items: [...]` 還是其他欄位名稱
2. **預設值**：考慮是否需要在初始化時自動建立一筆空項目
3. **驗證邏輯**：確保至少需要一筆進貨項目的驗證
4. **表單提交**：確認資料格式符合後端預期

## 📝 實作範例對照

### Before（單筆）
```tsx
<TextInput source="item" label="品項" />
<NumberInput source="qty" label="數量" />
<NumberInput source="unitPrice" label="單價" />
```

### After（多筆）
```tsx
<ArrayInput source="items">
  <SimpleFormIterator>
    <TextInput source="item" label="品項" />
    <NumberInput source="qty" label="數量" />
    <NumberInput source="unitPrice" label="單價" />
  </SimpleFormIterator>
</ArrayInput>
```

## 🎨 樣式建議

為了保持視覺一致性，建議在 `PurchaseItemsArrayInput` 外層加上與付款區相同的樣式：

```tsx
<Box
  sx={(theme) => ({
    borderRadius: 2,
    bgcolor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.divider}`,
    p: 3,
  })}
>
  <PurchaseItemsArrayInput />
</Box>
```

這樣左右兩側的視覺風格會完全一致。


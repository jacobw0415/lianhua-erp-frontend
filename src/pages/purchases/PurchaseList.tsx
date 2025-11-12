import {
  List,
  TextField,
  NumberField,
  DateField,
  EditButton,
  DeleteButton,
  TopToolbar,
  CreateButton,
  useRecordContext,
  Pagination,
} from "react-admin";
import { StyledDatagrid } from "@/components/StyledDatagrid";
import { Box, Typography } from "@mui/material";

/**
 * 💰 子表：顯示付款紀錄（滾動獨立，不影響主表）
 */
const PaymentSubList = () => {
  const record = useRecordContext();
  if (!record?.payments?.length) return null;

  const payments = record.payments || [];
  const enableScroll = payments.length > 2;
  const maxHeight = enableScroll ? "150px" : "auto";

  return (
    <Box
      sx={{
        ml: 6,
        mb: 2,
        p: 1,
        border: "1px solid #eee",
        borderRadius: 2,
        backgroundColor: "background.default",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: "text.secondary",
          mb: 1,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        💰 付款紀錄
      </Typography>

      {/* ✅ 子表內獨立滾動 */}
      <StyledDatagrid
        data={payments}
        rowClick={false}
        bulkActionButtons={false}
        maxHeight={maxHeight}
        sx={{
          "& .MuiTable-root": { tableLayout: "auto", width: "100%" },
          "& .MuiTableCell-root": { py: 1, px: 2, whiteSpace: "nowrap" },
          "& .column-amount": { textAlign: "left", minWidth: "160px" },
          "& .column-payDate": { minWidth: "100px" },
          "& .column-method": { minWidth: "120px" },
          "& .column-note": { minWidth: "160px" },
        }}
      >
        <NumberField
          source="amount"
          label="金額"
          options={{
            style: "currency",
            currency: "TWD",
            minimumFractionDigits: 0,
          }}
        />
        <DateField source="payDate" label="付款日期" />
        <TextField source="method" label="付款方式" />
        <TextField source="note" label="備註" />
      </StyledDatagrid>
    </Box>
  );
};

/**
 * 📦 List 頁面上方工具列
 */
const ListActions = () => (
  <TopToolbar>
    <CreateButton label="新增進貨" />
  </TopToolbar>
);

/**
 * 📋 主表：進貨紀錄清單（具分頁、獨立滾動框）
 */
export const PurchaseList = () => (
  <List
    title="進貨紀錄"
    actions={<ListActions />}
    pagination={<Pagination rowsPerPageOptions={[5, 10, 25, 50]} />}
    perPage={10}
  >
    <Box
      sx={{
        width: "100%",
        height: "650px",           // ✅ 主表固定高度
        overflowY: "auto",          // ✅ 主表在框內滾動
        border: "1px solid #ddd",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <StyledDatagrid
        expand={<PaymentSubList />} // ✅ 子表展開
        maxHeight="650px"
        sx={{
          "& .RaDatagrid-cell:first-of-type, & .RaDatagrid-headerCell:first-of-type": {
            width: "64px !important",
            minWidth: "64px !important",
            overflow: "visible !important",
            textAlign: "left",
          },
        }}
      >
        <TextField source="supplierName" label="供應商" />
        <TextField source="item" label="品項" />
        <NumberField source="qty" label="數量" />
        <NumberField
          source="unitPrice"
          label="單價"
          options={{ style: "currency", currency: "TWD" }}
        />
        <NumberField
          source="totalAmount"
          label="總金額"
          options={{ style: "currency", currency: "TWD" }}
        />
        <NumberField
          source="paidAmount"
          label="已付款"
          options={{ style: "currency", currency: "TWD" }}
        />
        <NumberField
          source="balance"
          label="餘額"
          options={{ style: "currency", currency: "TWD" }}
        />
        <TextField source="status" label="狀態" />
        <DateField source="purchaseDate" label="進貨日期" />
        <TextField source="note" label="備註" />
        <EditButton label="編輯" />
        <DeleteButton label="刪除" />
      </StyledDatagrid>
    </Box>
  </List>
);

import {
  List,
  TextField,
  EditButton,
  DeleteButton,
  TopToolbar,
  CreateButton,
  Pagination,
} from "react-admin";
import { Box } from "@mui/material";
import { StyledDatagrid } from "@/components/StyledDatagrid";

// ✅ 自訂工具列：右上角新增按鈕
const ListActions = () => (
  <TopToolbar>
    <CreateButton label="新增供應商" />
  </TopToolbar>
);

// ✅ 主表格：供應商清單（平均分配欄位）
export const SupplierList = () => (
  <List
    title="供應商清單"
    actions={<ListActions />}
    pagination={<Pagination rowsPerPageOptions={[10, 25, 50]} />}
    perPage={10}
  >
    <Box
      sx={{
        width: "100%",
        height: "600px",             // ✅ 固定高度
        overflowY: "auto",            // ✅ 框內滾動
        border: "1px solid #ddd",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <StyledDatagrid
        rowClick="edit"
        maxHeight="600px"
        sx={{
          "& .MuiTable-root": {
            tableLayout: "fixed",     // ✅ 固定欄寬演算
            width: "100%",
          },
          // ✅ 平均分配各欄寬比例
          "& .RaDatagrid-cell, & .RaDatagrid-headerCell": {
            width: "12.5%", // 8 欄位平均分配
          },
          "& .column-name": { width: "20%" },
          "& .column-note": { width: "25%" },
        }}
      >
        <TextField source="name" label="供應商名稱" />
        <TextField source="contact" label="聯絡人" />
        <TextField source="phone" label="電話" />
        <TextField source="billingCycle" label="結帳週期" />
        <TextField source="note" label="備註" />
        <EditButton label="編輯" />
        <DeleteButton label="刪除" />
      </StyledDatagrid>
    </Box>
  </List>
);

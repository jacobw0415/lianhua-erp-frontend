import { Datagrid, type DatagridProps } from "react-admin";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { EmptyPlaceholder } from "@/components/common/EmptyPlaceholder";

interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

/**
 * ⭐ 最終版不爆框 StyledDatagrid（統一高度 + 完整等比）
 * - row 高度一致（所有頁表完全統一）
 * - Chip、Switch、Icon、按鈕 全部垂直置中
 * - 固定欄位寬與操作欄不爆框
 * - 10 行剛好填滿
 */
const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight",
})<StyledDatagridProps>(({ theme }) => ({
  borderRadius: 12,
  overflowX: "hidden",
  overflowY: "hidden",
  position: "relative",
  maxWidth: "100%",

  /** ▌表格基礎設定 */
  "& .RaDatagrid-table": {
    tableLayout: "fixed",
    width: "100%",
    maxWidth: "100%",
    borderCollapse: "collapse",
  },

  /** ▌Sticky 表頭 */
  "& thead": {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 2px 3px rgba(0,0,0,0.05)",
  },

  /** ▌Header Cell */
  "& .MuiTableCell-head": {
    padding: "4px 8px",
    height: 32,
    lineHeight: "32px",
    fontSize: "0.8rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  /** ▌統一 Row 高度（關鍵） */
  "& .RaDatagrid-row": {
    height: "18px",
    maxHeight: "25px",
  },

  /** ▌Body Cell */
  "& .MuiTableCell-body": {
    padding: "0 8px !important",
    height: "48px",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "middle",
  },

  /** ▌統一內容置中 Wrapper（Chip / Switch / Button / Icon） */
  "& .cell-centered": {
    display: "flex",
    alignItems: "center",
    justifyContent: "left",
    height: "100%",
    width: "100%",
    padding: 0,
  },

  /** ▌每個欄位平均寬，但保留操作欄例外 */
  "& .RaDatagrid-row > td:not(.column-action)": {
    width: "auto",
    maxWidth: "1px",
    verticalAlign: "middle",
  },

  /** ▌操作欄固定寬度（避免爆框） */
  "& .column-action": {
    width: "150px",
    maxWidth: "150px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flexShrink: 0,
  },

  /** ▌客製化 scrollbar */
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#666",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#888",
  },
  "& .RaNumberField-root, & .MuiTableCell-root.MuiTableCell-alignRight": {
  textAlign: "left",
  },

    /** ▌供應商名稱寬度 (source="supplierName") */
  "& td.column-supplierName, & th.column-supplierName": {
    width: "120px",
  },

  /** ▌備註欄寬度 (source="note") */
  "& td.column-note, & th.column-note": {
    width: "120px",
  },

  /** ▌移除 IconButton focus */
  "& .MuiButtonBase-root:focus, & .MuiButtonBase-root:focus-visible": {
    outline: "none !important",
    boxShadow: "none !important",
  },

 /** 🔥 完全移除 Pagination 的藍色 focus 圈 */
  "& .MuiPaginationItem-root.Mui-focusVisible": {
    outline: "none !important",
    boxShadow: "none !important",
    border: "none !important",
  },

}));

/**
 * ⭐ 外層框（固定 10 行高度）
 */
export const StyledListDatagrid = (props: StyledDatagridProps) => {
  const { rowClick = false, maxHeight = "520px", ...rest } = props;

  return (
    <Box
      sx={{
        width: "100%",
        flex: 1,
        height: "520px",
        overflow: "hidden",
        border: "1px solid #ddd",
        borderRadius: 2,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StyledDatagridRoot
        empty={<EmptyPlaceholder />}
        bulkActionButtons={false}
        size="small"
        maxHeight={maxHeight}
        rowClick={rowClick}
        {...rest}
      />
    </Box>
  );
};

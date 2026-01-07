import { Datagrid, type DatagridProps, useListContext } from "react-admin";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { EmptyPlaceholder } from "@/components/common/EmptyPlaceholder";
import { LoadingPlaceholder } from "@/components/common/LoadingPlaceholder";

interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

/**
 * - 最終版不爆框 StyledDatagrid（統一高度 + 完整等比）
 * - row 高度一致（所有頁表完全統一）
 * - Chip、Switch、Icon、按鈕 全部垂直置中
 * - 固定欄位寬與操作欄不爆框
 * - 10 行剛好填滿
 */
const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight",
})<StyledDatagridProps>(({ theme }) => ({
  /* 讓 Datagrid 撐滿外層 Box */
  flex: 1,
  height: "100%",

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
    height: "42px",
    maxHeight: "42px",
  },

  /** ▌Body Cell */
  "& .MuiTableCell-body": {
    padding: "0 8px !important",
    height: "42px",
    lineHeight: "42px",
    maxHeight: "42px",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "middle",
  },

  /** ▌統一內容置中 Wrapper（Chip / Switch / Button / Icon） */
  "& .cell-centered": {
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

  /** ▌Scrollbar */
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

  /** ▌供應商名稱 / 進貨單號 */
  "& td.column-supplierName, & th.column-supplierName, & th.column-purchaseNo": {
    width: "120px",
  },
  "& th.column-purchaseNo": {
    width: "150px",
  },

  /** ▌備註欄 */
  "& td.column-note, & th.column-note": {
    width: "140px",
  },

  /** ▌移除 IconButton focus */
  "& .MuiButtonBase-root:focus, & .MuiButtonBase-root:focus-visible": {
    outline: "none !important",
    boxShadow: "none !important",
  },

   /** ▌客戶地址 */
  "& th.column-address": {
    width: "250px",
  },
  "th.column-orderNo": {
    width: "150px",
  },
}));

/**
 * ⭐ 外層框（固定 10 行高度）
 * 在載入時顯示「載入中...」效果，取代空畫面狀態
 */
export const StyledListDatagrid = (props: StyledDatagridProps) => {
  const { rowClick = false, maxHeight = "470px", ...rest } = props;
  const { isLoading, data } = useListContext();

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        flex: 1,
        height: maxHeight,
        overflow: "hidden",
        border: `1px solid ${theme.palette.action.disabled}`,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      })}
    >
      {/* 載入中狀態：顯示動態載入效果 */}
      {isLoading && (!data || data.length === 0) ? (
        <LoadingPlaceholder />
      ) : (
        <StyledDatagridRoot
          empty={<EmptyPlaceholder />}
          bulkActionButtons={false}
          size="small"
          rowClick={rowClick}
          {...rest}
        />
      )}
    </Box>
  );
};

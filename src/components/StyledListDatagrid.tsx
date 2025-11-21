import { Datagrid, type DatagridProps } from "react-admin";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { EmptyPlaceholder } from "@/components/common/EmptyPlaceholder";

interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

/**
 * ⭐ 最終版不爆框 StyledDatagrid
 * - 完整欄位等比
 * - row 高度不壓 UI
 * - 切換、Chip、按鈕全部垂直置中
 * - 不會超出匡框
 */
const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight",
})<StyledDatagridProps>(({ theme }) => ({
  borderRadius: 12,
  overflowX: "hidden", // ⭐ 防止超出右側
  overflowY: "hidden",
  position: "relative",
  maxWidth: "100%", // ⭐ 表格不可比外層更寬

  /** ▌表格基礎設定 */
  "& .RaDatagrid-table": {
    tableLayout: "fixed", // ⭐ 固定欄寬，等比例
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
    height: 30,
    lineHeight: "30px",
    fontSize: "0.8rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  /** ▌Body Cell */
  "& .MuiTableCell-body": {
    padding: "4px 8px",
    height: 30,
    lineHeight: "30px",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "middle", // ⭐ 全部置中
  },

  /** ▌讓每個欄位平均寬（關鍵） */
  "& .RaDatagrid-row > td": {
    width: "1%", // ⭐ 自動平分
    verticalAlign: "middle",
  },

  /** ▌最後一欄避免爆框（操作欄） */
  "& .RaDatagrid-cell:last-of-type, & .RaDatagrid-headerCell:last-of-type": {
    minWidth: "130px", // ⭐ 從你原本 160 改到 130 → 不爆框
    maxWidth: "140px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  /** ▌操作欄固定寬度 */
  "& .column-action": {
    width: "170px",
    textAlign: "left",
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
}));

/**
 * ⭐ 外層容器（10 筆剛好填滿）
 */
export const StyledListDatagrid = (props: StyledDatagridProps) => {
  const { rowClick = false, maxHeight = "510px", ...rest } = props;

  return (
    <Box
      sx={{
        width: "100%",
        height: "510px", // ⭐ 可放 10 行 + header 剛好
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

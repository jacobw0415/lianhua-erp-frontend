// 📄 src/components/StyledDatagrid.tsx
import { Datagrid, type DatagridProps } from "react-admin";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

// ✅ 擴充 props 支援 maxHeight
interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

/**
 * ✅ StyledDatagridRoot
 * - 提供固定框高與內部滾動
 * - 支援 sticky header
 * - 美觀滾輪樣式
 */
const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight",
})<StyledDatagridProps>(({ theme, maxHeight }) => ({
  borderRadius: 12,
  overflow: "hidden",
  position: "relative",

  // ✅ 限制高度 + 允許滾動
  ...(maxHeight && {
    maxHeight,
    overflowY: "auto",
  }),

  "& .RaDatagrid-table": {
    tableLayout: "fixed",
    width: "100%",
    borderCollapse: "collapse",
  },

  // ✅ 固定表頭 (sticky header)
  "& thead": {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
    boxShadow: "0 2px 3px rgba(0,0,0,0.05)",
  },

  "& .RaDatagrid-headerCell": {
    fontWeight: 600,
    fontSize: "0.95rem",
    textAlign: "left",
    whiteSpace: "nowrap",
    padding: "10px 16px",
    borderBottom: `1px solid ${
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[300]
    }`,
  },

  "& .RaDatagrid-cell": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    padding: "8px 16px",
    fontSize: "0.9rem",
    borderBottom: `1px solid ${
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[200]
    }`,
    color: theme.palette.text.primary,
    verticalAlign: "middle",
  },

  // ✅ 備註欄寬放大允許換行
  "& .RaDatagrid-cell:last-of-type, & .RaDatagrid-headerCell:last-of-type": {
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
    lineHeight: 1.4,
    wordBreak: "break-word",
    minWidth: "160px",
  },

  // ✅ 數字欄靠右（調整邏輯方向）
  "& .RaNumberField-root, & .MuiTableCell-root.MuiTableCell-alignRight": {
    textAlign: "left",
  },

  // ✅ 美觀滾輪樣式
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#bbb",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#999",
  },
}));

/**
 * ✅ StyledDatagrid Component
 * - 通用表格組件，支援 maxHeight 屬性
 * - 預設 rowClick="edit"、隱藏批次按鈕
 */
export const StyledDatagrid = (props: StyledDatagridProps) => {
  const { maxHeight = "550px", ...rest } = props; // 預設高度
  return (
    <Box
      sx={{
        width: "100%",
        border: "1px solid #ddd",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      <StyledDatagridRoot
        rowClick="edit"
        bulkActionButtons={false}
        size="small"
        maxHeight={maxHeight}
        {...rest}
      />
    </Box>
  );
};

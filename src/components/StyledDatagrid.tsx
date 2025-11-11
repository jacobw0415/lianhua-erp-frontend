import { Datagrid, type DatagridProps } from "react-admin";
import { styled } from "@mui/material/styles";

// ✅ 擴充 props 支援 maxHeight
interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight",
})<StyledDatagridProps>(({ theme, maxHeight }) => ({
  margin: "17px 17px",
  borderRadius: 12,
  overflow: "hidden", // ✅ 防止滾動時外框露出
  position: "relative",

  // ✅ 限制高度 + 啟用滾動
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

  // 備註欄位放寬
  "& .RaDatagrid-cell:last-of-type, & .RaDatagrid-headerCell:last-of-type": {
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
    lineHeight: 1.4,
    wordBreak: "break-word",
    minWidth: "160px",
  },

  // 數字靠左
  "& .RaNumberField-root, & .MuiTableCell-root.MuiTableCell-alignRight": {
    textAlign: "left",
  },

  // ✅ 美觀滾輪樣式
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#bbb",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#999",
  },
}));

// ✅ Component
export const StyledDatagrid = (props: StyledDatagridProps) => (
  <StyledDatagridRoot
    rowClick="edit"
    bulkActionButtons={false}
    size="small"
    {...props}
  />
);

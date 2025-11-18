import { Datagrid, type DatagridProps } from "react-admin";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { EmptyPlaceholder } from "@/components/common/EmptyPlaceholder";

interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

/**
 * ✅ StyledDatagridRoot
 * - 統一表格樣式（固定高 + sticky header + 滾動）
 * - 提供一致欄寬與滾輪體驗
 */
const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight",
})<StyledDatagridProps>(({ theme, maxHeight }) => ({
  borderRadius: 12,
  overflow: "hidden",
  position: "relative",

  ...(maxHeight && {
    maxHeight,
    overflowY: "auto",
  }),

  "& .RaDatagrid-table": {
    tableLayout: "fixed", // ✅ 固定欄寬
    width: "100%",
    borderCollapse: "collapse",
  },

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

    whiteSpace: "nowrap",
    padding: "10px 16px",
    borderBottom: `1px solid ${theme.palette.mode === "dark"
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
    borderBottom: `1px solid ${theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[200]
      }`,
    color: theme.palette.text.primary,
    verticalAlign: "middle",
  },

  // ✅ 備註欄（最後一欄）允許換行
  "& .RaDatagrid-cell:last-of-type, & .RaDatagrid-headerCell:last-of-type": {
    whiteSpace: "normal",
    overflow: "visible",
    textOverflow: "unset",
    lineHeight: 1.4,
    wordBreak: "break-word",
    minWidth: "160px",
  },

  // ✅ 修正：數字欄靠右對齊
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
  // ✅ 固定操作編輯刪除欄寬度，防止擠壓
  "& .column-action": {
    width: "170px",
    textAlign: "left",
    flexShrink: 0,
  },
}));

/**
 * ✅ StyledDatagrid Component
 * - 通用表格組件（maxHeight 可調）
 * - 預設 rowClick="edit"，隱藏批次操作按鈕
 */
export const StyledListDatagrid = (props: StyledDatagridProps) => {
  const { maxHeight = "550px", ...rest } = props;
  return (
    <Box
      sx={{
        width: "100%",
        height: "600px",
        overflowY: "fixed",
        border: "1px solid #ddd",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <StyledDatagridRoot
      empty={<EmptyPlaceholder />}
        rowClick="edit"
        bulkActionButtons={false}
        size="small"
        maxHeight={maxHeight}
        {...rest}
      />
    </Box>
  );
};

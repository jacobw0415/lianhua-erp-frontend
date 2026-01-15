import { Datagrid, type DatagridProps, useListContext } from "react-admin";
import { styled } from "@mui/material/styles";
import { Box, useMediaQuery, type Theme } from "@mui/material"; 
import { EmptyPlaceholder } from "@/components/common/EmptyPlaceholder";
import { LoadingPlaceholder } from "@/components/common/LoadingPlaceholder";

interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight",
})<StyledDatagridProps>(({ theme }) => ({
  flex: 1,
  height: "100%",
  borderRadius: 12,
  position: "relative",
  maxWidth: "100%",

  /** ▌響應式橫向捲軸處理 */
  overflowX: "auto", // 手機版必須開啟 auto 以支援滑動
  overflowY: "auto",

  "& .RaDatagrid-table": {
    // 桌機用 fixed (等比)，手機用 auto (內容撐開)
    tableLayout: theme.breakpoints.down('md') ? "auto" : "fixed", 
    width: "100%",
    minWidth: theme.breakpoints.down('md') ? "600px" : "100%", // 手機版強制最小寬度避免擠壓
    borderCollapse: "collapse",
  },

  /** ▌Sticky 表頭 */
  "& thead": {
    position: "sticky",
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
  },

  "& .MuiTableCell-head": {
    padding: "4px 8px",
    height: 32,
    fontSize: "0.8rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    // 響應式字體
    [theme.breakpoints.down('sm')]: {
      fontSize: "0.75rem",
      padding: "4px 4px",
    },
  },

  "& .RaDatagrid-row": {
    height: "45px",
    // 手機版解除硬性高度限制，避免內容折行爆開
    [theme.breakpoints.down('sm')]: {
      height: "auto",
      maxHeight: "none",
    },
  },

  "& .MuiTableCell-body": {
    padding: "0 8px !important",
    height: "42px",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "middle",
    [theme.breakpoints.down('sm')]: {
      padding: "8px 4px !important", // 手機版上下稍微放寬
    },
  },

  /** ▌操作欄響應式 */
  "& .column-action": {
    width: "150px",
    maxWidth: "150px",
    [theme.breakpoints.down('sm')]: {
      width: "100px", // 手機版縮窄操作區
      position: "sticky", // 選配：讓操作欄固定在右側
      right: 0,
      backgroundColor: theme.palette.background.paper,
      zIndex: 1,
      boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
    },
  },

  /** ▌欄位顯示隱藏控制 (響應式核心) */
  // 例如：在手機版隱藏「備註」或「地址」以節省空間
  [theme.breakpoints.down('md')]: {
    "& .column-note, & .column-address": {
      display: "none", 
    },
  },

  /** ▌Scrollbar 樣式更新 */
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.mode === 'dark' ? "#555" : "#ccc",
    borderRadius: "4px",
  },

  /** ▌特定欄位寬度調整 */
  "& td.column-supplierName, & th.column-supplierName": {
    width: theme.breakpoints.down('sm') ? "100px" : "120px",
  },
}));

export const StyledListDatagrid = (props: StyledDatagridProps) => {
  const { rowClick = false, maxHeight = "400px", ...rest } = props;
  const { isLoading, data } = useListContext();
  
  // 偵測是否為手機，動態調整 maxHeight
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        flex: 1,
        // 手機版高度稍微縮小，或改為內容自適應
        height: isMobile ? "400px" : maxHeight, 
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      })}
    >
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
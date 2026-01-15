import { Datagrid, type DatagridProps, useListContext } from "react-admin";
import { styled } from "@mui/material/styles";
import { Box, useMediaQuery, type Theme } from "@mui/material"; 
import { EmptyPlaceholder } from "@/components/common/EmptyPlaceholder";
import { LoadingPlaceholder } from "@/components/common/LoadingPlaceholder";

interface StyledDatagridProps extends DatagridProps {
  maxHeight?: string;
}

const StyledDatagridRoot = styled(Datagrid, {
  shouldForwardProp: (prop) => prop !== "maxHeight" && prop !== "rowClassName",
})<StyledDatagridProps>(({ theme }) => ({
  // 核心修改：確保 Datagrid 內部容器能撐開
  display: "flex",
  flexDirection: "column",
  flex: 1, 
  height: "100%",
  borderRadius: 12,
  position: "relative",
  maxWidth: "100%",

  /** ▌內部元素佈局優化 */
  "& .RaDatagrid-list": {
    flex: 1, // 讓列表主體撐開
    display: "flex",
    flexDirection: "column",
  },

  "& .RaDatagrid-table": {
    // 桌機用 fixed，手機用 auto
    tableLayout: theme.breakpoints.down('md') ? "auto" : "fixed", 
    width: "100%",
    minWidth: theme.breakpoints.down('md') ? "600px" : "100%",
    borderCollapse: "collapse",
    // 確保即使只有一筆資料，表格主體也會佔據空間
    minHeight: "auto", 
  },

  /** ▌未佔滿時的背景補全 */
  backgroundColor: theme.palette.background.paper,

  /** ▌響應式橫向捲軸處理 */
  overflowX: "auto",
  overflowY: "auto",

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
    [theme.breakpoints.down('sm')]: {
      fontSize: "0.75rem",
      padding: "4px 4px",
    },
  },

  "& .RaDatagrid-row": {
    height: "45px",
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
      padding: "8px 4px !important",
    },
  },

  /** ▌操作欄響應式 */
  "& .column-action": {
    width: "150px",
    maxWidth: "150px",
    [theme.breakpoints.down('sm')]: {
      width: "100px",
      position: "sticky",
      right: 0,
      backgroundColor: theme.palette.background.paper,
      zIndex: 1,
      boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
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
}));

export const StyledListDatagrid = (props: StyledDatagridProps) => {
  // 將預設高度提升，或使用 minHeight 確保視覺一致
  const { rowClick = false, maxHeight = "500px", ...rest } = props;
  const { isLoading, data } = useListContext();
  
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        // 核心修改：使用固定高度而非自適應，確保無論資料多寡，外框大小不變
        height: isMobile ? "400px" : maxHeight, 
        // 也可以考慮使用 minHeight: "500px" 確保下限
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        position: "relative",
        backgroundColor: theme.palette.background.paper,
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
import React, { useEffect } from "react";
import { Box, useMediaQuery, type Theme } from "@mui/material";
import {
  useListContext,
  ListContextProvider,
  type ListControllerResult,
  useRefresh,
} from "react-admin";

import { GenericFilterBar } from "./GenericFilterBar";
import { useListEnhancer } from "@/hooks/useListEnhancer";
import { useGlobalAlert } from "@/hooks/useGlobalAlert";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { exportExcel } from "@/utils/exportExcel";
import { exportCsv } from "@/utils/exportCsv";

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportConfig {
  filename: string;
  format?: "excel" | "csv";
  columns: ExportColumn[];
}

export const StyledListWrapper: React.FC<{
  children: React.ReactNode;
  quickFilters?: any[];
  advancedFilters?: any[];
  popoverWidth?: number | string;
  exportConfig?: ExportConfig;
  disableCreate?: boolean;
}> = ({
  children,
  quickFilters = [],
  advancedFilters = [],
  exportConfig,
  disableCreate = false,
}) => {
  const { datagridData, hasNoResult, resetFilters } = useListEnhancer();
  const raListCtx = useListContext();
  const alert = useGlobalAlert();
  const refresh = useRefresh();

  // 偵測裝置尺寸
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  /** 查無資料 → 顯示提示 */
  useEffect(() => {
    if (hasNoResult) {
      alert.trigger("查無匹配的資料，請重新輸入搜尋條件");
    }
  }, [hasNoResult]);

  /** 刪除成功 → refresh() */
  useEffect(() => {
    if (alert.lastAction === "delete-success") {
      refresh();
    }
  }, [alert.lastAction, refresh]);

  /** 匯出 */
  const handleExport = () => {
    if (!raListCtx.data || !exportConfig) return;
    const { filename, format = "excel", columns } = exportConfig;
    if (format === "excel") exportExcel(raListCtx.data, filename, columns);
    else exportCsv(raListCtx.data, filename);
  };

  /** 合成 ListContext */
  const enhancedListContext = {
    ...raListCtx,
    data: hasNoResult ? datagridData : raListCtx.data,
    total: hasNoResult ? (datagridData?.length ?? 0) : raListCtx.total,
    isLoading: hasNoResult ? false : raListCtx.isLoading,
    isFetching: hasNoResult ? false : raListCtx.isFetching,
    isPending: hasNoResult ? false : raListCtx.isPending,
    isPlaceholderData: hasNoResult ? false : raListCtx.isPlaceholderData,
    error: null,
  } as ListControllerResult<any>; 

  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        padding: { xs: "8px", sm: "12px", md: "16px" },
        
        // 🛠️ 固定高度設置，防止資料少時縮減
        // 在電腦版鎖定最小高度 (例如 700px 或 calc 視窗高度)，手機版則自動高度
        minHeight: isMobile ? "auto" : "600px",
        height: "auto",
        
        boxSizing: "border-box",
        borderRadius: { xs: 1, md: 2 },
        border: isMobile ? "none" : `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, md: 2 },
        
        // 內層不再強制截斷內容
        overflow: "visible", 
        
        boxShadow: isMobile ? "none" : theme.shadows[1],
      })}
    >
      <GenericFilterBar
        quickFilters={quickFilters}
        advancedFilters={advancedFilters}
        enableExport={!!exportConfig}
        onExport={exportConfig ? handleExport : undefined}
        disableCreate={disableCreate}
      />

      <ListContextProvider value={enhancedListContext as ListControllerResult<any>}>
        <Box 
          sx={{ 
            // 🛠️ 修改重點：使用 flex: 1 填滿外層 Box 的其餘空間
            // 配合外層的 minHeight，即便沒資料也會撐開背景
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            minHeight: 0,
            overflowY: "visible" 
          }}
        >
          {children}
        </Box>
      </ListContextProvider>

      <GlobalAlertDialog
        open={alert.open}
        message={alert.message}
        onClose={() => {
          alert.close();
          if (hasNoResult) resetFilters();
        }}
      />
    </Box>
  );
};

export default StyledListWrapper;
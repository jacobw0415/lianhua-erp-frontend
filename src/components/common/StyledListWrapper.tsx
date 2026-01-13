import React, { useEffect } from "react";
import { Box } from "@mui/material";
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

    /**  React-Admin 官方 refresh API */
    const refresh = useRefresh();

    /**  查無資料 → 顯示提示 */
    useEffect(() => {
      if (hasNoResult) {
        alert.trigger("查無匹配的資料，請重新輸入搜尋條件");
      }
    }, [hasNoResult]);

    /**  刪除成功 → refresh() */
    useEffect(() => {
      if (alert.lastAction === "delete-success") {
        refresh(); // ← 正確刷新方式
      }
    }, [alert.lastAction]);

    /** 匯出 */
    const handleExport = () => {
      if (!raListCtx.data || !exportConfig) return;

      const { filename, format = "excel", columns } = exportConfig;

      if (format === "excel") exportExcel(raListCtx.data, filename, columns);
      else exportCsv(raListCtx.data, filename);
    };

    /** 合成 ListContext */
    const enhancedListContext: Partial<ListControllerResult<any>> = {
      ...raListCtx,

      /**  設定資料來源：查無結果才使用背景快取 */
      data: hasNoResult ? datagridData : raListCtx.data,

      /**  正確 total 來源：查無結果才用快取長度 */
      total: hasNoResult
        ? datagridData?.length ?? 0
        : raListCtx.total,
      // ⭐ 保留真實的 loading 狀態，避免在載入時顯示空狀態
      // 只有在「查無結果」時才強制設為 false（因為我們要顯示快取的資料）
      isLoading: hasNoResult ? false : raListCtx.isLoading,
      isFetching: hasNoResult ? false : raListCtx.isFetching,
      isPending: hasNoResult ? false : raListCtx.isPending,
      isPlaceholderData: hasNoResult ? false : raListCtx.isPlaceholderData,
      error: null,
    };

    return (
      <Box
        sx={(theme) => ({
          width: "100%",
          padding: "16px 16px",
          height: "620px",
          boxSizing: "border-box",
          borderRadius: 2,
          border: `1px solid ${theme.palette.action.disabled}`,
          bgcolor: theme.palette.background.paper,
        })}
      >
        <GenericFilterBar
          quickFilters={quickFilters}
          advancedFilters={advancedFilters}
          enableExport={!!exportConfig}
          onExport={exportConfig ? handleExport : undefined}
          disableCreate={disableCreate}
        />

        <ListContextProvider
          value={enhancedListContext as ListControllerResult<any>}
        >
          {children}
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

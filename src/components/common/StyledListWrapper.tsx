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
import { useIsMobile } from "@/hooks/useIsMobile";
import { LIST_WRAPPER_CONTENT_SX, LIST_CONTENT_AREA_SX, LIST_MIN_HEIGHT } from "@/constants/layoutConstants";

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
  disableButton?: boolean;
}> = ({
  children,
  quickFilters = [],
  advancedFilters = [],
  exportConfig,
  disableCreate = false,
  disableButton = false,
}) => {
  const { datagridData, hasNoResult, resetFilters } = useListEnhancer();
  const raListCtx = useListContext();
  const alert = useGlobalAlert();
  const refresh = useRefresh();

  // 偵測裝置尺寸
  const isMobile = useIsMobile();

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
      sx={{
        ...LIST_WRAPPER_CONTENT_SX,
        minHeight: isMobile ? "auto" : LIST_MIN_HEIGHT.desktop,
      }}
    >
      {/* 內部內容的水平間距 wrapper */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 0.75, sm: 1.5, md: 2 },
          paddingX: { xs: 1, sm: 2, md: 2 }, // 內部內容的水平間距
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <GenericFilterBar
          quickFilters={quickFilters}
          advancedFilters={advancedFilters}
          enableExport={!!exportConfig}
          onExport={exportConfig ? handleExport : undefined}
          disableCreate={disableCreate}
          disableButton={disableButton}
        />

        <ListContextProvider value={enhancedListContext as ListControllerResult<any>}>
          <Box sx={LIST_CONTENT_AREA_SX}>
            {children}
          </Box>
        </ListContextProvider>
      </Box>

      <GlobalAlertDialog
        open={alert.open}
        title={alert.title}
        message={alert.message}
        severity={alert.severity}
        confirmLabel={alert.confirmText}
        cancelLabel={alert.cancelText}
        hideCancel={!alert.cancelText}
        onClose={() => {
          alert.close();
          if (hasNoResult) resetFilters();
        }}
        onConfirm={alert.onConfirm}
      />
    </Box>
  );
};

export default StyledListWrapper;
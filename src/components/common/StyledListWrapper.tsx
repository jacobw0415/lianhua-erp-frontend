import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useListContext, ListContextProvider, type ListControllerResult } from "react-admin";

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

interface StyledListWrapperProps {
  children: React.ReactNode;
  quickFilters?: any[];
  advancedFilters?: any[];
  popoverWidth?: number | string;
  exportConfig?: ExportConfig;
}

export const StyledListWrapper: React.FC<StyledListWrapperProps> = ({
  children,
  quickFilters = [],
  advancedFilters = [],
  exportConfig,
}) => {
  /** ⭐ 讀取增強後的列表狀態（查無資料 + 最後有效資料） */
  const { datagridData, hasNoResult, resetFilters } = useListEnhancer();

  /** ⭐ React-Admin 原始 ListContext */
  const raListCtx = useListContext();

  /** ⭐ 全域彈窗控制 */
  const alert = useGlobalAlert();

  /** ❗ 查無資料 → 跳提示框 */
  useEffect(() => {
    if (hasNoResult) {
      alert.trigger("查無匹配的資料，請重新輸入搜尋條件");
    }
  }, [hasNoResult]);

  /** 📤 匯出 */
  const handleExport = () => {
    if (!raListCtx.data || !exportConfig) return;

    const { filename, format = "excel", columns } = exportConfig;

    if (format === "excel") {
      exportExcel(raListCtx.data, filename, columns);
    } else {
      exportCsv(raListCtx.data, filename);
    }
  };

  /**
   * ⭐⭐⭐ 重點：建立「乾淨且完整」的 ListControllerResult
   *      不能改 useListContext() 傳回的物件（會 TS 爆炸）
   *      必須自己組一份合法型別。
   */
    const enhancedListContext: Partial<ListControllerResult<any>> = {
    ...raListCtx,
    data: datagridData,
    total: datagridData?.length ?? 0,
    isLoading: false,
    isFetching: false,
    isPending: false,
    isPlaceholderData: false,
    error: null,
  };

  return (
    <Box sx={{ width: "100%" }}>
      <GenericFilterBar
        quickFilters={quickFilters}
        advancedFilters={advancedFilters}
        enableExport={!!exportConfig}
        onExport={exportConfig ? handleExport : undefined}
      />

      {/* ⭐ 用強制斷言讓 TS 接受 ListControllerResult */}
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
          resetFilters();
        }}
      />
    </Box>
  );
};

export default StyledListWrapper;
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  useListContext,
  useListFilterContext,
  ListContextProvider,
  type ListControllerResult,
  type RaRecord,
  useRefresh,
} from "react-admin";

import { GenericFilterBar, type FilterOption } from "./GenericFilterBar";
import { useListEnhancer } from "@/hooks/useListEnhancer";
import { useGlobalAlert } from "@/hooks/useGlobalAlert";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import {
  ExportColumnPickerDialog,
  type ExportDateFilterConfig,
  type ExportOptionsConfirm,
  type ExportPickerColumn,
} from "@/components/common/ExportColumnPickerDialog";
import { exportExcel } from "@/utils/exportExcel";
import { exportCsv } from "@/utils/exportCsv";
import { filterRecordsByExportDateRange } from "@/utils/exportDateFilter";
import { downloadResourceExport } from "@/api/resourceExportDownload";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LIST_WRAPPER_CONTENT_SX, LIST_CONTENT_AREA_SX, LIST_MIN_HEIGHT } from "@/constants/layoutConstants";
import type { ExportEnumMapKey } from "@/utils/exportCellValue";

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  enumKey?: ExportEnumMapKey;
}

interface ExportConfig {
  filename: string;
  format?: "excel" | "csv";
  columns: ExportColumn[];
  /**
   * 後端 GET `/{resource}/export`，query 與 `/{resource}/search` 一致並附加 `format`、`scope`。
   * 設定後改走 `downloadResourceExport`，不再使用前端組檔。
   */
  backendExport?: { resource: string; defaultFormat?: string };
  /**
   * 後端匯出對話框內可選日期區間（`listRangeFilterKeys` 對應列表 filter，會經 filterMapping 轉成 API 參數）。
   */
  backendExportDateFilter?: ExportDateFilterConfig;
  /**
   * 是否於匯出前開啟欄位勾選。
   * - `true`：一律開啟（含僅一欄時）。
   * - `false`：不開啟，直接匯出 `columns` 全部欄位。
   * - 未設定：欄位超過一個時開啟，僅一欄時直接匯出。
   */
  exportColumnPicker?: boolean;
  /** 欄位選擇對話框標題 */
  exportPickerTitle?: string;
  /**
   * 匯出對話框內可選日期範圍，依此欄位篩選「目前已載入」的列後再匯出。
   * 與 `exportColumnPicker` 可並用；設定了日期選項即會開啟對話框（即使僅單一匯出欄位）。
   */
  exportDateFilter?: ExportDateFilterConfig;
}

export const StyledListWrapper: React.FC<{
  children: React.ReactNode;
  quickFilters?: FilterOption[];
  advancedFilters?: FilterOption[];
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
  const { filterValues } = useListFilterContext();
  const alert = useGlobalAlert();
  const refresh = useRefresh();
  const [exportPickerOpen, setExportPickerOpen] = useState(false);

  // 偵測裝置尺寸
  const isMobile = useIsMobile();

  const showExportDialog = useMemo(() => {
    if (!exportConfig?.columns?.length) return false;
    return true;
  }, [exportConfig]);

  const listDatePrefill = useMemo(() => {
    const keys =
      exportConfig?.backendExport?.resource &&
      exportConfig?.backendExportDateFilter?.listRangeFilterKeys
        ? exportConfig.backendExportDateFilter.listRangeFilterKeys
        : exportConfig?.exportDateFilter?.listRangeFilterKeys;
    if (!keys) return undefined;
    const from = filterValues?.[keys.from];
    const to = filterValues?.[keys.to];
    const fs = typeof from === "string" && from.trim() ? from.trim() : undefined;
    const ts = typeof to === "string" && to.trim() ? to.trim() : undefined;
    if (!fs && !ts) return undefined;
    return { from: fs, to: ts };
  }, [
    exportConfig?.backendExport?.resource,
    exportConfig?.backendExportDateFilter?.listRangeFilterKeys,
    exportConfig?.exportDateFilter?.listRangeFilterKeys,
    filterValues,
  ]);

  /** 查無資料 → 顯示提示 */
  useEffect(() => {
    if (hasNoResult) {
      alert.trigger("查無匹配的資料，請重新輸入搜尋條件");
    }
  }, [hasNoResult, alert]);

  /** 刪除成功 → refresh() */
  useEffect(() => {
    if (alert.lastAction === "delete-success") {
      refresh();
    }
  }, [alert.lastAction, refresh]);

  const runExport = useCallback(
    async (
      columns: ExportPickerColumn[],
      dateFrom?: string,
      dateTo?: string,
      chosenFormat?: "excel" | "csv"
    ) => {
      if (!raListCtx.data?.length || !exportConfig) return;
      const { filename, format = "excel", exportDateFilter } = exportConfig;
      const outputFormat = chosenFormat ?? format;

      let rows = raListCtx.data as Record<string, unknown>[];
      if (
        exportDateFilter?.source &&
        (dateFrom !== undefined || dateTo !== undefined)
      ) {
        rows = filterRecordsByExportDateRange(rows, exportDateFilter.source, {
          dateFrom,
          dateTo,
        });
      }

      if (!rows.length) {
        alert.trigger("依條件篩選後沒有資料可匯出");
        return;
      }

      if (outputFormat === "excel") {
        await exportExcel(rows, filename, columns);
      } else {
        exportCsv(rows, filename, columns);
      }
    },
    [alert, exportConfig, raListCtx.data]
  );

  const runBackendExport = useCallback(
    async (
      scope: "page" | "all",
      format: string,
      dateFrom?: string,
      dateTo?: string,
      columnKeys?: string[]
    ) => {
      const resource = exportConfig?.backendExport?.resource;
      if (!resource) return;
      const rangeKeys = exportConfig?.backendExportDateFilter?.listRangeFilterKeys;
      const filter: Record<string, unknown> = { ...(filterValues ?? {}) };
      if (rangeKeys) {
        if (dateFrom !== undefined && dateFrom !== "") {
          filter[rangeKeys.from] = dateFrom;
        } else {
          delete filter[rangeKeys.from];
        }
        if (dateTo !== undefined && dateTo !== "") {
          filter[rangeKeys.to] = dateTo;
        } else {
          delete filter[rangeKeys.to];
        }
      }
      try {
        await downloadResourceExport(
          resource,
          {
            pagination: {
              page: raListCtx.page,
              perPage: raListCtx.perPage,
            },
            sort: raListCtx.sort,
            filter,
          },
          {
            scope,
            format,
            columns:
              columnKeys && columnKeys.length > 0 ? columnKeys : undefined,
          }
        );
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "SESSION_EXPIRED") {
          return;
        }
        const msg =
          e instanceof Error ? e.message : "匯出失敗，請稍後再試";
        alert.trigger(msg);
      }
    },
    [
      alert,
      exportConfig?.backendExport?.resource,
      exportConfig?.backendExportDateFilter?.listRangeFilterKeys,
      filterValues,
      raListCtx.page,
      raListCtx.perPage,
      raListCtx.sort,
    ]
  );

  /** 匯出：可選先開啟對話框（欄位／日期） */
  const handleExport = () => {
    if (!exportConfig) return;
    if (exportConfig.backendExport?.resource) {
      setExportPickerOpen(true);
      return;
    }
    if (!raListCtx.data?.length) return;
    if (showExportDialog) {
      setExportPickerOpen(true);
      return;
    }
    void runExport(exportConfig.columns, undefined, undefined, exportConfig.format);
  };

  const handleExportPickerConfirm = (payload: ExportOptionsConfirm) => {
    if (payload.backend && exportConfig?.backendExport?.resource) {
      void runBackendExport(
        payload.backend.scope,
        payload.backend.format,
        payload.backend.dateFrom,
        payload.backend.dateTo,
        payload.backend.columnKeys
      );
      return;
    }
    void runExport(
      payload.columns,
      payload.dateFrom,
      payload.dateTo,
      payload.format
    );
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
  } as ListControllerResult<RaRecord>;

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

        <ListContextProvider
          value={enhancedListContext as ListControllerResult<RaRecord>}
        >
          <Box sx={LIST_CONTENT_AREA_SX}>
            {children}
          </Box>
        </ListContextProvider>
      </Box>

      {exportConfig && (
        <ExportColumnPickerDialog
          open={exportPickerOpen}
          title={exportConfig.exportPickerTitle}
          columns={exportConfig.columns}
          mode={
            exportConfig.backendExport?.resource ? "backend" : "client"
          }
          defaultBackendFormat={
            exportConfig.backendExport?.defaultFormat ?? "xlsx"
          }
          defaultClientFormat={exportConfig.format ?? "excel"}
          dateFilter={exportConfig.exportDateFilter}
          backendDateFilter={exportConfig.backendExportDateFilter}
          listDatePrefill={listDatePrefill}
          onClose={() => setExportPickerOpen(false)}
          onConfirm={handleExportPickerConfirm}
        />
      )}

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
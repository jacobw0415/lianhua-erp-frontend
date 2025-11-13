import React from "react";
import { Box } from "@mui/material";
import { useListContext } from "react-admin";
import { GenericFilterBar } from "./GenericFilterBar";

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
  exportConfig?: ExportConfig; // ⭐ 匯出格式（每頁自行設定）
}

/**
 * 🌟 StyledListWrapper
 * - 統一顯示 GenericFilterBar（搜尋 + 新增 + 匯出）
 * - 不同頁面可自行設定 exportConfig
 */
export const StyledListWrapper: React.FC<StyledListWrapperProps> = ({
  children,
  quickFilters = [],
  advancedFilters = [],
  exportConfig,
}) => {
  const { data } = useListContext();

  /** 📤 匯出資料（Excel / CSV） */
  const handleExport = () => {
    if (!data || !exportConfig) return;

    const { filename, format = "excel", columns } = exportConfig;

    if (format === "excel") {
      exportExcel(data, filename, columns);
    } else {
      exportCsv(data, filename);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* 🔍 搜尋 + 新增 + 匯出 */}
      <GenericFilterBar
        quickFilters={quickFilters}
        advancedFilters={advancedFilters}
        enableExport={!!exportConfig}            // ⭐ 只有 exportConfig 才顯示匯出
        onExport={exportConfig ? handleExport : undefined}
      />

      {/* 📄 Datagrid / ListView */}
      {children}
    </Box>
  );
};

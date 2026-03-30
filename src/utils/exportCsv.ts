import {
  formatExportFieldValue,
  type ExportColumnLike,
} from "@/utils/exportCellValue";
import { logger } from "@/utils/logger";

/** 避免換行破壞列結構；RFC 4180 允許引號內換行但 Excel 常不易讀 */
const escapeCsvCell = (text: unknown): string => {
  const raw = text === null || text === undefined ? "" : String(text);
  const s = raw.replace(/\r\n|\r|\n/g, " ").replace(/"/g, '""');
  return `"${s}"`;
};

export interface ExportCsvColumn extends ExportColumnLike {
  header: string;
}

/**
 * 將 JSON 陣列匯出成 CSV 檔案
 * @param data 資料陣列
 * @param filename 檔案名稱（若無 .csv 副檔名會自動補上）
 * @param columns 若提供則依欄位定義輸出表頭與順序；否則使用第一筆資料的 key
 */
export const exportCsv = (
  data: Record<string, unknown>[],
  filename: string = "export.csv",
  columns?: ExportCsvColumn[]
) => {
  if (!data || data.length === 0) {
    logger.warn("沒有資料可匯出");
    return;
  }

  const cols: ExportCsvColumn[] =
    columns && columns.length > 0
      ? columns
      : Object.keys(data[0]).map((key) => ({ header: key, key }));

  const header = cols.map((c) => escapeCsvCell(c.header)).join(",");

  const rows = data.map((row) =>
    cols
      .map((c) => escapeCsvCell(formatExportFieldValue(c, row)))
      .join(",")
  );

  // UTF-8 BOM：Excel 開啟中文較不易亂碼
  const csvContent = "\uFEFF" + [header, ...rows].join("\n");

  const outName = filename.toLowerCase().endsWith(".csv")
    ? filename
    : `${filename}.csv`;

  // 下載檔案
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", outName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

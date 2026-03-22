import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  formatExportFieldValue,
  type ExportColumnLike,
} from "@/utils/exportCellValue";

export const exportExcel = async <T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: (ExportColumnLike & { header: string; width?: number })[]
) => {
  if (!data || data.length === 0) return;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  // 欄位設定
  sheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width ?? 20,
  }));

  // 加入資料（日期／枚舉與列表顯示對齊）
  data.forEach((item) => {
    const row: Record<string, unknown> = {};
    columns.forEach((col) => {
      row[col.key] = formatExportFieldValue(col, item);
    });

    sheet.addRow(row);
  });

  // 標頭樣式
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4CAF50" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // 輸出
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
};

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportExcel = async (
  data: any[],
  filename: string,
  columns: { header: string; key: string; width?: number }[]
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

  // 加入資料
  data.forEach((item) => {
    const row: any = {};
    columns.forEach((col) => {
      let value = item[col.key];

      if (value instanceof Date) {
        value = value.toISOString().split("T")[0];
      }

      if (typeof value === "number") {
        value = value;
      }

      row[col.key] = value;
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

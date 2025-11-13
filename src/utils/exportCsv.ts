/**
 * 將 JSON 陣列匯出成 CSV 檔案
 * @param data 資料陣列
 * @param filename 檔案名稱
 */
export const exportCsv = (data: any[], filename: string = "export.csv") => {
  if (!data || data.length === 0) {
    console.warn("沒有資料可匯出");
    return;
  }

  const keys = Object.keys(data[0]);

  // 產生 CSV header
  const header = keys.join(",");

  // 產生 CSV rows
  const rows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key] ?? "";
        return typeof value === "string"
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(",")
  );

  const csvContent = [header, ...rows].join("\n");

  // 下載檔案
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

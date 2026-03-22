import { valueToCalendarYmd } from "@/utils/localYmd";

/**
 * 依單一日期欄位篩選列（起迄皆含，以「本地日曆日」比對，避免 ISO/UTC 與介面所選日期差一天）。
 * `dateFrom` / `dateTo` 為 `YYYY-MM-DD`；皆未傳則不篩選。
 */
export function filterRecordsByExportDateRange<T extends Record<string, unknown>>(
  rows: T[],
  source: string,
  opts: { dateFrom?: string; dateTo?: string }
): T[] {
  const { dateFrom, dateTo } = opts;
  if (!dateFrom && !dateTo) return rows;

  return rows.filter((row) => {
    const key = valueToCalendarYmd(row[source]);
    if (!key) return false;
    if (dateFrom && key < dateFrom) return false;
    if (dateTo && key > dateTo) return false;
    return true;
  });
}

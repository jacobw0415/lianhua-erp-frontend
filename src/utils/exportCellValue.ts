import dayjs from "dayjs";
import { enumValueMap } from "@/utils/enumValueMap";
import { valueToCalendarYmd } from "@/utils/localYmd";

export type ExportEnumMapKey = keyof typeof enumValueMap;

export type ExportColumnLike = {
  key: string;
  enumKey?: ExportEnumMapKey;
};

/**
 * 將儲存格值格式化為與列表 DateField 相近的本地日曆日表示（YYYY-MM-DD），
 * 並處理 ISO 字串的時區造成的日界誤差。
 */
export function normalizeExportScalar(value: unknown): unknown {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return dayjs(value).format("YYYY-MM-DD");
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (!t) return "";
    const ymd = valueToCalendarYmd(t);
    if (ymd) return ymd;
  }
  return value;
}

/** 依欄位定義從列取出值：可選 enum 轉中文，再正規化日期顯示 */
export function formatExportFieldValue(
  col: ExportColumnLike,
  row: Record<string, unknown>
): unknown {
  let value: unknown = row[col.key];

  if (col.enumKey) {
    const map = enumValueMap[col.enumKey];
    if (map && value != null && value !== "") {
      value = map[String(value)] ?? value;
    }
  }

  return normalizeExportScalar(value);
}

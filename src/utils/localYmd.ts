import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * 將「純日期字串」以本地日曆解析（不依賴 UTC 午夜），與 MUI DatePicker + dayjs 一致。
 * 僅接受嚴格 YYYY-MM-DD。
 */
export function parseYmdLocal(value: string): dayjs.Dayjs | null {
  const t = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const d = dayjs(t, "YYYY-MM-DD", true);
  return d.isValid() ? d : null;
}

/**
 * 列表／API 欄位轉成本地日曆日 YYYY-MM-DD。
 * - 若為純 `YYYY-MM-DD` 字串，維持字面上的日（不經 UTC 轉換）。
 * - 若含時間或為 Date / timestamp，以本地時區格式化。
 */
export function valueToCalendarYmd(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  }
  const d = dayjs(raw as string | Date);
  if (!d.isValid()) return null;
  return d.format("YYYY-MM-DD");
}

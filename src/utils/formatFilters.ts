import { filterLabelMap } from "./filterLabelMap";
import { enumValueMap } from "./enumValueMap";

export const formatFilters = (filters: Record<string, any>) => {
  const chips: { key: string; display: string }[] = [];
  const used = new Set<string>();

  for (const key of Object.keys(filters)) {
    if (!filters[key]) continue;
    if (used.has(key)) continue;

    const value = filters[key];
    const label = filterLabelMap[key] || "";

    /* -------------------------
       📌 1. 日期區間："DateStart" + "DateEnd"
    -------------------------- */
    if (key.endsWith("Start")) {
      const base = key.replace("Start", "");
      const endKey = `${base}End`;

      if (filters[endKey]) {
        used.add(key);
        used.add(endKey);

        const display = `${fmtDate(value)} – ${fmtDate(filters[endKey])}`;
        chips.push({
          key: base,
          display: label ? `${label}: ${display}` : display,
        });
        continue;
      }
    }
    if (key.endsWith("End")) continue;

    /* -------------------------
       📌 2. 數字金額區間："Min" + "Max"
    -------------------------- */
    if (key.endsWith("Min")) {
      const base = key.replace("Min", "");
      const maxKey = `${base}Max`;

      if (filters[maxKey]) {
        used.add(key);
        used.add(maxKey);

        const display = `${fmtNum(value)} – ${fmtNum(filters[maxKey])}`;
        chips.push({
          key: base,
          display: label ? `${label}: ${display}` : display,
        });
        continue;
      }
    }
    if (key.endsWith("Max")) continue;

    /* -------------------------
       📌 3. ENUM / SELECT 中文化
    -------------------------- */
    if (enumValueMap[key]) {
      const translated = enumValueMap[key][value] || value;
      chips.push({
        key,
        display: label ? `${label}: ${translated}` : translated,
      });
      continue;
    }

    /* -------------------------
       📌 4. 多選陣列
    -------------------------- */
    if (Array.isArray(value)) {
      const display = value.join("、");
      chips.push({
        key,
        display: label ? `${label}: ${display}` : display,
      });
      continue;
    }

    /* -------------------------
       📌 5. 單值 → value only
    -------------------------- */
    chips.push({
      key,
      display: label ? `${label}: ${value}` : `${value}`,
    });
  }
  return chips;
};

/* Utilities */
const fmtDate = (d: string) => d?.replace(/-/g, "/") || "";
const fmtNum = (n: any) => Number(n).toLocaleString();

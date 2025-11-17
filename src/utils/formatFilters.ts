import { filterLabelMap } from "./filterLabelMap";
import { enumValueMap } from "./enumValueMap";

export const formatFilters = (filters: Record<string, any>) => {
  const chips: { key: string; display: string }[] = [];
  const used = new Set<string>();

  for (const key of Object.keys(filters)) {
    const rawValue = filters[key];

    // 🛡️ Ignore undefined / null / empty-string / whitespace
    if (
      rawValue === undefined ||
      rawValue === null ||
      (typeof rawValue === "string" && rawValue.trim() === "")
    ) {
      continue;
    }

    if (used.has(key)) continue;

    const value = rawValue;
    const label = filterLabelMap[key] || "";

    /* -------------------------
       📌 1. 日期區間："Start" + "End"
    -------------------------- */
    if (key.endsWith("Start")) {
      const base = key.replace("Start", "");
      const endKey = `${base}End`;

      if (
        filters[endKey] &&
        typeof filters[endKey] === "string" &&
        filters[endKey].trim() !== ""
      ) {
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
       📌 2. 數字區間 Min / Max
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
       📌 3. ENUM / SELECT mapping
    -------------------------- */
    if (enumValueMap[key]) {
      const map = enumValueMap[key];
      const translated = map[value] || value; // 🛡️ fallback

      chips.push({
        key,
        display: label ? `${label}: ${translated}` : `${translated}`,
      });

      continue;
    }

    /* -------------------------
       📌 4. 多選陣列
    -------------------------- */
    if (Array.isArray(value) && value.length > 0) {
      const display = value.join("、");

      chips.push({
        key,
        display: label ? `${label}: ${display}` : display,
      });

      continue;
    }

    /* -------------------------
       📌 5. 單值（安全版本）
    -------------------------- */
    const safeValue = typeof value === "string" ? value.trim() : value;

    if (safeValue !== "") {
      chips.push({
        key,
        display: label ? `${label}: ${safeValue}` : `${safeValue}`,
      });
    }
  }

  return chips;
};

/* Utilities */
const fmtDate = (d: string) => (d ? d.replace(/-/g, "/") : "");
const fmtNum = (n: any) => Number(n).toLocaleString();

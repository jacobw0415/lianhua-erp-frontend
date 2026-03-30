import { filterLabelMap } from "./filterLabelMap";
import { enumValueMap } from "./enumValueMap";

// 🏷️ 定義只顯示 value 的 filter keys（不顯示 label:value 格式）
// 這些 keys 在 chips 中只顯示 value，不顯示 "label: value" 格式
const valueOnlyKeys = new Set([
  // 付款/應付相關
  "method",           // 付款方式
  "status",           // 狀態
  "agingBucket",      // 帳齡區間
  "onlyUnpaid",       // 僅顯示未付款/未收款
  "accountingPeriod", // 會計期間

  // 文字搜尋
  "purchaseNo",       // 進貨單號
  "supplierName",     // 供應商名稱
  "customerName",     // 客戶名稱
  "categoryName",     // 費用類別名稱
  "employeeName",     // 員工名稱

  // 啟用 / 停用狀態：chips 只顯示「啟用／終止」，不需要再帶 label
  "active",
  "enabled",

  // 日期範圍（base keys）
  "fromDate",         // 進貨日（起）/ 付款日（起）/ 支出日（起）
  "toDate",           // 進貨日（迄）/ 付款日（迄）/ 支出日（迄）
  "purchaseDate",     // 進貨日期
  "payDate",          // 付款日期
  "expenseDate",      // 支出日期
  "saleDate",
  "receivedDate",
  "orderDate",
  "deliveryDate",
]);

export const formatFilters = (filters: Record<string, any>) => {
  return formatFiltersWithTranslator(filters);
};

type Translator = (key: string) => string;

export const formatFiltersWithTranslator = (
  filters: Record<string, any>,
  t?: Translator
) => {
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
    const labelKey = filterLabelMap[key] || "";
    const label = t && labelKey ? t(labelKey) : labelKey;
    const showValueOnly = valueOnlyKeys.has(key); // 是否只顯示 value

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
        const showValueOnly = valueOnlyKeys.has(base);
        chips.push({
          key: base,
          display: showValueOnly ? display : (label ? `${label}: ${display}` : display),
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
        const showValueOnly = valueOnlyKeys.has(base);

        chips.push({
          key: base,
          display: showValueOnly ? display : (label ? `${label}: ${display}` : display),
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
        display: showValueOnly ? translated : (label ? `${label}: ${translated}` : translated),
      });

      continue;
    }

    /* -------------------------
       📌 3.5. Boolean 類型（如 onlyUnpaid）
    -------------------------- */
    if (typeof value === "boolean") {
      // 只顯示 true 的情況，false 不顯示
      if (value === true) {
        // 對於 boolean 類型，使用 label 作為顯示文字（label 本身就是有意義的描述）
        const display = label || key;
        chips.push({
          key,
          display: display, // boolean 類型直接顯示 label，不需要 value
        });
      }
      continue;
    }

    /* -------------------------
       📌 4. 多選陣列
    -------------------------- */
    if (Array.isArray(value) && value.length > 0) {
      const display = value.join("、");

      chips.push({
        key,
        display: showValueOnly ? display : (label ? `${label}: ${display}` : display),
      });

      continue;
    }

    /* -------------------------
       📌 5. 單值（安全版本）
    -------------------------- */
    const safeValue = typeof value === "string" ? value.trim() : String(value).trim();

    // 🛡️ 只顯示實際使用者輸入的內容
    // 過濾掉空值、純空白、或無意義的值
    if (safeValue !== "") {
      chips.push({
        key,
        display: showValueOnly ? safeValue : (label ? `${label}: ${safeValue}` : safeValue),
      });
    }
  }

  return chips;
};

/* Utilities */
const fmtDate = (d: string) => (d ? d.replace(/-/g, "/") : "");
const fmtNum = (n: any) => Number(n).toLocaleString();

import { useListContext, type RaRecord } from "react-admin";
import { useEffect, useRef, useState } from "react";

export const useListEnhancer = () => {
  const { data, isLoading, filterValues, setFilters, setPage } = useListContext();

  /** ⭐ 保存最後一次成功載入的資料 */
  const lastValidData = useRef<RaRecord[]>([]);

  /** ⭐ 是否查無結果 */
  const [hasNoResult, setHasNoResult] = useState(false);

  /** ⭐ 是否已經成功載入過至少一次資料（避免第一次閃爍 No Data） */
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    /** 是否有搜尋條件 */
    const hasFilters =
      Object.values(filterValues ?? {}).some(v => v !== null && v !== "");

    /** 是否查無結果（必須：有搜尋條件 + data 為空） */
    const noResult = hasFilters && (!data || data.length === 0);

    setHasNoResult(noResult);

    if (!noResult && data && data.length > 0) {
      // ✔ 有有效資料 → 保存起來
      lastValidData.current = data;
      setHasLoadedOnce(true);
    }
  }, [data, isLoading, filterValues]);

  /** ⭐ 清除搜尋 — 回到 page=1 + 清空 filterValues */
  const resetFilters = () => {
    setFilters({}, null);
    setPage(1);
  };

  return {
    datagridData: lastValidData.current,
    hasNoResult,
    hasLoadedOnce,
    resetFilters,
  };
};

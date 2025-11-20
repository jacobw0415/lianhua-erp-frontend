import { useListContext, type RaRecord } from "react-admin";
import { useEffect, useRef, useState } from "react";

export const useListEnhancer = () => {
  const { data, isLoading, filterValues, setFilters, setPage } = useListContext();

  /** ⭐ 保存最後一次成功載入的資料 */
  const lastValidData = useRef<RaRecord[]>([]);

  /** ⭐ 是否查無結果（查詢 + 0 筆資料） */
  const [hasNoResult, setHasNoResult] = useState(false);

  /** ⭐ 是否已經成功載入過至少一次資料（避免初次閃爍） */
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    /** 若開始重新 loading（例如刪除 → refresh 觸發），先重置 hasNoResult */
    if (isLoading) {
      setHasNoResult(false);
      return;
    }

    /** 是否有搜尋條件 */
    const hasFilters =
      Object.values(filterValues ?? {}).some((v) => v !== null && v !== "");

    /** 是否搜尋條件下找不到資料 */
    const isSearchNoResult = hasFilters && (!data || data.length === 0);

    setHasNoResult(isSearchNoResult);

    /** ⭐ 只有在「不是查無結果」且有資料時，才更新快取 */
    if (!isSearchNoResult && data) {
      lastValidData.current = data; // ← 正常刷新 / 刪除後都會正確更新
      setHasLoadedOnce(true);
    }
  }, [data, isLoading, filterValues]);

  /** ⭐ 清除搜尋條件 */
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

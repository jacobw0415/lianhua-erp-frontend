import { useListContext, type RaRecord } from "react-admin";
import { useEffect, useRef, useState } from "react";

export const useListEnhancer = () => {
  const { data, isLoading, setFilters, setPage, filterValues } = useListContext();

  /** ⭐ 保存「最後一次有效資料」 */
  const lastValidData = useRef<RaRecord[]>([]);

  /** ⭐ 查無資料彈窗控制 */
  const [alertOpen, setAlertOpen] = useState(false);

  /** ⭐ 是否查無結果（提供給 StyledListWrapper 使用） */
  const [hasNoResult, setHasNoResult] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    /** 查無資料（必須有搜尋條件才算查無結果） */
    const noResult =
      !isLoading &&
      (!data || data.length === 0) &&
      Object.keys(filterValues ?? {}).length > 0;

    setHasNoResult(noResult);

    if (noResult) {
      // ❗ 查無資料 → 彈窗
      setAlertOpen(true);
    } else {
      // ✔ 保存有效資料
      lastValidData.current = data ?? [];
    }
  }, [data, isLoading, filterValues]);

  /** ⭐ 清除所有 filters（回到 page1 + 空搜尋條件） */
  const resetFilters = () => {
    setFilters({}, null);
    setPage(1);
  };

  const closeAlert = () => setAlertOpen(false);

  return {
    datagridData: lastValidData.current,

    hasNoResult, // ⭐補上此值，解決 StyledListWrapper 錯誤

    alertProps: {
      open: alertOpen,
      message: "查無匹配的資料，請重新輸入搜尋條件",
      onClose: closeAlert,
    },

    resetFilters,
    closeAlert,
  };
};

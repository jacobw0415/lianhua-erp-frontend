import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";
import { logger } from "@/utils/logger";

/* =========================================================
 * 型別定義
 * ========================================================= */

export type ExpenseFrequency = 'MONTHLY' | 'BIWEEKLY' | 'DAILY' | 'UNLIMITED';

export interface ExpenseCategory {
  id: number;
  name: string;
  accountCode?: string;
  description?: string;
  active: boolean;
  isSalary: boolean; // 是否為薪資類別
  frequencyType: ExpenseFrequency; // 費用頻率類型
}

interface ActiveExpenseCategoryResponse {
  data: ExpenseCategory[];
}

/* =========================================================
 * Hook
 * ========================================================= */

export const useActiveExpenseCategories = () => {
  const dataProvider = useDataProvider();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 防止組件卸載後仍更新狀態，避免記憶體洩漏警告
    let isMounted = true;
    setLoading(true);

    dataProvider
      .get("expense_categories/active")
      .then((res: ActiveExpenseCategoryResponse) => {
        if (!isMounted) return;

        // 2. 資料正規化 (Normalization)：
        // 強制確保 ID 為數字，並確保 boolean 欄位正確（處理 MySQL 可能回傳 1/0 的情況）
        const normalizedData = (res.data ?? []).map((cat) => ({
          ...cat,
          id: Number(cat.id),
          isSalary: Boolean(cat.isSalary),
          active: Boolean(cat.active),
        }));

        if (normalizedData.length > 0) {
          logger.debug("📋 費用類別資料：", normalizedData);
          const salaryCats = normalizedData.filter((cat) => cat.isSalary === true);
          logger.debug("💰 薪資類別數量：", salaryCats.length, salaryCats);
        }

        setCategories(normalizedData);
      })
      .catch((error: unknown) => {
        logger.devError("❌ 載入啟用費用分類失敗：", error);
        if (isMounted) setCategories([]); 
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // 3. 清理函數
    return () => {
      isMounted = false;
    };
  }, [dataProvider]);

  return { categories, loading };
};
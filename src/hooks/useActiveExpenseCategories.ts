import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

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
    dataProvider
      .get("expense_categories/active")
      .then((res: ActiveExpenseCategoryResponse) => {
        const categoriesData = res.data ?? [];
        
        // 調試：檢查 isSalary 欄位
        if (import.meta.env.DEV && categoriesData.length > 0) {
          console.log("📋 費用類別資料：", categoriesData);
          const salaryCats = categoriesData.filter((cat) => cat.isSalary === true);
          console.log("💰 薪資類別數量：", salaryCats.length, salaryCats);
        }
        
        setCategories(categoriesData);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入啟用費用分類失敗：", error);
        setCategories([]); // fallback
      })
      .finally(() => setLoading(false));
  }, [dataProvider]);

  return { categories, loading };
};


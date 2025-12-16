import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface ProductCategory {
  id: number;
  name: string;
  code?: string;
  active: boolean;
}

interface ActiveProductCategoryResponse {
  data: ProductCategory[];
}

/* =========================================================
 * Hook
 * ========================================================= */

export const useActiveProductCategories = () => {
  const dataProvider = useDataProvider();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .get("product_categories/active")
      .then((res: ActiveProductCategoryResponse) => {
        setCategories(res.data ?? []);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入啟用商品分類失敗：", error);
        setCategories([]); // fallback
      })
      .finally(() => setLoading(false));
  }, [dataProvider]);

  return { categories, loading };
};

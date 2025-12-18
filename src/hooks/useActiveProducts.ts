import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface Products {
  id: number;
  name: string;
  code?: string;
  active: boolean;
}

interface ActiveProductResponse {
  data: Products[];
}

/* =========================================================
 * Hook
 * ========================================================= */

export const useActiveProducts = () => {
  const dataProvider = useDataProvider();
  const [products, setProducts] = useState<Products[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .get("products/active")
      .then((res: ActiveProductResponse) => {
        setProducts(res.data ?? []);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入啟用商品分類失敗：", error);
        setProducts([]); // fallback
      })
      .finally(() => setLoading(false));
  }, [dataProvider]);

  return { products, loading };
};

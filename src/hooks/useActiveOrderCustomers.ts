import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface OrderCustomer {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
}

interface ActiveOrderCustomerResponse {
  data: OrderCustomer[] | { content: OrderCustomer[]; totalElements?: number };
}

/* =========================================================
 * Hook
 * ========================================================= */

export const useActiveOrderCustomers = () => {
  const dataProvider = useDataProvider();
  const [customers, setCustomers] = useState<OrderCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .get("order_customers")
      .then((res: ActiveOrderCustomerResponse) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        setCustomers(data);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入客戶列表失敗：", error);
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  }, [dataProvider]);

  return { customers, loading };
};

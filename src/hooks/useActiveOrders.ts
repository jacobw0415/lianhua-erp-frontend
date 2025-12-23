import { useEffect, useState } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface Order {
  id: number;
  orderNo: string;
  customerName?: string;
  totalAmount?: number;
  paymentStatus?: "UNPAID" | "PARTIAL" | "PAID";
}

interface ActiveOrderResponse {
  data: Order[] | { content: Order[]; totalElements?: number };
}

/* =========================================================
 * Hook
 * ========================================================= */

export const useActiveOrders = () => {
  const dataProvider = useDataProvider();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataProvider
      .getList("orders", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "id", order: "DESC" },
        filter: {},
      })
      .then((res: ActiveOrderResponse) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.content ?? [];
        setOrders(data);
      })
      .catch((error: unknown) => {
        console.error("❌ 載入訂單列表失敗：", error);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [dataProvider]);

  return { orders, loading };
};


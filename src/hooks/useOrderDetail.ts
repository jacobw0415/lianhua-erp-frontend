import { useEffect, useState, useRef } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface OrderDetail {
  id: number;
  orderNo: string;
  customerName?: string;
  totalAmount: number;
  paymentStatus?: "UNPAID" | "PARTIAL" | "PAID";
}

interface OrderDetailResponse {
  data: OrderDetail;
}

/* =========================================================
 * Hook：取得訂單詳情
 * ========================================================= */

export const useOrderDetail = (orderId: number | null | undefined) => {
  const dataProvider = useDataProvider();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 取消之前的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!orderId || typeof orderId !== "number") {
      setOrder(null);
      setError(null);
      setLoading(false);
      return;
    }

    // 創建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    dataProvider
      .getOne("orders", { id: orderId })
      .then((res: OrderDetailResponse) => {
        if (!abortController.signal.aborted) {
          setOrder(res.data);
        }
      })
      .catch((err: unknown) => {
        if (!abortController.signal.aborted) {
          console.error("❌ 載入訂單詳情失敗：", err);
          setError(err instanceof Error ? err : new Error("載入訂單詳情失敗"));
          setOrder(null);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return { order, loading, error };
};


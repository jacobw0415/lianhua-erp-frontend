import { useEffect, useState, useRef } from "react";
import { useDataProvider } from "react-admin";

/* =========================================================
 * 型別定義
 * ========================================================= */

export interface Receipt {
  id: number;
  amount: number;
  orderId?: number;
  status?: string;
}

interface ReceiptListResponse {
  data: Receipt[] | { content: Receipt[]; totalElements?: number };
}

/* =========================================================
 * Hook：取得訂單的已收款總額和收款記錄列表
 * ========================================================= */

export const useOrderReceipts = (
  orderId: number | null | undefined,
  orderNo?: string | null
) => {
  const dataProvider = useDataProvider();
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // 取消之前的請求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 檢查是否有有效的搜尋條件
    // 後端 /receipts/search 端點只支援 orderNo，不支援 orderId
    // 所以必須等待 orderNo 載入完成後才能查詢
    const hasValidOrderNo = orderNo && typeof orderNo === "string" && orderNo.trim() !== "";

    // 如果沒有有效的 orderNo，不發送請求（等待 orderNo 載入）
    if (!hasValidOrderNo) {
      setPaidAmount(0);
      setLoading(false);
      return;
    }

    // 創建新的 AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);

    // 取得該訂單的所有收款記錄
    // 使用 orderNo（後端 search 端點支援）
    const filter = { orderNo: orderNo.trim() };

    dataProvider
      .getList("receipts", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "id", order: "ASC" },
        filter,
      })
      .then((res: ReceiptListResponse) => {
        if (!abortController.signal.aborted) {
          const receiptList = Array.isArray(res.data)
            ? res.data
            : res.data?.content ?? [];

          // 保存收款記錄列表
          setReceipts(receiptList);

          // 計算已收款總額（只計算有效狀態的收款）
          const total = receiptList.reduce(
            (sum, receipt) => {
              // 只計算狀態為 ACTIVE 或未設置狀態的收款（向後兼容）
              if (receipt.status === "VOIDED") return sum;
              return sum + (receipt.amount || 0);
            },
            0
          );
          setPaidAmount(total);
        }
      })
      .catch((error: unknown) => {
        if (!abortController.signal.aborted) {
          console.error("❌ 載入收款記錄失敗：", error);
          setPaidAmount(0);
          setReceipts([]);
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
  }, [orderId, orderNo]);

  return { paidAmount, receipts, loading };
};


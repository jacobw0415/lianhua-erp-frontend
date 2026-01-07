import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/* ============================================================
 * 型別定義
 * ============================================================ */

interface LoadingProgressContextValue {
  startLoading: () => void;
  stopLoading: () => void;
  isLoading: boolean;
}

/* ============================================================
 * Context
 * ============================================================ */

const LoadingProgressContext =
  createContext<LoadingProgressContextValue | null>(null);

/* ============================================================
 * Provider
 * ============================================================ */

export const LoadingProgressProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loadingCount, setLoadingCount] = useState(0);

  /* ----------------------------
   * 開始載入（增加計數）
   * ---------------------------- */
  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
  }, []);

  /* ----------------------------
   * 停止載入（減少計數）
   * ---------------------------- */
  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => Math.max(0, prev - 1));
  }, []);

  const isLoading = loadingCount > 0;

  return (
    <LoadingProgressContext.Provider
      value={{ startLoading, stopLoading, isLoading }}
    >
      {children}
    </LoadingProgressContext.Provider>
  );
};

/* ============================================================
 * Hook
 * =========================================================== */

export const useLoadingProgress = () => {
  const ctx = useContext(LoadingProgressContext);
  if (!ctx) {
    throw new Error(
      "useLoadingProgress must be used within LoadingProgressProvider"
    );
  }
  return ctx;
};


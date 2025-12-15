import React, { createContext, useContext } from "react";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useGlobalAlert } from "@/hooks/useGlobalAlert";

/* =========================================================
 * 🔐 最小 ApiError 型別（Context 專用）
 * ========================================================= */
type ApiError =
  | {
      message?: string;
      body?: {
        message?: string;
        error?: string;
      };
    }
  | unknown;

/* =========================================================
 * 🔐 Context 型別定義（關鍵）
 * ========================================================= */
interface ErrorHandlerContextValue {
  handleApiError: (error: ApiError) => void;
}

/* =========================================================
 * Context
 * ========================================================= */
const ErrorHandlerContext =
  createContext<ErrorHandlerContextValue | null>(null);

export const ErrorHandlerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const globalAlert = useGlobalAlert();
  const { handleApiError } = useApiErrorHandler(globalAlert);

  return (
    <ErrorHandlerContext.Provider value={{ handleApiError }}>
      {children}
    </ErrorHandlerContext.Provider>
  );
};

export const useErrorHandler = () => {
  const ctx = useContext(ErrorHandlerContext);
  if (!ctx) {
    throw new Error(
      "useErrorHandler must be used within ErrorHandlerProvider"
    );
  }
  return ctx;
};

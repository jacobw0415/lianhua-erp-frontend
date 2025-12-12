import React, { createContext, useContext } from "react";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useGlobalAlert } from "@/hooks/useGlobalAlert";

const ErrorHandlerContext = createContext<any>(null);

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

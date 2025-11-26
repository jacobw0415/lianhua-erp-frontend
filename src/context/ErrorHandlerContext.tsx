import React, { createContext, useContext } from "react";
import { useApiErrorHandler } from "@/hooks/useApiErrorHandler";
import { useGlobalAlert } from "@/hooks/useGlobalAlert";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

const ErrorHandlerContext = createContext<any>(null);

export const ErrorHandlerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const globalAlert = useGlobalAlert();
  const { handleApiError } = useApiErrorHandler(globalAlert);

  return (
    <ErrorHandlerContext.Provider value={{ handleApiError, globalAlert }}>
      {children}

      {/* 🎯 全域彈窗放在最外層 */}
      <GlobalAlertDialog
        open={globalAlert.open}
        title={globalAlert.title}
        message={globalAlert.message}
        description={globalAlert.message}
        severity={globalAlert.severity}
        confirmLabel={globalAlert.confirmText}
        cancelLabel={globalAlert.cancelText}
        onClose={globalAlert.close}
        onConfirm={globalAlert.onConfirm}
      />
    </ErrorHandlerContext.Provider>
  );
};

export const useErrorHandler = () => useContext(ErrorHandlerContext);

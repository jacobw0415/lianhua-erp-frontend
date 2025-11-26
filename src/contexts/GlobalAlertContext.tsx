import { createContext, useContext, useState } from "react";

import { GlobalAlertDialog }  from "../components/common/GlobalAlertDialog";

interface AlertState {
  open: boolean;
  title: string;
  message: string;
  severity: "error" | "warning" | "info" | "success";
  confirmLabel: string;
  cancelLabel: string;
  hideCancel: boolean;
  onConfirm?: () => void;
}

const GlobalAlertContext = createContext<any>(null);

export const GlobalAlertProvider = ({ children }: any) => {
  const [state, setState] = useState<AlertState>({
    open: false,
    title: "提示",
    message: "",
    severity: "info",
    confirmLabel: "確定",
    cancelLabel: "取消",
    hideCancel: true,
    onConfirm: undefined,
  });

  const showAlert = (config: Partial<AlertState>) => {
    setState((prev) => ({
      ...prev,
      open: true,
      title: config.title ?? "提示",
      message: config.message ?? "",
      severity: config.severity ?? "info",
      confirmLabel: config.confirmLabel ?? "確定",
      cancelLabel: config.cancelLabel ?? "取消",
      hideCancel: config.hideCancel ?? true,
      onConfirm: config.onConfirm,
    }));
  };

  const close = () =>
    setState((prev) => ({ ...prev, open: false, onConfirm: undefined }));

  return (
    <GlobalAlertContext.Provider value={{ ...state, showAlert, close }}>
      {children}

      {/* 🔥 全域彈窗 */}
      <GlobalAlertDialog
        open={state.open}
        title={state.title}
        message={state.message}
        severity={state.severity}
        hideCancel={state.hideCancel}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        onClose={close}
        onConfirm={state.onConfirm}
      />
    </GlobalAlertContext.Provider>
  );
};

export const useGlobalAlert = () => useContext(GlobalAlertContext);

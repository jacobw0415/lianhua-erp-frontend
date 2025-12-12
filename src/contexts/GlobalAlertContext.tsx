import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

/* ============================================================
 * 型別定義（乾淨切割）
 * ============================================================ */

export type AlertSeverity =
  | "error"
  | "warning"
  | "info"
  | "success";

/** ⭐ 對外使用（showAlert 參數） */
export interface AlertPayload {
  title?: string;
  message?: string;
  description?: string;
  severity?: AlertSeverity;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  hideButtons?: boolean;
  onConfirm?: () => void;
}

/** ⭐ 內部 UI state（不外洩） */
interface AlertState extends Required<Omit<
  AlertPayload,
  "onConfirm"
>> {
  open: boolean;
  onConfirm?: () => void;
}

interface GlobalAlertContextValue {
  showAlert: (payload: AlertPayload) => void;
  hideAlert: () => void;
}

/* ============================================================
 * Context
 * ============================================================ */

const GlobalAlertContext =
  createContext<GlobalAlertContextValue | null>(null);

/* ============================================================
 * Provider
 * ============================================================ */

export const GlobalAlertProvider = ({
  children,
}: {
  children: ReactNode;
}) => {

  const [state, setState] = useState<AlertState>({
    open: false,
    title: "提示",
    message: "",
    description: "",
    severity: "info",
    confirmLabel: "確定",
    cancelLabel: "取消",
    hideCancel: true,
    hideButtons: false,
    onConfirm: undefined,
  });

  /* ----------------------------
   * 顯示 Alert（唯一入口）
   * ---------------------------- */
  const showAlert = useCallback((payload: AlertPayload) => {
    setState({
      open: true,
      title: payload.title ?? "提示",
      message: payload.message ?? "",
      description: payload.description ?? "",
      severity: payload.severity ?? "info",
      confirmLabel: payload.confirmLabel ?? "確定",
      cancelLabel: payload.cancelLabel ?? "取消",
      hideCancel: payload.hideCancel ?? true,
      hideButtons: payload.hideButtons ?? false,
      onConfirm: payload.onConfirm,
    });
  }, []);

  /* ----------------------------
   * 關閉 Alert（統一清理）
   * ---------------------------- */
  const hideAlert = useCallback(() => {
    setState((prev) => ({
      ...prev,
      open: false,
      onConfirm: undefined, // ⭐ 防止殘留
    }));
  }, []);

  return (
    <GlobalAlertContext.Provider
      value={{ showAlert, hideAlert }}
    >
      {children}

      {/* =========================
       * 全域唯一 Dialog
       * ========================= */}
      <GlobalAlertDialog
        open={state.open}
        title={state.title}
        message={state.message}
        description={state.description}
        severity={state.severity}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        hideCancel={state.hideCancel}
        hideButtons={state.hideButtons}
        onClose={hideAlert}
        onConfirm={() => {
          state.onConfirm?.();
          hideAlert();
        }}
      />
    </GlobalAlertContext.Provider>
  );
};

/* ============================================================
 * Hook
 * ============================================================ */

export const useGlobalAlert = () => {
  const ctx = useContext(GlobalAlertContext);
  if (!ctx) {
    throw new Error(
      "useGlobalAlert must be used within GlobalAlertProvider"
    );
  }
  return ctx;
};
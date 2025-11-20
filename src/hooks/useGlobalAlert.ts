import { useState } from "react";

export interface GlobalAlertConfig {
  title?: string;
  message?: string;
  severity?: "info" | "warning" | "error" | "success";
  confirmText?: string;
  cancelText?: string;      // ⭐ 可選：決定是否顯示取消按鈕
  onConfirm?: () => void;
  onCancel?: () => void;    // ⭐ 新增：讓取消事件可自訂
}

export const useGlobalAlert = () => {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    severity: "info" | "warning" | "error" | "success";
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    severity: "info",
    confirmText: "確認",
    cancelText: undefined,
  });

  /** ⭐⭐ 新增：記錄最近一次動作（用於刪除成功 → refresh()） */
  const [lastAction, setLastAction] = useState<string | null>(null);

  /** ⭐ showAlert：支援 action 參數 */
  const showAlert = (config: GlobalAlertConfig, action?: string) => {
    if (action) setLastAction(action);

    setState({
      open: true,
      title: config.title ?? "",
      message: config.message ?? "",
      severity: config.severity ?? "info",
      confirmText: config.confirmText ?? "確認",
      cancelText: config.cancelText,
      onConfirm: config.onConfirm,
      onCancel: config.onCancel,
    });
  };

  /** ⭐ trigger：單按鈕彈窗 + 支援 action */
  const trigger = (msg?: string, action?: string) => {
    if (action) setLastAction(action);

    showAlert(
      {
        title: "提示",
        message: msg ?? "",
        severity: "info",
        confirmText: "確定",
      },
      action
    );
  };

  /** ⭐ close：關閉後把 lastAction 清掉，避免重複 refresh */
  const close = () => {
    setState((prev) => ({ ...prev, open: false }));
    setLastAction(null);
  };

  return {
    ...state,
    showAlert,
    trigger,
    close,
    lastAction,   // ⭐ StyledListWrapper 會用到
  };
};

import { useState } from "react";

/**
 * 🌟 全域彈窗 Hook（可傳入預設訊息，也可在 trigger 時覆寫）
 */
export const useGlobalAlert = (defaultMessage = "") => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  /**
   * ⭐ 顯示彈窗
   * - 不傳參數 → 顯示 defaultMessage
   * - 傳參數 msg → 顯示 msg
   */
  const trigger = (msg?: string) => {
    if (msg) {
      setMessage(msg);
    } 
    setOpen(true);
  };

  /** ⭐ 關閉彈窗 */
  const close = () => {
    setOpen(false);
  };

  return {
    open,
    message,
    trigger,
    close,
  };
};

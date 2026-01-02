/* =========================================================
 * 🔐 型別定義（最小、只補型別）
 * ========================================================= */
interface GlobalAlertApi {
  showAlert: (
    options: {
      title: string;
      message: string;
      severity: "success" | "info" | "warning" | "error";
    },
    action?: string
  ) => void;
}

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
 * 🔧 useApiErrorHandler
 * ========================================================= */
export const useApiErrorHandler = (globalAlert: GlobalAlertApi) => {

  /** --------------------------------------------------------
   *  解析後端錯誤訊息（支援 normalizedError / Spring Boot）
   * -------------------------------------------------------- */
  const extractMessage = (error: ApiError): string => {
    if (!error) return "發生未知錯誤";

    if (typeof error === "object") {
      const e = error as {
        message?: string;
        body?: {
          message?: string;
          error?: string;
        };
      };

      // React-Admin / normalized error
      if (e.message) return e.message;

      // Spring Boot body.message
      if (e.body?.message) return e.body.message;

      // Spring Boot error
      if (e.body?.error) return e.body.error;
    }

    return "系統發生錯誤，請稍後再試";
  };

  /** --------------------------------------------------------
   * ⭐ 主錯誤處理
   * -------------------------------------------------------- */
  const handleApiError = (error: ApiError): void => {
    console.error("🔥 API ERROR:", error);

    const resolvedMessage = extractMessage(error);

    globalAlert.showAlert({
      title: "操作失敗",
      message: resolvedMessage,
      severity: "error",
    });
  };

  return { handleApiError };
};
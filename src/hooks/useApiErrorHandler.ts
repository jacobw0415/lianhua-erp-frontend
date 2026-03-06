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
    status?: number;
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
        body?: { message?: string; error?: string };
      };
      if (e.message) return e.message;
      if (e.body?.message) return e.body.message;
      if (e.body?.error) return e.body.error;
    }

    return "系統發生錯誤，請稍後再試";
  };

  /** --------------------------------------------------------
   * ⭐ 主錯誤處理（區分 401 / 403 / 400）
   * -------------------------------------------------------- */
  const handleApiError = (error: ApiError): void => {
    console.error("🔥 API ERROR:", error);

    const status = typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status?: number }).status)
      : undefined;

    let message = extractMessage(error);
    if (status === 403) {
      message = message || "您沒有權限執行此操作。";
      message += " 請返回列表或聯絡系統管理員。";
    }

    globalAlert.showAlert({
      title: status === 403 ? "權限不足" : "操作失敗",
      message,
      severity: "error",
    });
  };

  return { handleApiError };
};
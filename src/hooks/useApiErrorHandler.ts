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

    // 特殊處理：員工狀態錯誤
    let title = "操作失敗";
    let message = resolvedMessage;

    if (resolvedMessage.includes("狀態為") && resolvedMessage.includes("INACTIVE")) {
      title = "無法建立薪資支出";
      message = "無法為離職員工建立薪資支出。請選擇啟用中的員工。";
    } else if (resolvedMessage.includes("未設定薪資") || resolvedMessage.includes("薪資為 0")) {
      title = "員工薪資未設定";
      message = "該員工未設定薪資或薪資為 0，無法建立薪資支出記錄。請先設定員工薪資。";
    } else if (resolvedMessage.includes("非薪資類別")) {
      title = "費用類別錯誤";
      message = "選擇員工時必須使用薪資類別。系統會自動選擇正確的類別。";
    } else if (resolvedMessage.includes("開支日期不可修改") || resolvedMessage.includes("日期不可修改")) {
      title = "無法修改日期";
      message = "支出日期不可修改，若需異動請建立新紀錄。";
    } else if (resolvedMessage.includes("沒有啟用中的薪資類別")) {
      title = "缺少薪資類別";
      message = "系統中沒有啟用中的薪資類別，請先至「費用類別管理」新增並啟用薪資類別。";
    } else if (resolvedMessage.includes("為薪資類別，必須指定員工")) {
      title = "薪資類別錯誤";
      message = "薪資類別必須關聯員工。請選擇員工或選擇其他費用類別。";
    } else if (resolvedMessage.includes("每月一次") && (resolvedMessage.includes("同一會計期間") || resolvedMessage.includes("會計期間"))) {
      title = "頻率限制錯誤";
      message = resolvedMessage; // 直接顯示後端的詳細錯誤訊息
    } else if (resolvedMessage.includes("同一天同一類別") || resolvedMessage.includes("同一天同一類別只能建立一筆記錄")) {
      title = "頻率限制錯誤";
      message = resolvedMessage; // 直接顯示後端的詳細錯誤訊息
    }

    globalAlert.showAlert({
      title,
      message,
      severity: "error",
    });
  };

  return { handleApiError };
};
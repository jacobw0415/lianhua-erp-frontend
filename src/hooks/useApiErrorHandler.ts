export const useApiErrorHandler = (globalAlert: any) => {

  /** --------------------------------------------------------
   *  解析後端錯誤訊息（強化支援 normalizedError）
   * -------------------------------------------------------- */
  const extractMessage = (error: any): string => {
    if (!error) return "發生未知錯誤";

    //  支援 dataProvider 正規化後的格式
    if (error.message) return error.message;

    //  支援後端回傳 body.message
    if (error.body?.message) return error.body.message;

    //  支援 Spring Boot error / validation
    if (error.body?.error) return error.body.error;

    //  最後 fallback
    return "系統發生錯誤，請稍後再試";
  };

  /** --------------------------------------------------------
   * ⭐ 主錯誤處理
   * -------------------------------------------------------- */
  const handleApiError = (error: any) => {
    console.error("🔥 API ERROR:", error);

    const resolvedMessage = extractMessage(error);

    // ⭐ 統一彈出你的 GlobalAlert UI
    globalAlert.showAlert({
      title: "操作失敗",
      message: resolvedMessage,
      severity: "error",
    });
  };

  return { handleApiError };
};

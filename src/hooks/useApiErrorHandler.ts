export const useApiErrorHandler = (globalAlert: any) => {

  const extractMessage = (error: any): string => {
    if (!error) return "發生未知錯誤";
    if (error.body?.message) return error.body.message;
    if (error.message) return error.message;
    return "系統發生錯誤，請稍後再試";
  };

  const handleApiError = (error: any) => {
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

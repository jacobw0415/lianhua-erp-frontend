import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { authProvider } from "@/providers/authProvider";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

const apiUrl: string =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const ChangePasswordPage: React.FC = () => {
  const theme = useTheme();
  const { showAlert } = useGlobalAlert();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 套用全域 scrollbar 樣式
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert({
        message: "請完整填寫所有欄位。",
        severity: "warning",
        hideCancel: true,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert({
        message: "新密碼與確認密碼不一致。",
        severity: "warning",
        hideCancel: true,
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      const tokenType = typeof localStorage !== "undefined"
        ? localStorage.getItem("tokenType") || "Bearer"
        : "Bearer";

      const res = await fetch(`${apiUrl}/auth/change-password`, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          ...(token ? { Authorization: `${tokenType} ${token}` } : {}),
        }),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (res.status === 401) {
        // token 無效或過期 → 交給 authProvider 統一處理
        void authProvider.checkError({ status: 401 });
        return;
      }

      const text = await res.text();
      let message = "密碼已更新。";
      if (text) {
        try {
          const json = JSON.parse(text) as { message?: string };
          if (json.message) message = json.message;
        } catch {
          // ignore parse error
        }
      }

      if (!res.ok) {
        showAlert({
          message,
          severity: "error",
          hideCancel: true,
        });
        return;
      }

      showAlert({
        message,
        severity: "success",
        hideCancel: true,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showAlert({
        message: "變更密碼失敗，請稍後再試。",
        severity: "error",
        hideCancel: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          修改密碼
        </Typography>

        <TextField
          fullWidth
          type="password"
          label="目前密碼"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          type="password"
          label="新密碼"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          type="password"
          label="確認新密碼"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
        />

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "送出中…" : "變更密碼"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

ChangePasswordPage.displayName = "ChangePasswordPage";

export default ChangePasswordPage;


import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link as RouterLink } from "react-router-dom";
import { getApiUrl } from "@/config/apiUrl";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { authProvider } from "@/providers/authProvider";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

const apiUrl = getApiUrl();
/** 後端 PUT /users/me/password 要求 newPassword 至少 6 字元 */
const MIN_PASSWORD_LENGTH = 6;

const ChangePasswordPage: React.FC = () => {
  const theme = useTheme();
  const { showAlert } = useGlobalAlert();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // 套用全域 scrollbar 樣式
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  const validate = (): boolean => {
    let ok = true;

    if (!currentPassword.trim()) {
      setCurrentPasswordError("請輸入目前密碼");
      ok = false;
    } else {
      setCurrentPasswordError("");
    }

    const trimmedNew = newPassword.trim();
    if (!trimmedNew) {
      setNewPasswordError("請輸入新密碼");
      ok = false;
    } else if (trimmedNew.length < MIN_PASSWORD_LENGTH) {
      setNewPasswordError(`密碼長度至少需 ${MIN_PASSWORD_LENGTH} 碼`);
      ok = false;
    } else if (!/[A-Za-z]/.test(trimmedNew) || !/[0-9]/.test(trimmedNew)) {
      setNewPasswordError("密碼需同時包含英文字母與數字");
      ok = false;
    } else if (currentPassword && trimmedNew === currentPassword) {
      setNewPasswordError("新密碼不可與目前密碼相同");
      ok = false;
    } else {
      setNewPasswordError("");
    }

    const trimmedConfirm = confirmPassword.trim();
    if (!trimmedConfirm) {
      setConfirmPasswordError("請再次輸入新密碼");
      ok = false;
    } else if (trimmedConfirm !== trimmedNew) {
      setConfirmPasswordError("新密碼與確認密碼不一致");
      ok = false;
    } else {
      setConfirmPasswordError("");
    }

    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      const tokenType =
        typeof localStorage !== "undefined" ? localStorage.getItem("tokenType") || "Bearer" : "Bearer";

      if (!token) {
        void authProvider.checkError({ status: 401 });
        return;
      }

      const res = await fetch(`${apiUrl}/users/me/password`, {
        method: "PUT",
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        }),
        body: JSON.stringify({
          currentPassword,
          newPassword: newPassword.trim(),
        }),
      });

      const text = await res.text();
      let message = "";

      if (text) {
        try {
          const json = JSON.parse(text) as { message?: string; data?: string };
          message = json.message ?? json.data ?? "";
        } catch {
          message = text;
        }
      }

      if (res.status === 401) {
        void authProvider.checkError({ status: 401 });
        return;
      }

      if (!res.ok) {
        const errorMessage = message || "變更密碼失敗，請稍後再試。";
        setCurrentPasswordError(errorMessage);
        showAlert({
          message: errorMessage,
          severity: "error",
          hideCancel: true,
        });
        return;
      }

      showAlert({
        message: message || "密碼已更新，下次登入時請使用新密碼。",
        severity: "success",
        hideCancel: true,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
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

  const hasFieldError = !!(currentPasswordError || newPasswordError || confirmPasswordError);

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "background.default",
      }}
      aria-label="修改密碼頁面"
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 3,
        }}
      >
        <CardContent
          component="form"
          onSubmit={handleSubmit}
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 3, sm: 4 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
            <IconButton
              component={RouterLink}
              to="/profile"
              size="small"
              edge="start"
              sx={{ mr: 1 }}
              aria-label="返回個人資料"
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" component="h1">
              修改密碼
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            為保護您的帳號安全，建議定期變更密碼。
          </Typography>

          {hasFieldError && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              請修正紅色標示的欄位後再送出。
            </Alert>
          )}

          <TextField
            fullWidth
            size="small"
            type={showCurrentPassword ? "text" : "password"}
            label="目前密碼"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (currentPasswordError) setCurrentPasswordError("");
            }}
            margin="normal"
            autoComplete="current-password"
            required
            error={!!currentPasswordError}
            helperText={currentPasswordError || "請輸入您目前使用中的登入密碼。"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showCurrentPassword ? "隱藏目前密碼" : "顯示目前密碼"}
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            type={showNewPassword ? "text" : "password"}
            label="新密碼"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (newPasswordError) setNewPasswordError("");
            }}
            margin="normal"
            autoComplete="new-password"
            required
            error={!!newPasswordError}
            helperText={
              newPasswordError ||
              `至少 ${MIN_PASSWORD_LENGTH} 字元，並需同時包含英文字母與數字。`
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showNewPassword ? "隱藏新密碼" : "顯示新密碼"}
                    onClick={() => setShowNewPassword((v) => !v)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            type={showConfirmPassword ? "text" : "password"}
            label="確認新密碼"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (confirmPasswordError) setConfirmPasswordError("");
            }}
            margin="normal"
            autoComplete="new-password"
            required
            error={!!confirmPasswordError}
            helperText={confirmPasswordError || "請再次輸入新密碼以確認。"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showConfirmPassword ? "隱藏確認新密碼" : "顯示確認新密碼"}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ minHeight: 44 }}>
              {submitting ? "送出中…" : "變更密碼"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

ChangePasswordPage.displayName = "ChangePasswordPage";

export default ChangePasswordPage;


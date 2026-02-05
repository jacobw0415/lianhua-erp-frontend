import * as React from "react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useColorMode } from "@/contexts/useColorMode";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  alpha,
  InputAdornment,
  IconButton,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const apiUrl: string =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const BASE_PATH = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "";

const TITLE = "重設密碼";
const SUBTITLE = "請輸入新密碼並再次確認";

export const ResetPassPage = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const { mode } = useColorMode();
  const isDark = mode === "dark";

  useEffect(() => {
    if (!tokenFromUrl || tokenFromUrl.trim() === "") {
      setTokenError(true);
    }
  }, [tokenFromUrl]);

  // 與登入頁同步：鎖定 body/html 不捲動、無預設捲軸，背景與頁面一致
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    const prevBodyBackground = body.style.background;
    html.style.overflow = "hidden";
    html.style.height = "100vh";
    body.style.overflow = "hidden";
    body.style.height = "100vh";
    body.style.background = isDark
      ? "linear-gradient(135deg, #0d1f0e 0%, #1b2e1c 50%, #0d1f0e 100%)"
      : "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
      body.style.background = prevBodyBackground;
    };
  }, [isDark]);

  const handleGoLogin = () => {
    // 為了確保從 Email 重設流程結束後能回到「完整的」登入頁與 React-Admin 流程，
    // 採用硬導向，讓整個 App 重新初始化（避免卡在 only-reset-password 的特例 Router 裡）。
    if (typeof window !== "undefined") {
      const base = window.location.origin;
      const basePath = BASE_PATH.replace(/\/$/, "") || "";
      const path = `${basePath}/login`;
      window.location.href = `${base}${path}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword.trim()) {
      setError("請輸入新密碼");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }
    if (newPassword.length < 6) {
      setError("密碼長度至少 6 個字元");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          token: tokenFromUrl,
          newPassword: newPassword.trim(),
        }),
      });

      const text = await res.text();
      let message = "";
      if (text) {
        try {
          const json = JSON.parse(text) as { message?: string };
          if (json.message) message = json.message;
        } catch {
          // ignore
        }
      }

      if (res.ok) {
        setSuccess(true);
        return;
      }
      setError(message || "重設失敗，連結可能已過期，請重新申請");
    } catch {
      setError("無法連線，請檢查網路後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = isDark
    ? alpha("#1e1e1e", 0.95)
    : alpha("#ffffff", 0.98);
  const accentColor = isDark ? "#4CAF50" : "#388E3C";

  const pageBoxSx = {
    minHeight: "100vh",
    height: "100vh",
    overflow: "hidden" as const,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isDark
      ? "linear-gradient(135deg, #0d1f0e 0%, #1b2e1c 50%, #0d1f0e 100%)"
      : "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)",
    p: 2,
  };

  const cardSx = {
    width: "100%",
    maxWidth: 420,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: cardBg,
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "none",
  };

  if (tokenError) {
    return (
      <Box sx={pageBoxSx}>
        <Card elevation={isDark ? 8 : 4} sx={cardSx}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              {TITLE}
            </Typography>
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              無效或缺少重設連結，請從「忘記密碼」重新取得連結。
            </Alert>
            <Button onClick={handleGoLogin} startIcon={<ArrowBackIcon />} fullWidth>
              返回登入
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (success) {
    return (
      <Box sx={pageBoxSx}>
        <Card elevation={isDark ? 8 : 4} sx={cardSx}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: alpha(accentColor, 0.15),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 28, color: accentColor }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                {TITLE}
              </Typography>
            </Box>
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              密碼已重設。請使用新密碼登入。
            </Alert>
            <Button
              onClick={handleGoLogin}
              variant="contained"
              fullWidth
              sx={{
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                backgroundColor: accentColor,
                "&:hover": { backgroundColor: isDark ? "#66BB6A" : "#2E7D32" },
              }}
            >
              前往登入
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={pageBoxSx}>
      <Card elevation={isDark ? 8 : 4} sx={cardSx}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: alpha(accentColor, 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 28, color: accentColor }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
              {TITLE}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {SUBTITLE}
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              type={showNewPassword ? "text" : "password"}
              label="新密碼"
              placeholder="請輸入新密碼"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              autoFocus
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showNewPassword ? "隱藏密碼" : "顯示密碼"}
                      onClick={() => setShowNewPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              label="確認新密碼"
              placeholder="請再次輸入新密碼"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showConfirmPassword ? "隱藏密碼" : "顯示密碼"}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                backgroundColor: accentColor,
                "&:hover": {
                  backgroundColor: isDark ? "#66BB6A" : "#2E7D32",
                },
              }}
            >
              {isSubmitting ? "提交中…" : "提交新密碼"}
            </Button>
            <Button
              onClick={handleGoLogin}
              startIcon={<ArrowBackIcon />}
              fullWidth
              sx={{ mt: 2 }}
            >
              返回登入
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

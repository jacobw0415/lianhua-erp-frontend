import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { getApiUrl } from "@/config/apiUrl";
import { applyLoginSuccessFromContainer } from "@/providers/authProvider";

const apiUrl = getApiUrl();

const TITLE = "MFA 驗證碼";
const SUBTITLE = "請輸入 6 碼驗證碼以完成登入";

export const MfaVerifyPage = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  // 讀取登入第一階段暫存的 pendingToken 與 username
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const token = sessionStorage.getItem("mfa_pending_token");
    const name = sessionStorage.getItem("mfa_username");
    setPendingToken(token);
    setUsername(name);
  }, []);

  // 與登入頁同步：鎖定 body/html 不捲動，背景與頁面一致（亮/暗主題）
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

  const handleBackToLogin = () => {
    if (typeof window !== "undefined") {
      const base = window.location.origin;
      const basePath =
        (typeof import.meta !== "undefined" &&
          (import.meta.env?.BASE_URL as string | undefined)) ||
        "";
      const path = `${basePath.replace(/\/$/, "") || ""}/login`;
      window.location.href = `${base}${path}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== 6) {
      setError("請輸入 6 碼驗證碼");
      return;
    }
    if (!pendingToken) {
      setError("MFA 驗證階段已失效，請重新登入");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/auth/mfa/verify`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          pendingToken,
          code: trimmedCode,
        }),
      });

      const text = await res.text();
      let message = "";
      let jsonBody: unknown = null;
      if (text) {
        try {
          jsonBody = JSON.parse(text);
          const body = jsonBody as { message?: string };
          if (body.message) message = body.message;
        } catch {
          // ignore
        }
      }

      if (!res.ok) {
        if (res.status === 400) {
          setError("驗證碼錯誤或已過期，請再試一次或返回登入頁。");
          return;
        }
        setError(
          message || "驗證失敗，請稍後再試或聯絡系統管理員。"
        );
        return;
      }

      // 成功：後端回傳 JwtResponse，直接寫入 localStorage（與一般登入相同）；標記 MFA 已啟用供個人資料頁顯示
      try {
        if (jsonBody && typeof jsonBody === "object") {
          applyLoginSuccessFromContainer(
            jsonBody as Record<string, unknown>,
            username ?? undefined,
            true // 剛以 MFA 驗證登入，個人資料頁應顯示「MFA 已啟用」
          );
        }
      } catch {
        // 若寫入失敗，不阻擋導向主畫面，實際權限仍由後端 401 控制
      }

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("mfa_pending_token");
        sessionStorage.removeItem("mfa_username");
      }

      navigate("/", { replace: true });
    } catch {
      setError("無法連線，請檢查網路後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = isDark ? alpha("#1e1e1e", 0.95) : alpha("#ffffff", 0.98);
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

  const hasPending = !!pendingToken;

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
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {TITLE}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {username
                ? `${SUBTITLE}（帳號：${username}）`
                : SUBTITLE}
            </Typography>
          </Box>

          {!hasPending && (
            <Alert
              severity="warning"
              sx={{ mb: 2, borderRadius: 2 }}
            >
              找不到有效的 MFA 驗證流程，可能已逾時或瀏覽器資料已被清除。請返回登入頁重新登入。
            </Alert>
          )}

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
              label="6 碼驗證碼"
              placeholder="請輸入 Authenticator 顯示的 6 碼"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              autoComplete="one-time-code"
              autoFocus
              disabled={isSubmitting || !hasPending}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
              inputProps={{
                inputMode: "numeric",
              }}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting || !hasPending}
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
              {isSubmitting ? "驗證中…" : "確認驗證碼"}
            </Button>
            <Button
              onClick={handleBackToLogin}
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


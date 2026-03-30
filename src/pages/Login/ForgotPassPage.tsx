import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { getApiUrl } from "@/config/apiUrl";
import {
  appendLangQueryIfMissing,
  mergeHeadersWithAcceptLanguage,
} from "@/utils/apiLocale";
import { logger } from "@/utils/logger";

const apiUrl = getApiUrl();

const BASE_PATH = (typeof import.meta !== "undefined" && import.meta.env?.BASE_URL) || "";

export const ForgotPassPage = () => {
  const { t } = useTranslation("common");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const { mode } = useColorMode();
  const isDark = mode === "dark";
  const location = useLocation();

  // 與登入頁同步：鎖定 body/html 不捲動、無預設捲軸，背景與頁面一致（避免黑色）
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

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t("forgotPassword.errorEmailRequired"));
      return;
    }
    setIsSubmitting(true);
    try {
      // 傳送目前頁面基底網址，後端應以此產生信件中的重設連結，例：${resetLinkBaseUrl}/reset-password?token=xxx
      // 如此從 http://10.18.2.103:5173 送出時，信件連結即為同源，點開後可於同 IP 完成重設並返回登入
      const resetLinkBaseUrl =
        typeof window !== "undefined"
          ? window.location.origin +
            (BASE_PATH.replace(/\/$/, "") || "")
          : "";
      const body = {
        email: trimmed,
        ...(resetLinkBaseUrl ? { resetLinkBaseUrl } : {}),
      };
      const res = await fetch(appendLangQueryIfMissing(`${apiUrl}/auth/forgot-password`), {
        method: "POST",
        headers: mergeHeadersWithAcceptLanguage({ "Content-Type": "application/json" }),
        body: JSON.stringify(body),
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

      logger.debug("[ForgotPass] POST /api/auth/forgot-password", {
        status: res.status,
        ok: res.ok,
        bodySent: body,
        responseText: text.slice(0, 200),
      });

      if (res.ok) {
        setSuccess(true);
        return;
      }
      // 409：該使用者已有未使用的重設 token（後端唯一約束），引導使用者查信箱或稍後再試
      if (res.status === 409) {
        setError(t("forgotPassword.error409"));
        return;
      }
      // 400 過於頻繁 / Rate Limit
      if (res.status === 400) {
        const friendly =
          /頻繁|稍後再試|frequent|rate|too many/i.test(message || "") ||
          /嘗試過多/i.test(message || "")
            ? t("forgotPassword.errorRateLimit")
            : "";
        setError(friendly || t("forgotPassword.errorRateLimit"));
        setCooldown(60);
        return;
      }
      // 500：統一泛用錯誤訊息
      if (res.status >= 500) {
        setError(t("forgotPassword.errorServer"));
        return;
      }
      setError(message || t("forgotPassword.errorSendFailed"));
    } catch (err) {
      logger.devError("[ForgotPass] request failed", err);
      setError(t("forgotPassword.errorNetwork"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = isDark
    ? alpha("#1e1e1e", 0.95)
    : alpha("#ffffff", 0.98);
  const accentColor = isDark ? "#4CAF50" : "#388E3C";
  const loginPath = `${BASE_PATH.replace(/\/$/, "") || ""}/login`;

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
                <EmailOutlinedIcon sx={{ fontSize: 28, color: accentColor }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                {t("forgotPassword.successTitle")}
              </Typography>
            </Box>
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {t("forgotPassword.successAlert")}
            </Alert>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link
                to={loginPath}
                style={{
                  color: accentColor,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} /> {t("forgotPassword.backToLogin")}
              </Link>
            </Box>
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
              <EmailOutlinedIcon sx={{ fontSize: 28, color: accentColor }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
              {t("forgotPassword.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t("forgotPassword.subtitle")}
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
              type="email"
              label="Email"
              placeholder="請輸入註冊用的 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              disabled={isSubmitting || cooldown > 0}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
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
              {isSubmitting
                ? t("forgotPassword.submitting")
                : cooldown > 0
                  ? t("forgotPassword.cooldown", { seconds: cooldown })
                  : t("forgotPassword.submit")}
            </Button>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link
                to={loginPath}
                state={location.state}
                style={{
                  color: accentColor,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} /> {t("forgotPassword.backToLogin")}
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

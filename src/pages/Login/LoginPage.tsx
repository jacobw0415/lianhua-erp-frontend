import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "react-admin";
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
  InputAdornment,
  IconButton,
  alpha,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { logger } from "@/utils/logger";

const LOGIN_COOLDOWN_SEC = 60;

type BannerState = {
  message: string;
  severity: "success" | "info" | "warning" | "error";
} | null;

export const LoginPage = () => {
  const { t } = useTranslation("common");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerState>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginCooldown, setLoginCooldown] = useState(0);

  const submitLock = useRef(false);

  const login = useLogin();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const expiredFlag = sessionStorage.getItem("login_expired");
    const reason = sessionStorage.getItem("login_expired_reason");
    const logoutSuccess = sessionStorage.getItem("logout_success");

    if (logoutSuccess === "1") {
      setBanner({ message: t("login.bannerLogout"), severity: "success" });
      sessionStorage.removeItem("logout_success");
    } else if (expiredFlag === "1") {
      setBanner({
        message:
          reason === "force_logout"
            ? t("login.bannerForceLogout")
            : t("login.bannerExpired"),
        severity: "warning",
      });
      sessionStorage.removeItem("login_expired");
      sessionStorage.removeItem("login_expired_reason");
    }
  }, [t]);

  useEffect(() => {
    if (loginCooldown <= 0) return;
    const timer = setInterval(() => {
      setLoginCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [loginCooldown]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevStyle = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      background: body.style.background
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.background = isDark
      ? "linear-gradient(135deg, #0d1f0e 0%, #1b2e1c 50%, #0d1f0e 100%)"
      : "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)";
    return () => {
      html.style.overflow = prevStyle.htmlOverflow;
      body.style.overflow = prevStyle.bodyOverflow;
      body.style.background = prevStyle.background;
    };
  }, [isDark]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (submitLock.current || isSubmitting) return;

    setError(null);
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError(t("login.errorEmpty"));
      return;
    }

    submitLock.current = true;
    setIsSubmitting(true);

    login({ username: trimmedUsername, password: trimmedPassword })
      .then(() => {
        logger.debug("[Login] Success, navigating to dashboard");
        navigate("/", { replace: true });
      })
      .catch((err: any) => {
        submitLock.current = false;
        setIsSubmitting(false);

        const code = err?.code || err?.message;

        if (code === "MFA_REQUIRED") {
          logger.debug("[Login] MFA Required, redirecting to MFA page...");
          navigate("/mfa", { replace: true });
          return;
        }

        const msg = err?.message ?? t("login.errorFailed");
        setError(msg);

        if (/嘗試過多|操作過於頻繁|稍後再試|too many|rate|frequent/i.test(msg)) {
          setLoginCooldown(LOGIN_COOLDOWN_SEC);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
        submitLock.current = false;
      });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token") || params.get("resetToken");
    if (token) {
      navigate(`/reset-password?token=${encodeURIComponent(token)}`, { replace: true });
    }
  }, [location.search, navigate]);

  const cardBg = isDark ? alpha("#1e1e1e", 0.95) : alpha("#ffffff", 0.98);
  const accentColor = isDark ? "#4CAF50" : "#388E3C";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Card elevation={isDark ? 8 : 4} sx={{ width: "100%", maxWidth: 420, borderRadius: 4, backgroundColor: cardBg }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: alpha(accentColor, 0.15), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
              <LockOutlinedIcon sx={{ fontSize: 28, color: accentColor }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{t("login.title")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{t("login.subtitle")}</Typography>
          </Box>

          {banner && <Alert severity={banner.severity} onClose={() => setBanner(null)} sx={{ mb: 2 }}>{banner.message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label={t("login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              disabled={isSubmitting || loginCooldown > 0}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t("login.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={isSubmitting || loginCooldown > 0}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                      {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
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
              disabled={isSubmitting || loginCooldown > 0}
              sx={{ py: 1.5, fontWeight: 700, bgcolor: accentColor }}
            >
              {isSubmitting
                ? t("login.submitting")
                : loginCooldown > 0
                  ? t("login.cooldown", { seconds: loginCooldown })
                  : t("login.submit")}
            </Button>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link to="/forgot-password" style={{ color: accentColor, fontSize: "0.875rem", textDecoration: "none" }}>
                {t("login.forgotPassword")}
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

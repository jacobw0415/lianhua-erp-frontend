import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "react-admin";
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

const TITLE = "蓮華 ERP";
const SUBTITLE = "請登入以繼續使用系統";

const LOGIN_COOLDOWN_SEC = 60;

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginCooldown, setLoginCooldown] = useState(0);

  const login = useLogin();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  // 登入逾期／401 後導回登入頁時顯示提示
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    if (sessionStorage.getItem("login_expired") === "1") {
      sessionStorage.removeItem("login_expired");
      setError("登入逾期或已登出，請重新登入");
    }
  }, []);

  // 登入按鈕冷卻倒數（防暴力鎖定後）
  useEffect(() => {
    if (loginCooldown <= 0) return;
    const t = setInterval(() => {
      setLoginCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [loginCooldown]);

  // 與忘記密碼頁同步：鎖定 body/html 不捲動，背景與頁面一致（亮/暗主題）
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    if (!trimmedUsername || !trimmedPassword) {
      setError("請輸入帳號與密碼");
      return;
    }
    setIsSubmitting(true);
    login({ username: trimmedUsername, password: trimmedPassword })
      .then(() => {
        // 一律導向儀表板，避免沿用上一位使用者的路徑（如 /users）導致 ROLE_USER 一進入就 401 被登出
        navigate("/", { replace: true });
      })
      .catch((err: unknown) => {
        const anyErr = err as { message?: string; code?: string };
        const code = anyErr?.code;
        const msgRaw = anyErr?.message;

        // MFA 登入第二階段：authProvider.login 以 MFA_REQUIRED 拋錯 → 導向 /mfa，不顯示為「登入失敗」
        if (code === "MFA_REQUIRED" || msgRaw === "MFA_REQUIRED") {
          navigate("/mfa", { replace: true });
          return;
        }

        const msg = msgRaw ?? "登入失敗，請稍後再試";
        setError(msg);
        // 登入嘗試過多／操作過於頻繁時暫停按鈕，避免重複點擊
        if (/嘗試過多|登入嘗試過多|操作過於頻繁|過於頻繁|稍後再試/i.test(msg)) {
          setLoginCooldown(LOGIN_COOLDOWN_SEC);
        }
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // 若從後端寄出的重設密碼連結誤指向 /login?token=xxx 或 /login?resetToken=xxx
  // 則在此自動轉向到真正的 /reset-password 頁面，確保使用者可以直接修改密碼。
  useEffect(() => {
    const search = location.search;
    if (!search) return;

    const params = new URLSearchParams(search);
    const token = params.get("token") || params.get("resetToken");
    if (token) {
      navigate(`/reset-password?token=${encodeURIComponent(token)}`, {
        replace: true,
      });
    }
  }, [location.search, navigate]);

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
            label="帳號"
            placeholder="請輸入帳號"
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
            label="密碼"
            placeholder="請輸入密碼"
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
                  <IconButton
                    aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
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
            disabled={isSubmitting || loginCooldown > 0}
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
            {isSubmitting ? "登入中…" : loginCooldown > 0 ? `請 ${loginCooldown} 秒後再試` : "登入"}
          </Button>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link
              to="/forgot-password"
              style={{
                color: accentColor,
                fontSize: "0.875rem",
                textDecoration: "none",
              }}
            >
              忘記密碼？
            </Link>
          </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

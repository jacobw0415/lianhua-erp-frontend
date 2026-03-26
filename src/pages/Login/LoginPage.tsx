import * as React from "react";
import { useState, useEffect, useRef } from "react";
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

type BannerState = {
  message: string;
  severity: "success" | "info" | "warning" | "error";
} | null;

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerState>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginCooldown, setLoginCooldown] = useState(0);

  // 🌟 物理鎖：防止在異步回傳前重複提交
  const submitLock = useRef(false);

  const login = useLogin();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  // 登入狀態提示邏輯
  useEffect(() => {
    if (typeof sessionStorage === "undefined") return;
    const expiredFlag = sessionStorage.getItem("login_expired");
    const reason = sessionStorage.getItem("login_expired_reason");
    const logoutSuccess = sessionStorage.getItem("logout_success");

    if (logoutSuccess === "1") {
      setBanner({ message: "您已成功登出。", severity: "success" });
      sessionStorage.removeItem("logout_success");
    } else if (expiredFlag === "1") {
      setBanner({
        message: reason === "force_logout" ? "您已被管理員強制登出。" : "登入已逾期，請重新登入。",
        severity: "warning",
      });
      sessionStorage.removeItem("login_expired");
      sessionStorage.removeItem("login_expired_reason");
    }
  }, []);

  // 倒數計時器
  useEffect(() => {
    if (loginCooldown <= 0) return;
    const t = setInterval(() => {
      setLoginCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [loginCooldown]);

  // 背景鎖定
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
    
    // 1. 同步檢查物理鎖
    if (submitLock.current || isSubmitting) return;

    setError(null);
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("請輸入帳號與密碼");
      return;
    }

    // 2. 立即上鎖
    submitLock.current = true;
    setIsSubmitting(true);

    login({ username: trimmedUsername, password: trimmedPassword })
      .then(() => {
        // 🌟 修正：只有在真正成功且沒有拋出 MFA_REQUIRED 的情況下才導向首頁
        console.log("[Login] Success, navigating to dashboard");
        navigate("/", { replace: true });
      })
      .catch((err: any) => {
        // 3. 失敗或 MFA 需求時解鎖（MFA 導頁後會由 MFA 頁面接手鎖定）
        submitLock.current = false;
        setIsSubmitting(false);

        const code = err?.code || err?.message;

        // 🌟 核心修正：明確攔截 MFA 需求，防止進入一般錯誤流程
        if (code === "MFA_REQUIRED") {
          console.log("[Login] MFA Required, redirecting to MFA page...");
          // 確保這裡使用 replace，避免按回退鍵回到已提交的登入表單
          navigate("/mfa", { replace: true });
          return;
        }

        const msg = err?.message ?? "登入失敗，請稍後再試";
        setError(msg);

        if (/嘗試過多|操作過於頻繁|稍後再試/i.test(msg)) {
          setLoginCooldown(LOGIN_COOLDOWN_SEC);
        }
      })
      .finally(() => {
        // 萬一既沒成功也沒進 catch 的極端情況
        setIsSubmitting(false);
        submitLock.current = false;
      });
  };

  // 自動導向重設密碼邏輯
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
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{TITLE}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{SUBTITLE}</Typography>
          </Box>

          {banner && <Alert severity={banner.severity} onClose={() => setBanner(null)} sx={{ mb: 2 }}>{banner.message}</Alert>}
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth label="帳號"
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
              fullWidth label="密碼"
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
              {isSubmitting ? "登入中…" : loginCooldown > 0 ? `請 ${loginCooldown} 秒後再試` : "登入"}
            </Button>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link to="/forgot-password" style={{ color: accentColor, fontSize: "0.875rem", textDecoration: "none" }}>
                忘記密碼？
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
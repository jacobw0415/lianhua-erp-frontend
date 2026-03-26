import * as React from "react";
import { useState, useEffect, useRef } from "react";
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

  // 🌟 物理鎖與掛載狀態
  const submitLock = useRef(false);
  const isReady = useRef(false);

  const navigate = useNavigate();
  const { mode } = useColorMode();
  const isDark = mode === "dark";

  // 1. 初始化與冷卻鎖（解決 LoginPage Enter 鍵漂移問題）
  useEffect(() => {
    // 延遲 500ms 讓頁面穩定後才允許提交
    const timer = setTimeout(() => {
      isReady.current = true;
      console.log("[MFA] 頁面已就緒，開始接收輸入");
    }, 500);

    if (typeof sessionStorage !== "undefined") {
      setPendingToken(sessionStorage.getItem("mfa_pending_token"));
      setUsername(sessionStorage.getItem("mfa_username"));
    }

    return () => {
      clearTimeout(timer);
      isReady.current = false;
    };
  }, []);

  // 2. 樣式處理
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevStyle = { overflow: html.style.overflow, background: body.style.background };
    html.style.overflow = "hidden";
    body.style.background = isDark
      ? "linear-gradient(135deg, #0d1f0e 0%, #1b2e1c 50%, #0d1f0e 100%)"
      : "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 50%, #A5D6A7 100%)";
    return () => {
      html.style.overflow = prevStyle.overflow;
      body.style.background = prevStyle.background;
    };
  }, [isDark]);

  const handleBackToLogin = () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("mfa_pending_token");
      sessionStorage.removeItem("mfa_username");
    }
    navigate("/login", { replace: true });
  };

  /**
   * 🌟 核心驗證執行邏輯（解決 409 競爭與權限同步版）
   */
  const performVerify = async () => {
    // 同步攔截：未就緒、已上鎖、長度不足
    if (!isReady.current || submitLock.current || code.length !== 6) return;

    submitLock.current = true;
    setIsSubmitting(true);
    setError(null);

    // 🌟 關鍵：手動增加 300ms 延遲，確保後端之前的登入事務完全 Commit
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log("[MFA] 正在發送單次驗證請求...");

    try {
      const res = await fetch(`${apiUrl}/auth/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken, code: code.trim() }),
      });

      const text = await res.text();
      let jsonBody: any = null;
      try { jsonBody = text ? JSON.parse(text) : null; } catch (e) {}

      if (!res.ok) {
        submitLock.current = false;
        setIsSubmitting(false);

        if (res.status === 409) {
          setError("系統狀態衝突，請嘗試重新輸入或重新整理頁面。");
        } else if (res.status === 400) {
          setError("驗證碼錯誤，請重新確認。");
        } else {
          setError(jsonBody?.message || "驗證失敗");
        }
        return;
      }

      // 驗證成功處理
      console.log("[MFA] 驗證成功，正在同步權限並導向...");
      
      if (jsonBody?.data) {
        // 同步寫入權限與 Token 到 localStorage
        applyLoginSuccessFromContainer(jsonBody.data, username ?? undefined, true);
      }

      if (typeof sessionStorage !== "undefined") {
        sessionStorage.removeItem("mfa_pending_token");
        sessionStorage.removeItem("mfa_username");
      }

      // 🌟 修正權限延遲的終極方案：使用瀏覽器強導向
      // 這會強迫整個 React App 重新載入，確保 AuthProvider 讀取到最新的超級使用者權限
      setTimeout(() => {
        // 發送登入事件供背景組件監聽
        window.dispatchEvent(new CustomEvent("auth:login"));
        
        const basePath = import.meta.env.BASE_URL || "/";
        window.location.replace(window.location.origin + basePath);
      }, 300);

    } catch (err) {
      submitLock.current = false;
      setIsSubmitting(false);
      setError("連線失敗，請檢查網路");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (code.length === 6 && isReady.current && !isSubmitting) {
        performVerify();
      }
    }
  };

  const accentColor = isDark ? "#4CAF50" : "#388E3C";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Card elevation={isDark ? 8 : 4} sx={{ width: "100%", maxWidth: 420, borderRadius: 4, bgcolor: isDark ? alpha("#1e1e1e", 0.95) : alpha("#ffffff", 0.98) }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: alpha(accentColor, 0.15), display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 2 }}>
              <LockOutlinedIcon sx={{ fontSize: 28, color: accentColor }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{TITLE}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {username ? `${SUBTITLE}（${username}）` : SUBTITLE}
            </Typography>
          </Box>

          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}

          <Box onKeyDown={handleKeyDown}>
            <TextField
              fullWidth
              label="6 碼驗證碼"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              disabled={isSubmitting || !pendingToken}
              autoFocus
              inputProps={{ inputMode: "numeric" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <Button
              onClick={performVerify}
              fullWidth variant="contained" size="large"
              disabled={isSubmitting || !pendingToken || code.length !== 6}
              sx={{ py: 1.5, fontWeight: 700, bgcolor: accentColor }}
            >
              {isSubmitting ? "驗證中..." : "確認驗證碼"}
            </Button>
            <Button onClick={handleBackToLogin} fullWidth sx={{ mt: 2 }} disabled={isSubmitting}>
              返回登入
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
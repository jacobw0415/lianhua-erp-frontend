import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Avatar,
  useTheme,
  Alert,
  Skeleton,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import LockResetIcon from "@mui/icons-material/LockReset";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useDataProvider, useGetIdentity } from "react-admin";
import { authProvider } from "@/providers/authProvider";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  getProfileCache,
  setProfileCache,
  clearProfileCache,
  type ProfileCacheRecord,
} from "@/utils/profileCache";
import {
  CONTENT_BOX_SX,
  FORM_CONTAINER_SX,
  FORM_MAX_WIDTH,
  DETAIL_CARD_MAX_WIDTH,
  DETAIL_SIDEBAR_WIDTH,
  DETAIL_MAIN_MAX_WIDTH,
  DETAIL_LAYOUT_MAX_WIDTH,
} from "@/constants/layoutConstants";
import { getApiUrl } from "@/config/apiUrl";
import { QRCodeSVG } from "qrcode.react";
import { getRoleDisplayName } from "@/constants/userRoles";
import { DisableMfaVerifyDialog } from "@/components/common/DisableMfaVerifyDialog";

/** 個人資料 API 回傳型別（含職稱；不含部門） */
type UserRecord = ProfileCacheRecord;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PROFILE_FIELD_IDS = {
  username: "profile-username",
  fullName: "profile-fullName",
  email: "profile-email",
  jobTitle: "profile-jobTitle",
} as const;

const PROFILE_HELPER_IDS = {
  username: "profile-username-helper",
  fullName: "profile-fullName-helper",
  email: "profile-email-helper",
} as const;

const SECTION_IDS = {
  basic: "profile-section-basic",
  security: "profile-section-security",
} as const;

function formatDisplayDate(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("zh-TW");
  } catch {
    return iso ?? "—";
  }
}

/** 載入中：平板/手機單欄骨架；桌面版為左右分欄骨架 */
const ProfileSkeleton: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", lg: "row" },
      gap: 2,
      width: "100%",
      maxWidth: { xs: DETAIL_CARD_MAX_WIDTH, lg: "none" },
    }}
  >
    {/* 左側：身份摘要（桌面） */}
    <Card
      elevation={0}
      sx={{
        display: { xs: "none", lg: "block" },
        width: DETAIL_SIDEBAR_WIDTH,
        flexShrink: 0,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ py: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Skeleton variant="circular" width={96} height={96} sx={{ mb: 2 }} />
        <Skeleton variant="text" width={180} height={28} />
        <Skeleton variant="text" width={220} height={22} sx={{ mt: 1 }} />
        <Skeleton variant="rounded" width={120} height={36} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
    {/* 右側 / 單卡（手機平板） */}
    <Card
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 0,
        maxWidth: { lg: DETAIL_MAIN_MAX_WIDTH },
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={FORM_CONTAINER_SX}>
        <Box sx={{ display: { xs: "flex", lg: "none" }, flexDirection: "column", alignItems: "center", py: 3, mb: 2 }}>
          <Skeleton variant="circular" width={80} height={80} sx={{ mb: 1.5 }} />
          <Skeleton variant="text" width={160} height={32} />
          <Skeleton variant="text" width={200} height={24} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton variant="text" width="28%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={40} sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" height={40} sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" height={40} sx={{ mb: 1.5 }} />
        <Skeleton variant="rounded" height={40} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Skeleton variant="rounded" width={64} height={36} />
          <Skeleton variant="rounded" width={64} height={36} />
        </Box>
        <Divider sx={{ my: 3 }} />
        <Skeleton variant="text" width="32%" height={24} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="85%" sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width={120} height={40} />
      </CardContent>
    </Card>
  </Box>
);

const apiUrl = getApiUrl();

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  useGetIdentity(); // 保持 auth 上下文；個人資料每次進入頁面由 useEffect 呼叫 fetchProfile 取得最新資料
  const dataProvider = useDataProvider();
  const { showAlert } = useGlobalAlert();

  const [record, setRecord] = useState<UserRecord | null>(() => getProfileCache());
  const [fullName, setFullName] = useState(() => getProfileCache()?.fullName ?? "");
  const [email, setEmail] = useState(() => getProfileCache()?.email ?? "");
  const [jobTitle, setJobTitle] = useState(
    () => getProfileCache()?.jobTitle ?? getProfileCache()?.position ?? ""
  );
  const [loading, setLoading] = useState(() => !getProfileCache());
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  const [mfaSetupSecret, setMfaSetupSecret] = useState<string | null>(null);
  const [mfaSetupQrUrl, setMfaSetupQrUrl] = useState<string | null>(null);
  const [mfaSetupCode, setMfaSetupCode] = useState("");
  const [disableMfaDialogOpen, setDisableMfaDialogOpen] = useState(false);
  const [disableMfaVerifyError, setDisableMfaVerifyError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const fetchProfile = useCallback(() => {
    setLoadError(false);
    if (!getProfileCache()) setLoading(true);
    dataProvider
      .get("users/me")
      .then((response: { data: UserRecord }) => {
        const user = response.data;
        // 若後端 GET users/me 未回傳 mfaEnabled，用登入時寫入的提示補上（例如剛以 MFA 驗證登入）
        const mfaHint =
          typeof localStorage !== "undefined" && localStorage.getItem("mfaEnabled") === "true";
        const userWithMfa = {
          ...user,
          mfaEnabled: (user as { mfaEnabled?: boolean }).mfaEnabled ?? mfaHint,
        } as UserRecord;
        setProfileCache(userWithMfa);
        setRecord(userWithMfa);
        setFullName(user.fullName ?? "");
        setEmail(user.email ?? "");
        setJobTitle((user as any).jobTitle ?? (user as any).position ?? "");
        // 若後端回傳 id 且登入時未帶入，補存供「編輯自己」等判斷使用（對齊後端報告書 §4.3）
        const userId = (user as { id?: unknown }).id;
        if (userId != null && typeof localStorage !== "undefined" && !localStorage.getItem("userId")) {
          localStorage.setItem("userId", String(userId));
        }
      })
      .catch((error: unknown) => {
        clearProfileCache();
        setRecord(null);
        const status = (error as { status?: number })?.status;
        if (status === 401) {
          void authProvider.checkError(error);
          return;
        }
        setLoadError(true);
        showAlert({
          message: "載入個人資料失敗，請稍後再試。",
          severity: "error",
          hideCancel: true,
        });
      })
      .finally(() => setLoading(false));
  }, [dataProvider, showAlert]);

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  // 每次進入個人資料頁都重新請求 GET /api/users/me，不依賴登入時快取；
  // 這樣在啟用 MFA 後再進此頁即可取得 mfaEnabled: true 並顯示「已啟用」，無需重新登入。
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isDirty = useMemo(() => {
    if (!record) return false;
    const currentJob = (record as any).jobTitle ?? (record as any).position ?? "";
    return (
      (record.fullName ?? "") !== fullName ||
      (record.email ?? "") !== email ||
      currentJob !== jobTitle
    );
  }, [record, fullName, email, jobTitle]);

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const validate = (): boolean => {
    let ok = true;
    if (!fullName.trim()) {
      setFullNameError("請輸入姓名");
      ok = false;
    } else {
      setFullNameError("");
    }
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      setEmailError("請輸入有效的 Email 格式");
      ok = false;
    } else {
      setEmailError("");
    }
    return ok;
  };

  const handleSave = async () => {
    if (!record) return;
    if (!validate()) return;
    setSaving(true);
    try {
      await dataProvider.update("users", {
        id: record.id,
        data: {
          ...record,
          fullName: fullName.trim(),
          email: email.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
        },
        previousData: record,
      });
      showAlert({
        message: "個人資料已更新。",
        severity: "success",
        hideCancel: true,
      });
      setSaveSuccessVisible(true);
      window.setTimeout(() => setSaveSuccessVisible(false), 3000);
      fetchProfile();
    } catch {
      showAlert({
        message: "更新個人資料失敗，請稍後再試。",
        severity: "error",
        hideCancel: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!record) return;
    if (isDirty && !window.confirm("您有未儲存的變更，確定要還原嗎？")) return;
    setFullName(record.fullName ?? "");
    setEmail(record.email ?? "");
    setJobTitle((record as any).jobTitle ?? (record as any).position ?? "");
    setFullNameError("");
    setEmailError("");
  };

  const handleStartMfaSetup = async () => {
    if (!record) return;
    setMfaError(null);
    setMfaSuccess(null);
    setMfaLoading(true);
    setMfaSetupSecret(null);
    setMfaSetupQrUrl(null);
    setMfaSetupCode("");
    try {
      const headers = new Headers({ "Content-Type": "application/json" });
      const token =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("token")
          : null;
      const tokenType =
        (typeof localStorage !== "undefined" &&
          localStorage.getItem("tokenType")) ||
        "Bearer";
      if (token) {
        headers.set("Authorization", `${tokenType} ${token}`);
      }

      const res = await fetch(`${apiUrl}/auth/mfa/setup`, {
        method: "POST",
        headers,
      });

      const text = await res.text();
      let message = "";
      let data: { secret?: string; qrCodeUrl?: string } = {};
      if (text) {
        try {
          const json = JSON.parse(text) as {
            status?: number;
            message?: string;
            data?: { secret?: string; qrCodeUrl?: string };
          };
          if (json.message) message = json.message ?? "";
          if (json.data) data = json.data;
        } catch {
          // ignore JSON parse error
        }
      }

      if (!res.ok) {
        if (res.status === 400) {
          setMfaError("操作過於頻繁，請稍後再試。");
          return;
        }
        if (res.status >= 500) {
          setMfaError("系統發生錯誤，請稍後再試或聯絡系統管理員");
          return;
        }
        setMfaError(message || "啟用 MFA 失敗，請稍後再試。");
        return;
      }

      const secret = data.secret ?? "";
      const qr = data.qrCodeUrl ?? "";
      if (!secret && !qr) {
        setMfaError("無法取得 MFA 設定資訊，請稍後再試或聯絡系統管理員。");
        return;
      }
      setMfaSetupSecret(secret || null);
      setMfaSetupQrUrl(qr || null);
      setMfaSuccess("請使用驗證器掃描 QR Code 或輸入密鑰，並在下方輸入 6 碼驗證碼以完成啟用。");
    } catch {
      setMfaError("啟用 MFA 失敗，請稍後再試。");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleConfirmMfaSetup = async () => {
    if (!record) return;
    const trimmed = mfaSetupCode.trim();
    if (!trimmed || trimmed.length !== 6) {
      setMfaError("請輸入 6 碼驗證碼。");
      return;
    }
    setMfaError(null);
    setMfaSuccess(null);
    setMfaLoading(true);
    try {
      const headers = new Headers({ "Content-Type": "application/json" });
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      const tokenType = (typeof localStorage !== "undefined" && localStorage.getItem("tokenType")) || "Bearer";
      if (token) {
        headers.set("Authorization", `${tokenType} ${token}`);
      }

      const res = await fetch(`${apiUrl}/auth/mfa/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({ code: trimmed }),
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

      if (!res.ok) {
        if (res.status === 401) {
          void authProvider.checkError({ message: "Unauthorized", status: 401 } as unknown as Error);
          return;
        }
        if (res.status === 400) {
          setMfaError("驗證碼錯誤或已過期，請確認驗證器時間與輸入內容後再試一次。");
          return;
        }
        if (res.status >= 500) {
          setMfaError("系統發生錯誤，請稍後再試或聯絡系統管理員");
          return;
        }
        setMfaError(
          message || "啟用 MFA 失敗，請稍後再試。"
        );
        return;
      }

      const updated = {
        ...(record as any),
        mfaEnabled: true,
      } as UserRecord & { mfaEnabled?: boolean };
      setRecord(updated);
      setProfileCache(updated);
      setMfaSetupCode("");
      // 驗證成功後立即收合 QR code／密鑰區，不再暴露；畫面會顯示「已啟用」且按鈕改為「關閉 MFA」
      setMfaSetupSecret(null);
      setMfaSetupQrUrl(null);
      // 與其他頁面一致：以彈跳視窗顯示成功訊息，打勾 icon 強化主視覺，按確認後關閉並停留在個人資料頁
      showAlert({
        title: "MFA 已啟用",
        message: "下次登入時將需要輸入 6 碼驗證碼。",
        severity: "success",
        hideCancel: true,
        confirmLabel: "確定",
        showCheckIcon: true,
      });
    } catch {
      setMfaError("啟用 MFA 失敗，請稍後再試。");
    } finally {
      setMfaLoading(false);
    }
  };

  /** 關閉 MFA：需帶 6 碼驗證碼，後端驗證通過後才關閉 */
  const handleDisableMfa = async (verifyCode: string) => {
    if (!record) return;
    const trimmed = verifyCode.trim();
    if (!trimmed || trimmed.length !== 6) {
      setDisableMfaVerifyError("請輸入 6 碼驗證碼。");
      return;
    }
    setMfaError(null);
    setMfaSuccess(null);
    setDisableMfaVerifyError(null);
    setMfaLoading(true);
    try {
      const headers = new Headers({ "Content-Type": "application/json" });
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      const tokenType = (typeof localStorage !== "undefined" && localStorage.getItem("tokenType")) || "Bearer";
      if (token) {
        headers.set("Authorization", `${tokenType} ${token}`);
      }

      const res = await fetch(`${apiUrl}/auth/mfa/disable`, {
        method: "POST",
        headers,
        body: JSON.stringify({ code: trimmed }),
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

      if (!res.ok) {
        if (res.status === 401) {
          void authProvider.checkError({ message: "Unauthorized", status: 401 } as unknown as Error);
          return;
        }
        if (res.status === 400) {
          setDisableMfaVerifyError(
            message || "驗證碼錯誤，請再試一次。"
          );
          return;
        }
        if (res.status >= 500) {
          setDisableMfaVerifyError("系統發生錯誤，請稍後再試或聯絡系統管理員");
          return;
        }
        setDisableMfaVerifyError(
          message || "關閉 MFA 失敗，請稍後再試或聯絡系統管理員。"
        );
        return;
      }

      setDisableMfaDialogOpen(false);
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("mfaEnabled");
      }
      setMfaSetupSecret(null);
      setMfaSetupQrUrl(null);
      setMfaSetupCode("");
      // 成功後呼叫 GET /api/users/me 取得更新後的個人資料（含 mfaEnabled: false），以更新畫面狀態
      fetchProfile();
      // 與啟用 MFA 一致：以彈跳視窗顯示成功訊息，打勾 icon 強化主視覺，按確認後關閉並停留在個人資料頁
      showAlert({
        title: "MFA 已關閉",
        message: "之後登入將不再需要輸入 6 碼驗證碼。",
        severity: "success",
        hideCancel: true,
        confirmLabel: "確定",
        showCheckIcon: true,
      });
    } catch {
      setDisableMfaVerifyError("關閉 MFA 失敗，請稍後再試或聯絡系統管理員。");
    } finally {
      setMfaLoading(false);
    }
  };

  /** 點擊「關閉 MFA」時開啟驗證彈窗，輸入 6 碼後送出 */
  const handleDisableMfaClick = () => {
    if (!record) return;
    setDisableMfaVerifyError(null);
    setDisableMfaDialogOpen(true);
  };

  const rolesDisplay = (() => {
    const raw = record?.roles;
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((r: string) => getRoleDisplayName(String(r))).join("、");
    }
    if (typeof (record as any)?.roles === "string") {
      return getRoleDisplayName((record as any).roles);
    }
    return "—";
  })();

  const displayName = fullName?.trim() || record?.username || "";
  const subtitle = record?.email?.trim() || rolesDisplay;

  if (loading) {
    return (
      <Box component="main" sx={{ ...CONTENT_BOX_SX, minHeight: 320 }} aria-label="個人資料頁面">
        <ProfileSkeleton />
      </Box>
    );
  }

  if (loadError || !record) {
    return (
      <Box component="main" sx={{ ...CONTENT_BOX_SX, minHeight: 320 }} aria-label="個人資料頁面">
        <Card sx={{ maxWidth: FORM_MAX_WIDTH, mx: "auto" }}>
          <CardContent sx={FORM_CONTAINER_SX}>
            <Alert
              severity="error"
              icon={<ErrorOutlineIcon />}
              sx={{ mb: 2 }}
              aria-live="assertive"
            >
              無法載入個人資料，請檢查網路連線後重試。
            </Alert>
            <Button variant="contained" onClick={fetchProfile} aria-label="重試載入個人資料">
              重試
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ ...CONTENT_BOX_SX }} aria-label="個人資料頁面">
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          alignItems: "stretch",
          maxWidth: { xs: DETAIL_CARD_MAX_WIDTH, lg: DETAIL_LAYOUT_MAX_WIDTH },
          marginLeft: { lg: "auto" },
          marginRight: { lg: "auto" },
        }}
      >
        {/* 桌面版：左側欄（視覺降階：無陰影 + 邊框） */}
        <Card
          elevation={0}
          sx={{
            display: { xs: "none", lg: "flex" },
            width: DETAIL_SIDEBAR_WIDTH,
            flexShrink: 0,
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              py: 3,
              px: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: theme.palette.primary.main,
                fontSize: "2.25rem",
                mb: 2,
              }}
              aria-hidden
            >
              {((displayName || record?.username) ?? "").charAt(0).toUpperCase() || "?"}
            </Avatar>
            <Typography variant="subtitle1" component="p" fontWeight={600}>
              {displayName || (record?.username ?? "")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
            <Button
              component={RouterLink}
              to="/change-password"
              variant="text"
              startIcon={<LockResetIcon />}
              sx={{ mt: 2, textTransform: "none" }}
              aria-label="前往修改密碼頁面"
            >
              密碼
            </Button>
          </Box>
        </Card>

        {/* 右側主內容：桌面 maxWidth 720，卡片輕陰影或邊框 */}
        <Card
          elevation={0}
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            maxWidth: { lg: DETAIL_MAIN_MAX_WIDTH },
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* 平板與手機：頂部頭像區 */}
          <Box
            sx={{
              display: { xs: "flex", lg: "none" },
              py: 3,
              px: { xs: 2, sm: 3 },
              flexDirection: "column",
              alignItems: "center",
              bgcolor: "action.hover",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                fontSize: "2rem",
                mb: 1.5,
              }}
              aria-hidden
            >
              {((displayName || record?.username) ?? "").charAt(0).toUpperCase() || "?"}
            </Avatar>
            <Typography variant="h6" component="p" fontWeight={600}>
              {displayName || (record?.username ?? "")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>

          <CardContent sx={{ ...FORM_CONTAINER_SX }}>
            {saveSuccessVisible && (
              <Alert severity="success" sx={{ mb: 2 }} role="status" aria-live="polite">
                已儲存
              </Alert>
            )}
            {(fullNameError || emailError) && (
              <Alert severity="error" sx={{ mb: 2 }} role="alert">
                請修正上述欄位後再儲存。
              </Alert>
            )}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
              noValidate
            >
            <Box component="section" aria-labelledby={SECTION_IDS.basic}>
            <Typography
              id={SECTION_IDS.basic}
              variant="subtitle1"
              fontWeight={600}
              color="text.primary"
              sx={{ mb: 1 }}
            >
              基本資料
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                gap: 2,
                alignItems: "start",
              }}
            >
              {/* 帳號：唯讀以 label+value 呈現 */}
              <Box sx={{ gridColumn: { xs: "1", lg: "1" } }}>
                <Typography variant="caption" color="text.secondary" component="label" htmlFor={PROFILE_FIELD_IDS.username}>
                  帳號
                </Typography>
                <Typography id={PROFILE_FIELD_IDS.username} variant="body1" sx={{ mt: 0.5 }}>
                  {record.username}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                  此欄位不可修改
                </Typography>
              </Box>
              <TextField
                id={PROFILE_FIELD_IDS.fullName}
                fullWidth
                label="姓名"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fullNameError) setFullNameError("");
                }}
                margin="normal"
                size="small"
                error={!!fullNameError}
                helperText={fullNameError}
                FormHelperTextProps={{ id: PROFILE_HELPER_IDS.fullName }}
                inputProps={{
                  "aria-required": true,
                  "aria-invalid": !!fullNameError,
                  "aria-describedby": fullNameError
                    ? PROFILE_HELPER_IDS.fullName
                    : undefined,
                }}
                required
              />
              <TextField
                id={PROFILE_FIELD_IDS.email}
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                margin="normal"
                size="small"
                error={!!emailError}
                helperText={emailError}
                FormHelperTextProps={{ id: PROFILE_HELPER_IDS.email }}
                inputProps={{
                  "aria-invalid": !!emailError,
                  "aria-describedby": emailError ? PROFILE_HELPER_IDS.email : undefined,
                }}
              />
              <TextField
                id={PROFILE_FIELD_IDS.jobTitle}
                fullWidth
                label="職稱"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                margin="normal"
                size="small"
                placeholder="選填"
              />
            </Box>
          <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="outlined"
              onClick={handleReset}
              disabled={saving || !isDirty}
              aria-label="取消並還原表單"
              sx={{ minHeight: 44 }}
            >
              取消
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !isDirty}
              aria-label="儲存個人資料"
              sx={{ minHeight: 44 }}
            >
              {saving ? "儲存中…" : "儲存"}
            </Button>
          </Box>
            </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="section" aria-labelledby={SECTION_IDS.security}>
          {/* 區塊二：帳號與安全 */}
          <Typography
            id={SECTION_IDS.security}
            variant="subtitle1"
            fontWeight={600}
            color="text.primary"
            sx={{ mb: 1 }}
          >
            帳號與安全
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              "& .profile-row": {
                display: "grid",
                gridTemplateColumns: "100px 1fr",
                gap: 2,
                alignItems: "center",
                py: 1,
                px: 1,
                borderRadius: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-of-type": { borderBottom: "none" },
                "&:hover": { bgcolor: "action.hover" },
              },
              "& .profile-label": { color: "text.secondary", typography: "body2" },
              "& .profile-value": { typography: "body2" },
            }}
          >
            <Box className="profile-row">
              <Typography className="profile-label" component="span">
                角色
              </Typography>
              <Typography className="profile-value" component="span">
                {rolesDisplay}
              </Typography>
            </Box>
            <Box className="profile-row">
              <Typography className="profile-label" component="span">
                最後登入
              </Typography>
              <Typography className="profile-value" component="span">
                {formatDisplayDate((record as any).lastLoginAt)}
              </Typography>
            </Box>
            <Box className="profile-row">
              <Typography className="profile-label" component="span">
                建立時間
              </Typography>
              <Typography className="profile-value" component="span">
                {formatDisplayDate(record.createdAt)}
              </Typography>
            </Box>
            <Box className="profile-row">
              <Typography className="profile-label" component="span">
                MFA
              </Typography>
              <Box className="profile-value" component="span">
                <Typography variant="body2" component="span">
                  {(record as any).mfaEnabled ? "已啟用" : "未啟用"}
                </Typography>
              </Box>
            </Box>
          </Box>
          {mfaError && (
            <Alert severity="error" sx={{ mt: 2 }} aria-live="assertive">
              {mfaError}
            </Alert>
          )}
          {mfaSuccess && (
            <Alert severity="success" sx={{ mt: 2 }} aria-live="polite">
              {mfaSuccess}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {!(record as any).mfaEnabled && (
                <Button
                  variant="outlined"
                  disabled={mfaLoading}
                  onClick={handleStartMfaSetup}
                  sx={{ minHeight: 40 }}
                >
                  啟用 MFA
                </Button>
              )}
              {(record as any).mfaEnabled && (
                <Button
                  variant="outlined"
                  color="error"
                  disabled={mfaLoading}
                  onClick={handleDisableMfaClick}
                  sx={{ minHeight: 40 }}
                >
                  關閉 MFA
                </Button>
              )}
            </Box>
            {(mfaSetupSecret || mfaSetupQrUrl) && (
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="body2" sx={{ mb: 1 }}>
                  使用驗證器 App 掃描下方 QR Code，或輸入密鑰後，在下方輸入產生的 6 碼驗證碼以完成啟用。
                </Typography>
                {mfaSetupQrUrl && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 180,
                        height: 180,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 1,
                      }}
                    >
                      <QRCodeSVG value={mfaSetupQrUrl} size={150} />
                    </Box>
                  </Box>
                )}
                {mfaSetupSecret && (
                  <Typography
                    variant="body2"
                    sx={{ wordBreak: "break-all", mb: 1 }}
                  >
                    密鑰：{mfaSetupSecret}
                  </Typography>
                )}
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                  }}
                >
                  <TextField
                    label="6 碼驗證碼"
                    size="small"
                    value={mfaSetupCode}
                    onChange={(e) =>
                      setMfaSetupCode(
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 6)
                      )
                    }
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    sx={{ width: 180 }}
                    disabled={mfaLoading}
                  />
                  <Button
                    variant="contained"
                    onClick={handleConfirmMfaSetup}
                    disabled={mfaLoading}
                    sx={{ minHeight: 40 }}
                  >
                    確認啟用
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          <Button
            component={RouterLink}
            to="/change-password"
            variant="text"
            startIcon={<LockResetIcon />}
            sx={{ mt: 2, minHeight: 44, textTransform: "none" }}
            aria-label="前往修改密碼頁面"
          >
            修改密碼
          </Button>

          <DisableMfaVerifyDialog
            open={disableMfaDialogOpen}
            onClose={() => {
              setDisableMfaDialogOpen(false);
              setDisableMfaVerifyError(null);
            }}
            onConfirm={(code) => {
              void handleDisableMfa(code);
            }}
            error={disableMfaVerifyError}
            loading={mfaLoading}
          />
            </Box>
            </Box>
        </CardContent>
      </Card>
        </Box>
    </Box>
  );
};

ProfilePage.displayName = "ProfilePage";

export default ProfilePage;

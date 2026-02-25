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
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { CONTENT_BOX_SX, FORM_CONTAINER_SX, FORM_MAX_WIDTH } from "@/constants/layoutConstants";

/** 個人資料 API 回傳型別（含職稱；不含部門） */
interface UserRecord {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  jobTitle?: string;
  position?: string;
  roles?: string[];
  lastLoginAt?: string;
  createdAt?: string;
}

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

/** 單一卡片最大寬度（平板/手機直立式） */
const PROFILE_CARD_MAX_WIDTH = 640;

/** 桌面版左側欄寬度（Google 帳戶風格） */
const SIDEBAR_WIDTH = 280;

/** 桌面版右側主內容最大寬度（業界常見 720–800px） */
const MAIN_CONTENT_MAX_WIDTH = 720;

/** 桌面版整體左右欄總寬上限（左欄 + gap + 右欄），用於大螢幕置中 */
const PROFILE_LAYOUT_MAX_WIDTH = 1020;

/**
 * 快取上次成功載入的個人資料，避免主題切換（深/亮）時因元件 remount
 * 短暫顯示骨架畫面造成閃爍。
 */
let profileCache: UserRecord | null = null;

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
      maxWidth: { xs: PROFILE_CARD_MAX_WIDTH, lg: "none" },
    }}
  >
    {/* 左側：身份摘要（桌面） */}
    <Card
      elevation={0}
      sx={{
        display: { xs: "none", lg: "block" },
        width: SIDEBAR_WIDTH,
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
        maxWidth: { lg: MAIN_CONTENT_MAX_WIDTH },
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

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { data: identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const { showAlert } = useGlobalAlert();

  const [record, setRecord] = useState<UserRecord | null>(() => profileCache);
  const [fullName, setFullName] = useState(() => profileCache?.fullName ?? "");
  const [email, setEmail] = useState(() => profileCache?.email ?? "");
  const [jobTitle, setJobTitle] = useState(
    () => (profileCache as any)?.jobTitle ?? (profileCache as any)?.position ?? ""
  );
  const [loading, setLoading] = useState(() => !profileCache);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);
  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const fetchProfile = useCallback(() => {
    setLoadError(false);
    if (!profileCache) setLoading(true);
    dataProvider
      .get("users/me")
      .then((response: { data: UserRecord }) => {
        const user = response.data;
        profileCache = user;
        setRecord(user);
        setFullName(user.fullName ?? "");
        setEmail(user.email ?? "");
        setJobTitle((user as any).jobTitle ?? (user as any).position ?? "");
      })
      .catch(() => {
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

  useEffect(() => {
    fetchProfile();
  }, [identity, fetchProfile]);

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

  const rolesDisplay = Array.isArray(record?.roles)
    ? record!.roles.join("、")
    : typeof (record as any)?.roles === "string"
      ? (record as any).roles
      : "—";

  const displayName = fullName?.trim() || record?.username || "";
  const subtitle = record?.email?.trim() || rolesDisplay;

  if (loading) {
    return (
      <Box component="main" sx={{ ...CONTENT_BOX_SX, minHeight: 320 }} aria-label="個人資料頁面">
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          個人資料
        </Typography>
        <ProfileSkeleton />
      </Box>
    );
  }

  if (loadError || !record) {
    return (
      <Box component="main" sx={{ ...CONTENT_BOX_SX, minHeight: 320 }} aria-label="個人資料頁面">
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          個人資料
        </Typography>
        <Card sx={{ maxWidth: FORM_MAX_WIDTH }}>
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
      <Typography variant="h5" component="h1" sx={{ mb: 0.5 }} id="profile-page-title">
        個人資料
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        管理您的帳號與基本資料
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: 2,
          alignItems: "stretch",
          maxWidth: { xs: PROFILE_CARD_MAX_WIDTH, lg: PROFILE_LAYOUT_MAX_WIDTH },
          marginLeft: { lg: "auto" },
          marginRight: { lg: "auto" },
        }}
      >
        {/* 桌面版：左側欄（視覺降階：無陰影 + 邊框） */}
        <Card
          elevation={0}
          sx={{
            display: { xs: "none", lg: "flex" },
            width: SIDEBAR_WIDTH,
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
            maxWidth: { lg: MAIN_CONTENT_MAX_WIDTH },
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

import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useDataProvider, useGetIdentity } from "react-admin";
import type { RaRecord } from "react-admin";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";

interface UserRecord extends RaRecord {
  username: string;
  fullName?: string;
  email?: string;
}

const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const { data: identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const { showAlert } = useGlobalAlert();

  const [record, setRecord] = useState<UserRecord | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 套用全域 scrollbar 樣式
  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  useEffect(() => {
    setLoading(true);
    dataProvider
      .get("users/me")
      .then((response: { data: UserRecord }) => {
        const user = response.data;
        setRecord(user);
        setFullName(user.fullName ?? "");
        setEmail(user.email ?? "");
      })
      .catch(() => {
        showAlert({
          message: "載入個人資料失敗，請稍後再試。",
          severity: "error",
          hideCancel: true,
        });
      })
      .finally(() => setLoading(false));
  }, [identity, dataProvider, showAlert]);

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    try {
      await dataProvider.update("users", {
        id: record.id,
        data: { ...record, fullName, email },
        previousData: record,
      });
      showAlert({
        message: "個人資料已更新。",
        severity: "success",
        hideCancel: true,
      });
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>載入中...</Typography>
      </Box>
    );
  }

  if (!record) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>找不到個人資料。</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 4,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          個人資料
        </Typography>

        <TextField
          fullWidth
          label="帳號"
          value={record.username}
          margin="normal"
          InputProps={{ readOnly: true }}
        />

        <TextField
          fullWidth
          label="姓名"
          value={fullName}
          margin="normal"
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "儲存中…" : "儲存"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

ProfilePage.displayName = "ProfilePage";

export default ProfilePage;


import React, { useEffect } from "react";
import { useTheme, Box, Typography, Divider } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import { TextInput, BooleanInput, RadioButtonGroupInput, useRedirect } from "react-admin";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { USER_ROLE_CHOICES } from "@/constants/userRoles";
import {
  createConfirmPasswordValidator,
  createPasswordValidators,
  emailValidators,
  usernameValidators,
} from "@/validators/userValidators";

interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  enabled: boolean;
  roleNames: string[];
}

interface UserFormValues {
  username: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  email?: string;
  enabled?: boolean;
  roleNames?: string[];
}

export const UserCreate: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="users"
      title="新增使用者"
      transform={(values: UserFormValues) => {
        const { confirmPassword, ...rest } = values || {};
        const payload: Partial<UserFormValues> = { ...rest };

        // 若沒填密碼，不要送空字串
        if (!payload.password) {
          delete payload.password;
        }

        // 角色：單選 → 轉成陣列，後端維持原本結構
        const roleNames = (payload as any).roleNames as unknown;
        if (typeof roleNames === "string" && roleNames) {
          (payload as any).roleNames = [roleNames];
        }

        return payload;
      }}
      onSuccess={(data) => {
        const user = data as User;
        showAlert({
          message: `使用者「${user.username}」新增成功！`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "users"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        👤 新增使用者帳號
      </Typography>

      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        {/* 上方：帳號資訊 + 個人資料，桌面並排、手機直向 */}
        <Box
          sx={{
            mb: 3,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            columnGap: 2.5,
            rowGap: 3,
          }}
        >
          {/* 區塊一：帳號資訊 */}
          <Box component="section">
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              帳號資訊
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box
              mb={2}
              sx={{
                minHeight: 96,
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <TextInput
                source="username"
                label="帳號 *"
                fullWidth
                helperText="4–20 碼英數字，可包含 . - _，建立後建議避免隨意變更。"
                FormHelperTextProps={{ sx: { minHeight: 24 } }}
                validate={usernameValidators}
              />
            </Box>

            <FormFieldRow sx={{ mb: 0 }}>
              <TextInput
                source="password"
                type="password"
                label="登入密碼 *"
                fullWidth
                helperText="至少 8 碼，需含英數字。"
                FormHelperTextProps={{ sx: { minHeight: 24 } }}
                validate={createPasswordValidators}
              />
              <TextInput
                source="confirmPassword"
                type="password"
                label="確認密碼 *"
                fullWidth
                helperText="再次輸入以確認。"
                FormHelperTextProps={{ sx: { minHeight: 24 } }}
                validate={[createConfirmPasswordValidator]}
              />
            </FormFieldRow>
          </Box>

          {/* 區塊二：個人資料 */}
          <Box component="section">
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              個人資料
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box
              mb={2}
              sx={{
                minHeight: 96,
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <TextInput
                source="fullName"
                label="姓名"
                fullWidth
                helperText=" "
                FormHelperTextProps={{ sx: { minHeight: 24 } }}
              />
            </Box>

            <Box mb={0}>
              <TextInput
                source="email"
                label="Email"
                type="email"
                fullWidth
                helperText="將用於系統通知與重設密碼。"
                FormHelperTextProps={{ sx: { minHeight: 24 } }}
                validate={emailValidators}
              />
            </Box>
          </Box>
        </Box>

        {/* 區塊三：權限與狀態（放在最下方） */}
        <Box component="section">
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            權限與狀態
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormFieldRow sx={{ mb: 0 }}>
            <Box>
              <BooleanInput
                source="enabled"
                label="啟用"
                defaultValue={true}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                取消勾選時，此帳號將無法登入系統。
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <RadioButtonGroupInput
                source="roleNames"
                label="角色"
                helperText="請選擇此使用者在系統中的角色（單選）。"
                row
                choices={USER_ROLE_CHOICES}
                format={(value?: string[] | string) =>
                  Array.isArray(value) ? value[0] : value
                }
                parse={(value?: string) => value}
                validate={[(value?: string) =>
                  !value ? "請選擇一個角色" : undefined
                ]}
              />
            </Box>
          </FormFieldRow>
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

UserCreate.displayName = "UserCreate";

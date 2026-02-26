import React, { useEffect } from "react";
import { useTheme, Box, Typography, Divider } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  BooleanInput,
  RadioButtonGroupInput,
  useRecordContext,
  useRedirect,
} from "react-admin";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { USER_ROLE_CHOICES } from "@/constants/userRoles";
import {
  editNewPasswordValidators,
  emailValidators,
  usernameValidators,
} from "@/validators/userValidators";

interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  employeeId?: string;
  enabled: boolean;
  roleNames: string[];
}

export const UserEdit: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="users"
      title="編輯使用者"
      onSuccess={(data) => {
        const user = data as User;
        showAlert({
          title: "更新成功",
          message: `已成功更新「${user.username}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "users"));
      }}
      onDeleteSuccess={(record) => {
        const user = record as User;
        showAlert({
          title: "刪除成功",
          message: `已成功刪除「${user.username}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "users"));
      }}
    >
      <UserFormFields />
    </GenericEditPage>
  );
};

const UserFormFields: React.FC = () => {
  const record = useRecordContext<User>();

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 3 }}>
        👤 編輯使用者帳號
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
                helperText="4–20 碼英數字，可包含 . - _，帳號建立後建議避免變更。"
                FormHelperTextProps={{ sx: { minHeight: 24 } }}
                validate={usernameValidators}
                disabled
              />
            </Box>

            {/* 重設密碼（選填） */}
            <FormFieldRow sx={{ mb: 0 }}>
              <TextInput
                source="newPassword"
                type="password"
                label="新密碼"
                fullWidth
                helperText="至少 8 碼包含英文字與數字。"
                FormHelperTextProps={{ sx: { minHeight: 32 } }}
                validate={editNewPasswordValidators}
              />
              <TextInput
                source="confirmNewPassword"
                type="password"
                label="確認新密碼"
                fullWidth
                helperText="請再次輸入新密碼以確認。"
                FormHelperTextProps={{ sx: { minHeight: 32 } }}
                validate={[
                  (value, allValues) =>
                    value && allValues && value !== (allValues as any).newPassword
                      ? "兩次輸入的密碼不一致"
                      : undefined,
                ]}
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
                parse={(value?: string) => (value ? [value] : [])}
                validate={[(value?: string | string[]) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  return !v ? "請選擇一個角色" : undefined;
                }]}
              />
            </Box>
          </FormFieldRow>
        </Box>
      </Box>
    </>
  );
};

UserEdit.displayName = "UserEdit";


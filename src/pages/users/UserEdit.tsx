import React, { useEffect, useMemo, useState } from "react";
import { useTheme, Box, Typography, Divider, Alert, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  BooleanInput,
  RadioButtonGroupInput,
  useRecordContext,
  useRedirect,
  useGetIdentity,
  Toolbar,
  SaveButton,
} from "react-admin";
import { useFormContext } from "react-hook-form";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { getRoleChoicesForUserForm, getRoleDisplayName } from "@/constants/userRoles";
import { canManageAdmin } from "@/utils/authStorage";
import { useDataProvider } from "react-admin";
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
      toolbar={<UserEditToolbar />}
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

/** 使用者編輯頁 Toolbar：編輯自己時不顯示「刪除」按鈕（與後端「不可刪除自己」對齊） */
interface UserEditToolbarProps {
  onBack?: () => void;
  onDelete?: () => void;
}

const UserEditToolbar: React.FC<UserEditToolbarProps> = ({ onBack, onDelete }) => {
  const record = useRecordContext<User>();
  const { data: identity } = useGetIdentity();
  const dataProvider = useDataProvider();
  const { showAlert } = useGlobalAlert();
  const [openForceLogoutConfirm, setOpenForceLogoutConfirm] = useState(false);
  const isEditingSelf =
    identity?.id != null &&
    record?.id != null &&
    String(record.id) === String(identity.id);
  // 編輯頁的強制登出按鈕：僅超級使用者（admin:manage / ROLE_SUPER_ADMIN）可見
  const canForceLogout = !!record && !isEditingSelf && canManageAdmin();

  const handleForceLogoutConfirm = async () => {
    if (!record) return;
    setOpenForceLogoutConfirm(false);
    try {
      await dataProvider.update("users", {
        id: record.id,
        data: {},
        previousData: record,
        meta: { endpoint: "forceLogout" },
      });
      showAlert({
        title: "已強制登出",
        message:
          `「${record.username}」已被強制登出，若該使用者仍在使用系統，下一個操作會被要求重新登入。`,
        severity: "success",
        hideCancel: true,
      });
    } catch (error) {
      showAlert({
        title: "強制登出失敗",
        message: error instanceof Error ? error.message : "請稍後再試或聯絡系統管理員。",
        severity: "error",
        hideCancel: true,
      });
    }
  };

  return (
    <>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0.8rem 1.5rem",
          borderRadius: "0 0 12px 12px",
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          color="success"
          onClick={onBack}
        >
          返回
        </Button>
        <Box sx={{ display: "flex", gap: 2 }}>
          {canForceLogout && (
            <Button
              variant="outlined"
              color="warning"
              onClick={(e) => {
                e.currentTarget.blur();
                setOpenForceLogoutConfirm(true);
              }}
            >
              強制登出
            </Button>
          )}
          {!isEditingSelf && onDelete && (
            <Button
              variant="contained"
              color="error"
              onClick={(e) => {
                e.currentTarget.blur();
                onDelete();
              }}
            >
              刪除
            </Button>
          )}
          <SaveButton label="儲存" color="success" />
        </Box>
      </Toolbar>
      <GlobalAlertDialog
        open={openForceLogoutConfirm}
        title="確認強制登出"
        description={
          record
            ? `確定要強制登出「${record.username}」嗎？該使用者將在下一次操作時被要求重新登入。`
            : ""
        }
        severity="warning"
        confirmLabel="強制登出"
        cancelLabel="取消"
        onClose={() => setOpenForceLogoutConfirm(false)}
        onConfirm={handleForceLogoutConfirm}
      />
    </>
  );
};

const UserFormFields: React.FC = () => {
  const record = useRecordContext<User>();
  const { data: identity } = useGetIdentity();
  const { setValue } = useFormContext();

  /** 編輯他人時，僅超級管理員可看到/選擇管理員角色選項 */
  const roleChoices = useMemo(
    () => getRoleChoicesForUserForm(canManageAdmin()),
    []
  );

  /** 是否正在編輯自己（與後端「不可變更自己的角色/啟用」對齊） */
  const isEditingSelf =
    identity?.id != null &&
    record?.id != null &&
    String(record.id) === String(identity.id);

  // 編輯自己時，表單仍須帶出 roleNames / enabled 供送出，以唯讀顯示並同步進 form state
  useEffect(() => {
    if (!record || !isEditingSelf) return;
    setValue("roleNames", record.roleNames ?? []);
    setValue("enabled", record.enabled ?? true);
  }, [record, isEditingSelf, setValue]);

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
                inputProps={{ readOnly: true }}
                sx={{
                  "& .MuiInputBase-input": {
                    cursor: "not-allowed",
                    backgroundColor: "action.hover",
                  },
                }}
              />
            </Box>

            {/* 重設密碼（選填）；編輯自己時不顯示，改引導至「修改密碼」頁 */}
            {!isEditingSelf ? (
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
            ) : (
              <Alert severity="info" sx={{ mt: 1 }}>
                若要修改自己的密碼，請至修改密碼頁面輸入現有密碼做修改。
              </Alert>
            )}
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

        {/* 區塊三：權限與狀態（編輯自己時為唯讀） */}
        <Box component="section">
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            權限與狀態
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormFieldRow sx={{ mb: 0 }}>
            <Box>
              {isEditingSelf ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    啟用
                  </Typography>
                  <Typography variant="body2">
                    {record.enabled ? "啟用" : "停用"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    不可在此頁變更自己的啟用狀態。
                  </Typography>
                </>
              ) : (
                <>
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
                </>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              {isEditingSelf ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    角色
                  </Typography>
                  <Typography variant="body2">
                    {getRoleDisplayName(
                      Array.isArray(record.roleNames) ? record.roleNames[0] : String(record.roleNames ?? "")
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    不可在此頁變更自己的角色，請聯絡其他管理員。
                  </Typography>
                </>
              ) : (
                <RadioButtonGroupInput
                  source="roleNames"
                  label="角色"
                  helperText="請選擇此使用者在系統中的角色（單選）。"
                  row
                  choices={roleChoices}
                  defaultValue=""
                  format={(value?: string[] | string) =>
                    Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
                  }
                  parse={(value?: string) => (value ? [value] : [])}
                  validate={[(value?: string | string[]) => {
                    const v = Array.isArray(value) ? value[0] : value;
                    return !v ? "請選擇一個角色" : undefined;
                  }]}
                />
              )}
            </Box>
          </FormFieldRow>
        </Box>
      </Box>
    </>
  );
};

UserEdit.displayName = "UserEdit";


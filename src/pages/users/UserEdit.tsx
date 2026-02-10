import React, { useEffect } from "react";
import { useTheme, Box, Typography } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  BooleanInput,
  SelectArrayInput,
  useRecordContext,
  useRedirect,
  required,
} from "react-admin";

import { FormFieldRow } from "@/components/common/FormFieldRow";
import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

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
      width="700px"
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
      <Typography variant="h6" sx={{ mb: 2 }}>
        👤 使用者基本資料
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Box sx={{ mb: 2 }}>
          <TextInput
            source="username"
            label="帳號 *"
            fullWidth
            validate={[required()]}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextInput source="fullName" label="姓名" fullWidth />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextInput source="employeeId" label="員工工號" fullWidth />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextInput source="email" label="Email" type="email" fullWidth />
        </Box>

        {/* 重設密碼（選填） */}
        <FormFieldRow sx={{ mb: 2 }}>
          <TextInput
            source="newPassword"
            type="password"
            label="新密碼（選填）"
            fullWidth
          />
          <TextInput
            source="confirmNewPassword"
            type="password"
            label="確認新密碼"
            fullWidth
          />
        </FormFieldRow>

        <FormFieldRow sx={{ mb: 2 }}>
          <BooleanInput source="enabled" label="啟用" />
          <SelectArrayInput
            source="roleNames"
            label="角色（多選）"
            choices={[
              { id: "ROLE_ADMIN", name: "系統管理員" },
              { id: "ROLE_USER", name: "一般使用者" },
            ]}
          />
        </FormFieldRow>
      </Box>
    </>
  );
};

UserEdit.displayName = "UserEdit";


import React, { useEffect } from "react";
import { useTheme, Box, Typography } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  BooleanInput,
  SelectArrayInput,
  useRedirect,
  required,
} from "react-admin";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
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
      transform={(values: any) => {
        const { confirmPassword, roles, ...rest } = values || {};
        // 若沒填密碼，不要送空字串
        if (!rest.password) {
          delete rest.password;
        }
        // 後端使用 roleNames 字串陣列
        if (Array.isArray(roles)) {
          (rest as any).roleNames = roles;
        }
        return rest;
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
      <Typography variant="h6" sx={{ mb: 2 }}>
        👤 新增使用者帳號
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Box mb={2}>
          <TextInput
            source="username"
            label="帳號 *"
            fullWidth
            validate={[required()]}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
          }}
        >
          <TextInput
            source="password"
            type="password"
            label="登入密碼 *"
            fullWidth
            validate={[required()]}
          />
          <TextInput
            source="confirmPassword"
            type="password"
            label="確認密碼 *"
            fullWidth
          />
        </Box>

        <Box mb={2}>
          <TextInput
            source="fullName"
            label="姓名"
            fullWidth
          />
        </Box>

        <Box mb={2}>
          <TextInput
            source="employeeId"
            label="員工工號"
            fullWidth
          />
        </Box>

        <Box mb={2}>
          <TextInput
            source="email"
            label="Email"
            type="email"
            fullWidth
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2,
            alignItems: "flex-start",
          }}
        >
          <BooleanInput
            source="enabled"
            label="啟用"
            defaultValue={true}
          />

          <SelectArrayInput
            source="roleNames"
            label="角色（多選）"
            choices={[
              { id: "ROLE_ADMIN", name: "系統管理員" },
              { id: "ROLE_USER", name: "一般使用者" },
            ]}
          />
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

UserCreate.displayName = "UserCreate";


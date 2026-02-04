import React, { useEffect } from "react";
import { useTheme, Box, Typography } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  useRedirect,
  required,
} from "react-admin";

import { GenericCreatePage } from "@/components/common/GenericCreatePage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

interface Role {
  id: number;
  name: string;
  displayName?: string;
  description?: string;
}

export const RoleCreate: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericCreatePage
      resource="roles"
      title="新增角色"
      onSuccess={(data) => {
        const role = data as Role;
        showAlert({
          message: `角色「${role.name}」新增成功！`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "roles"));
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        🛡 新增角色
      </Typography>

      <Box sx={{ maxWidth: 600, width: "100%" }}>
        <Box mb={2}>
          <TextInput
            source="name"
            label="角色代碼 *"
            fullWidth
            validate={[required()]}
          />
        </Box>

        <Box mb={2}>
          <TextInput
            source="displayName"
            label="角色名稱"
            fullWidth
          />
        </Box>

        <Box mb={2}>
          <TextInput
            source="description"
            label="說明"
            fullWidth
            multiline
            minRows={2}
          />
        </Box>
      </Box>
    </GenericCreatePage>
  );
};

RoleCreate.displayName = "RoleCreate";


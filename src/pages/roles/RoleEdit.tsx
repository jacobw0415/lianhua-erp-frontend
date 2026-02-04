import React, { useEffect } from "react";
import { useTheme, Box, Typography, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { applyBodyScrollbarStyles } from "@/utils/scrollbarStyles";
import {
  TextInput,
  useRecordContext,
  useRedirect,
  required,
  useDataProvider,
} from "react-admin";

import { GenericEditPage } from "@/components/common/GenericEditPage";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

interface Role {
  id: number;
  name: string;
  displayName?: string;
  description?: string;
  permissions?: string[];
}

export const RoleEdit: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    const cleanup = applyBodyScrollbarStyles(theme);
    return cleanup;
  }, [theme]);

  const { showAlert } = useGlobalAlert();
  const redirect = useRedirect();

  return (
    <GenericEditPage
      resource="roles"
      title="編輯角色"
      width="700px"
      onSuccess={(data) => {
        const role = data as Role;
        showAlert({
          title: "更新成功",
          message: `已成功更新角色「${role.name}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "roles"));
      }}
      onDeleteSuccess={(record) => {
        const role = record as Role;
        showAlert({
          title: "刪除成功",
          message: `已成功刪除角色「${role.name}」`,
          severity: "success",
          hideCancel: true,
        });
        setTimeout(() => redirect("list", "roles"));
      }}
    >
      <RoleFormFields />
    </GenericEditPage>
  );
};

const RoleFormFields: React.FC = () => {
  const record = useRecordContext<Role>();
  const dataProvider = useDataProvider();

  const [permissions, setPermissions] = React.useState<string[]>(
    record?.permissions ?? [],
  );

  // 權限常數：可依後端實際定義調整
  const allPermissions = React.useMemo(
    () => [
      { id: "USER_READ", label: "使用者檢視" },
      { id: "USER_WRITE", label: "使用者維護" },
      { id: "ROLE_READ", label: "角色檢視" },
      { id: "ROLE_WRITE", label: "角色維護" },
    ],
    [],
  );

  if (!record) {
    return <Typography>載入中...</Typography>;
  }

  const togglePermission = (perm: string) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        🛡 角色資料
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

        <Box mb={2}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            權限矩陣
          </Typography>
          <FormGroup>
            {allPermissions.map((perm) => (
              <FormControlLabel
                key={perm.id}
                control={
                  <Checkbox
                    checked={permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                  />
                }
                label={perm.label}
              />
            ))}
          </FormGroup>
        </Box>
      </Box>
    </>
  );
};

RoleEdit.displayName = "RoleEdit";


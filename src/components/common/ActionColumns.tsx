import { Stack, Button } from "@mui/material";
import {
  useRecordContext,
  useDataProvider,
  useListContext,
  useRefresh,
  useGetIdentity,
  useLogout,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { clearProfileCache } from "@/utils/profileCache";
import { getStoredAuthRoles, hasStoredAuthority } from "@/utils/authStorage";
import {
  EDIT_PERMISSION_BY_RESOURCE,
  DELETE_PERMISSION_BY_RESOURCE,
} from "@/constants/permissionConfig";

/** --------------------------------------------------------
 *  🔐 安全錯誤訊息解析（無 any）
 * -------------------------------------------------------- */
const resolveErrorMessage = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof (error as { body?: unknown }).body === "object" &&
    (error as { body?: { message?: unknown } }).body?.message
  ) {
    return String((error as { body: { message: unknown } }).body.message);
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "不可刪除該筆資料，因為具有關聯紀錄。";
};

export const ActionColumns = () => {
  const record = useRecordContext<RaRecord>();
  const { resource } = useListContext();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const { data: identity } = useGetIdentity();
  const logout = useLogout();

  // 一律從 localStorage 讀取 authRoles（登入時寫入），避免 React Admin usePermissions 快取導致按鈕未依角色隱藏
  const storedRoles = getStoredAuthRoles();
  const hasRoleAdmin = (storedRoles ?? []).some((r) => r === "ROLE_ADMIN");
  const isUsersResource =
    resource === "users" || resource === "user" || resource == null;

  const canEdit = isUsersResource
    ? hasRoleAdmin
    : hasRoleAdmin ||
      (EDIT_PERMISSION_BY_RESOURCE[resource]
        ? hasStoredAuthority(
            storedRoles ?? [],
            EDIT_PERMISSION_BY_RESOURCE[resource]
          )
        : false);
  const canDelete = isUsersResource
    ? hasRoleAdmin
    : hasRoleAdmin ||
      (DELETE_PERMISSION_BY_RESOURCE[resource]
        ? hasStoredAuthority(
            storedRoles ?? [],
            DELETE_PERMISSION_BY_RESOURCE[resource]
          )
        : false);

  /** ⭐ fallback record（避免 TS any） */
  const safeRecord = (record ?? { id: "placeholder" }) as RaRecord;

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [buttonTarget, setButtonTarget] = useState<HTMLElement | null>(null);

  /** ⭐ 統一顯示名稱（避免 undefined）；使用者資源優先顯示帳號或姓名 */
  const displayName =
    (safeRecord as { username?: string }).username ||
    (safeRecord as { fullName?: string }).fullName ||
    (safeRecord as { purchaseNo?: string }).purchaseNo ||
    (safeRecord as { orderNo?: string }).orderNo ||
    (safeRecord as { name?: string }).name ||
    (safeRecord as { productName?: string }).productName ||
    (safeRecord as { title?: string }).title ||
    (safeRecord as { item?: string }).item ||
    `#${safeRecord.id}`;

  /** --------------------------------------------------------
   *  🗑 刪除邏輯
   * -------------------------------------------------------- */
  const handleDelete = async () => {
    try {
      await dataProvider.delete(resource, { id: safeRecord.id });

      const isCurrentUser =
        (resource === "users" || resource === "user") &&
        identity?.id != null &&
        String((safeRecord as { username?: string }).username ?? "") === String(identity.id);
      if (isCurrentUser) {
        clearProfileCache();
        setOpenSuccessDialog(false);
        await logout();
        return;
      }

      setOpenSuccessDialog(true);

      setTimeout(() => {
        setOpenSuccessDialog(false);
        refresh();
      }, 800);
    } catch (error: unknown) {
      setErrorMessage(resolveErrorMessage(error));
      setOpenErrorDialog(true);
    }
  };

  if (!record) return null;

  /** 角色與權限為系統預定義，僅供檢視，不提供編輯/刪除 */
  if (resource === "roles") return null;

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {canEdit && (
          <Button
            size="small"
            color="primary"
            variant="text"
            startIcon={<EditIcon fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              window.location.href = `#/${resource}/${safeRecord.id}`;
            }}
            sx={{ minWidth: "60px", textTransform: "none" }}
          >
            編輯
          </Button>
        )}
        {canDelete && (
          <Button
            size="small"
            color="error"
            variant="text"
            startIcon={<DeleteIcon fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              setButtonTarget(e.currentTarget);
              setOpenConfirm(true);
            }}
            sx={{ minWidth: "60px", textTransform: "none" }}
          >
            刪除
          </Button>
        )}
      </Stack>

      {/* 🟥 刪除確認 */}
      <GlobalAlertDialog
        open={openConfirm}
        title="確認刪除"
        description={`確定要刪除「${displayName}」嗎？`}
        severity="error"
        confirmLabel="刪除"
        cancelLabel="取消"
        onClose={() => {
          buttonTarget?.blur();
          setButtonTarget(null);
          setOpenConfirm(false);
        }}
        onConfirm={() => {
          buttonTarget?.blur();
          setButtonTarget(null);
          setOpenConfirm(false);
          handleDelete();
        }}
      />

      {/* ❗ 錯誤彈窗（單按鈕） */}
      <GlobalAlertDialog
        open={openErrorDialog}
        title="操作失敗"
        description={errorMessage}
        severity="warning"
        confirmLabel="確定"
        onClose={() => setOpenErrorDialog(false)}
      />

      {/* ✅ 成功彈窗（自動關閉） */}
      <GlobalAlertDialog
        open={openSuccessDialog}
        title="刪除成功"
        description={`「${displayName}」已成功刪除`}
        severity="success"
        hideButtons
        onClose={() => {}}
      />
    </>
  );
};

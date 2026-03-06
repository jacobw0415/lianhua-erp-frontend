import { Stack, Button } from "@mui/material";
import {
  useRecordContext,
  useListContext,
  useRefresh,
  useUpdate,
} from "react-admin";
import { useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

import { VoidReasonDialog } from "@/components/common/VoidReasonDialog";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";
import { getStoredAuthRoles, hasStoredAuthority, hasRoleAdmin } from "@/utils/authStorage";
import type { ReceiptListRow } from "./ReceiptList"; // 確保引用正確的型別定義

/* -------------------------------------------------------
 * ⭐ 收款紀錄操作列組件
 * ------------------------------------------------------- */
export const ReceiptActionColumns = () => {
  const record = useRecordContext<ReceiptListRow>();
  const { resource } = useListContext();
  const refresh = useRefresh();
  const [update] = useUpdate();
  const { showAlert } = useGlobalAlert();

  const [openVoidDialog, setOpenVoidDialog] = useState(false);

   /** RBAC：ROLE_ADMIN / ROLE_SUPER_ADMIN 或具 receipt:edit / receipt:void 權限時顯示操作按鈕 */
  const roles = getStoredAuthRoles();
  const isAdmin = hasRoleAdmin(roles);
  const canManageReceipt =
    isAdmin ||
    hasStoredAuthority(roles, "receipt:edit") ||
    hasStoredAuthority(roles, "receipt:void");

  /** ⭐ 若 record 不存在則不渲染 */
  if (!record) return null;
  if (!canManageReceipt) return null;

  /** ⭐ 統一顯示名稱：客戶名稱 + 收款金額 */
  const formattedAmount = new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: "TWD",
    maximumFractionDigits: 0,
  }).format(record.amount);

  const displayName = `${record.customerName} (${formattedAmount})`;

  /** --------------------------------------------------------
   * 🚫 作廢邏輯
   * -------------------------------------------------------- */
  const handleVoid = (reason?: string) => {
    update(
      resource,
      {
        id: record.id,
        data: reason ? { reason } : {},
        meta: { endpoint: "void" }, // 對接後端作廢端點
      },
      {
        onSuccess: () => {
          showAlert({
            title: "作廢成功",
            message: `收款紀錄「${displayName}」已成功作廢`,
            severity: "success",
            hideCancel: true,
          });
          setOpenVoidDialog(false);
          refresh();
        },
        onError: (error: any) => {
          const errorMessage = 
            error?.body?.message || 
            error?.message || 
            "作廢失敗，請重試";

          showAlert({
            title: "作廢失敗",
            message: errorMessage,
            severity: "error",
            hideCancel: true,
          });
        },
      }
    );
  };

  const isVoided = record.status === 'VOIDED';

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* 編輯按鈕 - 非作廢狀態才顯示 */}
        {!isVoided && (
          <Button
            size="small"
            color="primary"
            variant="text"
            startIcon={<EditIcon fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              // 跳轉至編輯頁面
              window.location.href = `#/${resource}/${record.id}`;
            }}
            sx={{ minWidth: "70px", textTransform: "none" }}
          >
            編輯
          </Button>
        )}

        {/* 作廢按鈕 - 非作廢狀態才顯示 */}
        {!isVoided && (
          <Button
            size="small"
            color="error"
            variant="text"
            startIcon={<BlockIcon fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              e.currentTarget.blur();
              setOpenVoidDialog(true);
            }}
            sx={{ minWidth: "70px", textTransform: "none" }}
          >
            作廢
          </Button>
        )}
      </Stack>

      {/* 作廢確認對話框 */}
      <VoidReasonDialog
        open={openVoidDialog}
        title="確認作廢收款紀錄"
        description={`確定要作廢「${displayName}」嗎？作廢後該筆款項將不再抵銷帳單金額，但會保留作廢紀錄供日後查核。`}
        confirmLabel="確認作廢"
        cancelLabel="取消"
        onClose={() => setOpenVoidDialog(false)}
        onConfirm={handleVoid}
      />
    </>
  );
};
import { Stack, Button } from "@mui/material";
import {
  useRecordContext,
  useListContext,
  useRefresh,
  useUpdate,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";

import { VoidReasonDialog } from "@/components/common/VoidReasonDialog";
import { useGlobalAlert } from "@/contexts/GlobalAlertContext";

/* -------------------------------------------------------
 * 🔐 型別定義
 * ------------------------------------------------------- */
interface ExpenseRecord extends RaRecord {
  status?: 'ACTIVE' | 'VOIDED';
  expenseDate?: string;
  categoryName?: string;
  amount?: number;
}

/* -------------------------------------------------------
 * ⭐ 支出紀錄操作列組件
 * ------------------------------------------------------- */
export const ExpenseActionColumns = () => {
  const record = useRecordContext<ExpenseRecord>();
  const { resource } = useListContext();
  const refresh = useRefresh();
  const [update] = useUpdate();
  const { showAlert } = useGlobalAlert();

  const [openVoidDialog, setOpenVoidDialog] = useState(false);

  /** ⭐ fallback record（避免 TS any） */
  const safeRecord = (record ?? { id: "placeholder" }) as ExpenseRecord;

  /** ⭐ 統一顯示名稱 */
  const displayName =
    safeRecord.categoryName && safeRecord.expenseDate
      ? `${safeRecord.categoryName} (${safeRecord.expenseDate})`
      : safeRecord.categoryName || `#${safeRecord.id}`;

  /** --------------------------------------------------------
   *  🚫 作廢邏輯
   * -------------------------------------------------------- */
  const handleVoid = (reason?: string) => {
    update(
      resource,
      {
        id: safeRecord.id,
        data: reason ? { reason } : {},
        meta: { endpoint: "void" },
      },
      {
        onSuccess: () => {
          showAlert({
            title: "作廢成功",
            message: `支出紀錄「${displayName}」已成功作廢`,
            severity: "success",
            hideCancel: true,
          });
          setOpenVoidDialog(false);
          refresh();
        },
        onError: (error: unknown) => {
          let errorMessage = "作廢失敗，請重試";
          
          if (
            typeof error === "object" &&
            error !== null &&
            "body" in error &&
            typeof (error as { body?: unknown }).body === "object" &&
            (error as { body?: { message?: unknown } }).body?.message
          ) {
            errorMessage = String((error as { body: { message: unknown } }).body.message);
          } else if (
            typeof error === "object" &&
            error !== null &&
            "message" in error
          ) {
            errorMessage = String((error as { message: unknown }).message);
          }

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

  if (!record) return null;

  const isVoided = record.status === 'VOIDED';

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* 編輯按鈕 - 只有正常狀態才顯示 */}
        {!isVoided && (
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

        {/* 作廢按鈕 - 只有正常狀態才顯示 */}
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
            sx={{ minWidth: "60px", textTransform: "none" }}
          >
            作廢
          </Button>
        )}
      </Stack>

      {/* 作廢確認對話框 */}
      <VoidReasonDialog
        open={openVoidDialog}
        title="確認作廢支出紀錄"
        description={`確定要作廢「${displayName}」嗎？作廢後此紀錄將不再參與會計計算，但會保留歷史資料。`}
        confirmLabel="確認作廢"
        cancelLabel="取消"
        onClose={() => setOpenVoidDialog(false)}
        onConfirm={handleVoid}
      />
    </>
  );
};


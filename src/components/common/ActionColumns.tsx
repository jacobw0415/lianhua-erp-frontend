import { Stack, Button } from "@mui/material";
import {
  useRecordContext,
  useDataProvider,
  useListContext,
  useRefresh,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { useState } from "react";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";

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
    return String(
      (error as { body: { message: unknown } }).body.message
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    return String((error as { message: unknown }).message);
  }

  return "不可刪除該筆資料，因為具有關聯紀錄。";
};

export const ActionColumns = () => {
  const record = useRecordContext<RaRecord>();
  const { resource } = useListContext();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();

  /** ⭐ fallback record（避免 TS any） */
  const safeRecord = (record ?? { id: "placeholder" }) as RaRecord;

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [buttonTarget, setButtonTarget] = useState<HTMLElement | null>(null);

  /** ⭐ 統一顯示名稱（避免 undefined） */
  const displayName =
    (safeRecord as { name?: string }).name ||
    (safeRecord as { item?: string }).item ||
    (safeRecord as { productName?: string }).productName ||
    (safeRecord as { title?: string }).title ||
    `#${safeRecord.id}`;

  /** --------------------------------------------------------
   *  🗑 刪除邏輯
   * -------------------------------------------------------- */
  const handleDelete = async () => {
    try {
      await dataProvider.delete(resource, { id: safeRecord.id });

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

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        {/* 編輯 */}
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

        {/* 刪除 */}
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
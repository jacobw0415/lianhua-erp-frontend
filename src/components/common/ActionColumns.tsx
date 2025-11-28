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

export const ActionColumns = () => {
  const record = useRecordContext<RaRecord>();
  const { resource } = useListContext();
  const refresh = useRefresh();
  const safeRecord: RaRecord = record ?? { id: "placeholder" };

  const dataProvider = useDataProvider();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [buttonTarget, setButtonTarget] = useState<HTMLElement | null>(null);

  /** ⭐ 統一顯示名稱（避免 undefined） */
  const displayName =
    safeRecord?.name ||
    safeRecord?.item ||
    safeRecord?.productName ||
    safeRecord?.title ||
    `#${safeRecord?.id}`;


  /** ⭐ 刪除邏輯 */
  const handleDelete = async () => {
    try {
      await dataProvider.delete(resource, { id: safeRecord.id });

      // 顯示成功彈窗
      setOpenSuccessDialog(true);

      // 自動關閉（不需 hideConfirm）
      setTimeout(() => {
        setOpenSuccessDialog(false);
        refresh();
      }, 800);

    } catch (err: any) {
      const backendMessage =
        err?.body?.message ||
        err?.message ||
        "不可刪除該筆資料，因為具有關聯紀錄。";

      setErrorMessage(backendMessage);
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
            (e.currentTarget as HTMLButtonElement).blur();
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
            (e.currentTarget as HTMLButtonElement).blur();
            setButtonTarget(e.currentTarget);
            setOpenConfirm(true);
          }}
          sx={{ minWidth: "60px", textTransform: "none" }}
        >
          刪除
        </Button>
      </Stack>

      {/* 🟥 刪除確認彈窗（保持雙按鈕模式） */}
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

      {/*  錯誤彈窗單按鈕模式 */}
      <GlobalAlertDialog
        open={openErrorDialog}
        title="操作失敗"
        description={errorMessage}
        severity="warning"
        confirmLabel="確定"
        onClose={() => setOpenErrorDialog(false)}   //  單按鈕模式
      // ❌ 不給 onConfirm（避免進到雙按鈕模式）
      />

      {/*  刪除成功 彈窗：單按鈕 + 自動關閉 */}
      <GlobalAlertDialog
        open={openSuccessDialog}
        title="刪除成功"
        description={`「${displayName}」已成功刪除`}
        severity="success"
        hideButtons   
        onClose={() => { }}
      />
    </>
  );
};

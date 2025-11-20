import { Stack, Button } from "@mui/material";
import {
  useRecordContext,
  useDataProvider,
  useNotify,
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
  const notify = useNotify();

  const [openConfirm, setOpenConfirm] = useState(false);
  const [buttonTarget, setButtonTarget] = useState<HTMLElement | null>(null);

  const handleDelete = async () => {
    try {
      await dataProvider.delete(resource, { id: safeRecord.id });
      notify("🗑️ 已成功刪除", { type: "success" });
      refresh();
    } catch (err: any) {
      notify(`❌ 刪除失敗：${err.message || "伺服器錯誤"}`, {
        type: "error",
      });
    }
  };

  if (!record) return null;

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        
        {/* ✔ 編輯：Icon + 文字 */}
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
          sx={{
            minWidth: "60px",
            textTransform: "none",
          }}
        >
          編輯
        </Button>

        {/* ✔ 刪除：Icon + 文字 */}
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
          sx={{
            minWidth: "60px",
            textTransform: "none",
          }}
        >
          刪除
        </Button>

      </Stack>

      {/* 刪除確認彈窗 */}
      <GlobalAlertDialog
        open={openConfirm}
        title="確認刪除"
        description={`確定要刪除「${safeRecord?.name || "此筆資料"}」嗎？`}
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
    </>
  );
};

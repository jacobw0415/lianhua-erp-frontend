import { Box, Tooltip } from "@mui/material";
import {
  EditButton,
  useRecordContext,
  useDataProvider,
  useNotify,
  useListContext,
  useRefresh,
} from "react-admin";
import type { RaRecord } from "react-admin";
import { useState } from "react";

import { GlobalAlertDialog } from "@/components/common/GlobalAlertDialog";
import { Button } from "@mui/material";

export const ActionColumns = () => {
  const record = useRecordContext<RaRecord>();
  const { resource } = useListContext();
  const refresh = useRefresh();                // ⭐ 改用 refresh()
  const safeRecord: RaRecord = record ?? { id: "placeholder" };

  const dataProvider = useDataProvider();
  const notify = useNotify();

  const [openConfirm, setOpenConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await dataProvider.delete(resource, { id: safeRecord.id });
      notify("🗑️ 已成功刪除", { type: "success" });

      refresh();       // ⭐ 測試後唯一 100% 生效的方法
    } catch (err: any) {
      notify(`❌ 刪除失敗：${err.message || "伺服器錯誤"}`, {
        type: "error",
      });
    }
  };

  return (
    <>
      <Box className="column-action"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          minWidth: "170px",
          flexShrink: 0,
          textAlign: "left",
        }}
      >
        {/* 編輯 */}
        <Tooltip title="編輯" arrow>
          <span>
            <EditButton record={safeRecord} label="編輯" />
          </span>
        </Tooltip>

        {/* 刪除 */}
        <Tooltip title="刪除" arrow>
          <span>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation(); // 防止觸發 rowClick
                setOpenConfirm(true);
              }}
              sx={{
                minWidth: "70px",
                padding: "6px 8px",
                fontSize: "0.8rem",
                borderRadius: "6px",
                textAlign: "center",
                boxShadow: "none", // 與你的 div 更接近：無高光
                "&:hover": {
                  boxShadow: "none",
                },
              }}
            >
              刪除
            </Button>
          </span>
        </Tooltip>
      </Box>

      <GlobalAlertDialog
        open={openConfirm}
        title="確認刪除"
        description={`您確定要刪除「${safeRecord?.name || "此筆資料"}」嗎？此操作無法復原。`}
        severity="error"
        confirmLabel="刪除"
        cancelLabel="取消"
        onClose={() => setOpenConfirm(false)}
        onConfirm={() => {
          setOpenConfirm(false);
          handleDelete();
        }}
      />
    </>
  );
};
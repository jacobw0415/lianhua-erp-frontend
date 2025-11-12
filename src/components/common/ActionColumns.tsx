import { Box, Tooltip } from "@mui/material";
import { EditButton, DeleteButton, useRecordContext } from "react-admin";
import type { RaRecord } from "react-admin";

/**
 * ✅ 統一操作欄位元件
 * - 支援 Datagrid 內外使用
 * - 不依賴 any，也不報型別錯誤
 */
export const ActionColumns = () => {
  const record = useRecordContext<RaRecord>();

  const safeRecord: RaRecord = record ?? { id: "placeholder" };

  return (
    <Box
      sx={{
        display: "flex",
        color: "text.primary",
        "& button": {

        },
      }}
    >
      <Tooltip title="編輯" arrow>
        <span>
          <EditButton record={safeRecord} label="編輯" />
        </span>
      </Tooltip>

      <Tooltip title="刪除" arrow>
        <span>
          <DeleteButton record={safeRecord} label="刪除" />
        </span>
      </Tooltip>
    </Box>
  );
};

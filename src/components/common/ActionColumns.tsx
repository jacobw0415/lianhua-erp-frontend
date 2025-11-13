import { Box, Tooltip } from "@mui/material";
import { EditButton, DeleteButton, useRecordContext } from "react-admin";
import type { RaRecord } from "react-admin";

/**
 *   統一操作欄位元件
 * - 提供固定欄位寬度
 * - 自動套用 Datagrid 欄位樣式（className="column-action"）
 * - 不依賴 any，不產生型別錯誤
 */
export const ActionColumns = () => {
  const record = useRecordContext<RaRecord>();
  const safeRecord: RaRecord = record ?? { id: "placeholder" };

  return (
    <Box
      className="column-action"   //  統一 action 欄位 class
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        minWidth: "170px",        
        flexShrink: 0,             
        textAlign: "left",
        "& button": {
          minWidth: "70px",
          padding: "6px 8px",
          fontSize: "0.8rem",
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

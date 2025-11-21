import { Switch, Box } from "@mui/material";
import { useRecordContext, useDataProvider, useNotify, useRefresh } from "react-admin";
import { useState } from "react";

export const SupplierStatusToggle = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();

  if (!record) return null;

  const isActive = record.active === true;
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await dataProvider.update("suppliers", {
        id: record.id,
        data: {}, // 不需要資料，本次是 meta 控制 endpoint
        meta: { endpoint: isActive ? "deactivate" : "activate" },
        previousData: record,
      });

      notify(isActive ? "已停用" : "已啟用", { type: "success" });
      refresh();
    } catch (err: any) {
      notify(`操作失敗：${err?.body?.message || err.message}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
      }}
    >
      <Switch
        checked={isActive}
        onChange={handleToggle}
        disabled={loading}
      />
    </Box>
  );
};

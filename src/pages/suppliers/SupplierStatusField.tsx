import { Switch, Box, Typography } from "@mui/material";
import { useRecordContext, useDataProvider, useNotify, useRefresh } from "react-admin";
import { useState } from "react";

export const SupplierStatusField = () => {
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
        data: {}, 
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
        alignItems: "center",
        justifyContent: "space-between",
        mt: 1, // 與 TextInput 一致
        mb: 1,
        px: 0.5,
      }}
    >
      <Typography sx={{ fontSize: "0.95rem", color: "text.primary" }}>
        是否啟用
      </Typography>

      <Switch
        checked={isActive}
        onChange={handleToggle}
        disabled={loading}
        color="success"
      />
    </Box>
  );
};

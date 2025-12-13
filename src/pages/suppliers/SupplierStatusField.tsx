import { Switch, Box, Typography } from "@mui/material";
import {
  useRecordContext,
  useDataProvider,
  useNotify,
  useRefresh,
} from "react-admin";
import { useState } from "react";

/* =========================================================
 * 型別定義
 * ========================================================= */

interface SupplierRow {
  id: number;
  active: boolean;
}

interface BackendError {
  body?: {
    message?: string;
  };
}

/* =========================================================
 * Type Guard
 * ========================================================= */

const isBackendError = (error: unknown): error is BackendError => {
  if (typeof error !== "object" || error === null) return false;

  const e = error as Record<string, unknown>;
  const body = e.body;

  if (typeof body !== "object" || body === null) return false;

  const bodyObj = body as Record<string, unknown>;
  return typeof bodyObj.message === "string";
};

/* =========================================================
 * Component
 * ========================================================= */

export const SupplierStatusField = () => {
  // ✅ Hooks 一律放最上面
  const record = useRecordContext<SupplierRow>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  // ⛔ early return 一定在 hooks 之後
  if (!record) return null;

  const isActive = record.active === true;

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
    } catch (err: unknown) {
      let message = "操作失敗";

      if (isBackendError(err) && err.body?.message) {
        message = err.body.message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      notify(`操作失敗：${message}`, { type: "error" });
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
        mt: 1,
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
import { Switch, Box } from "@mui/material";
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

interface ProductRow {
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

export const ProductStatusToggle = () => {
  // Hooks 一律放最上面
  const record = useRecordContext<ProductRow>();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [loading, setLoading] = useState(false);

  // ⛔ 早期 return 一定要放在 hooks 之後
  if (!record) return null;

  const isActive = record.active === true;

  const handleToggle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await dataProvider.update("products", {
        id: record.id,
        data: {},
        meta: {
          endpoint: isActive ? "deactivate" : "activate",
        },
        previousData: record,
      });

      notify(isActive ? "分類已停用" : "分類已啟用", {
        type: "success",
      });

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
    <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
      <Switch
        checked={isActive}
        onChange={handleToggle}
        disabled={loading}
      />
    </Box>
  );
};
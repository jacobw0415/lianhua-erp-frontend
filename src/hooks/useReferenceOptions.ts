import { useEffect, useState } from "react";
import { fetchUtils } from "react-admin";
import { logger } from "@/utils/logger";
import {
  appendLangQueryIfMissing,
  mergeHeadersWithAcceptLanguage,
} from "@/utils/apiLocale";

/**
 * 自動向後端載入 Reference 選項（支援 Swagger 格式）
 * @param url API 路徑，如 "/api/suppliers"
 * @param idKey 資料的 id 欄位
 * @param nameKey 顯示名稱欄位
 */
type ReferenceOption = {
  id: string | number;
  name: string;
};

type UnknownRecord = Record<string, unknown>;

export const useReferenceOptions = (
  url: string,
  idKey: string = "id",
  nameKey: string = "name"
) => {
  const [options, setOptions] = useState<ReferenceOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const { json } = await fetchUtils.fetchJson(appendLangQueryIfMissing(url), {
          headers: mergeHeadersWithAcceptLanguage({ Accept: "application/json" }),
        });

        // 🔥 支援 Swagger 格式：[] 或 { data: [] }
        const items: UnknownRecord[] = Array.isArray(json)
          ? json
          : Array.isArray((json as { data?: unknown }).data)
          ? ((json as { data: unknown[] }).data as UnknownRecord[])
          : [];

        if (active) {
          setOptions(
            items.map((item) => ({
              id: item[idKey] as string | number,
              name: String(item[nameKey] ?? ""),
            }))
          );
        }
      } catch (e: unknown) {
        logger.devError(`載入 reference (${url}) 失敗：`, e);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [url, idKey, nameKey]);

  return { options, loading };
};

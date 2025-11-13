import { useEffect, useState } from "react";
import { fetchUtils } from "react-admin";

/**
 * 自動向後端載入 Reference 選項（支援 Swagger 格式）
 * @param url API 路徑，如 "/api/suppliers"
 * @param idKey 資料的 id 欄位
 * @param nameKey 顯示名稱欄位
 */
export const useReferenceOptions = (
  url: string,
  idKey: string = "id",
  nameKey: string = "name"
) => {
  const [options, setOptions] = useState<{ id: any; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const { json } = await fetchUtils.fetchJson(url);

        // 🔥 支援 Swagger 格式
        const items = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
            ? json.data
            : [];

        if (active) {
          setOptions(
            items.map((item: any) => ({
              id: item[idKey],
              name: item[nameKey],
            }))
          );
        }
      } catch (e) {
        console.error(`載入 reference (${url}) 失敗：`, e);
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

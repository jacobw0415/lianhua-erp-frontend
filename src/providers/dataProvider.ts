import { fetchUtils, type DataProvider } from "react-admin";
import type { AuthProvider } from "react-admin";

import { getApiUrl } from "@/config/apiUrl";
import { apiRules } from "@/config/apiRules";
import { applyLoginSuccessFromContainer } from "@/providers/authProvider";
import { buildListQueryParams } from "@/providers/listQueryParams";

/* ========================================================
 * 🔐 與 ErrorHandlerContext 對齊的最小 ApiError
 * ======================================================== */
type ApiError =
  | {
    message?: string;
    body?: {
      message?: string;
      error?: string;
    };
    status?: number;
  }
  | unknown;

const apiUrl = getApiUrl();

/* ========================================================
 * ⭐ 注入 handleApiError、authProvider（401 時觸發被動登出）
 * ======================================================== */
export const createDataProvider = ({
  handleApiError,
  authProvider,
}: {
  handleApiError: (error: ApiError) => void;
  authProvider: AuthProvider;
}): DataProvider => {
  /* ========================================================
   * 原始 httpClient（只處理 header 與 fetch）
   * ======================================================== */
  const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    const opts = options as fetchUtils.Options & { meta?: Record<string, unknown> };
    const headers = new Headers(opts.headers || {});
    headers.set("Accept", "application/json");

    const hasBody = opts.body != null;
    const isFormData =
      typeof FormData !== "undefined" && opts.body instanceof FormData;

    if (hasBody && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // ========================================================
    // 🔐 所有 API 請求帶入 Authorization: Bearer <TOKEN>（RFC 6750 / Stateless）
    //    並記錄此次請求使用的 token 快照，供 401 處理時判斷是否為「舊會話請求」
    // ========================================================
    const token =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null;
    const tokenType =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("tokenType") || "Bearer"
        : "Bearer";

    if (token) {
      headers.set("Authorization", `${tokenType} ${token}`);
      opts.meta = {
        ...(opts.meta || {}),
        _tokenSnapshot: token,
      };
    }

    return fetchUtils.fetchJson(url, { ...opts, headers });
  };

  /* ========================================================
   * httpClientSafe（⭐ 全域錯誤處理）
   * ======================================================== */
  const httpClientSafe = async (
    url: string,
    options: fetchUtils.Options = {}
  ) => {
    try {
      const result = await httpClient(url, options);
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const status =
        apiError && typeof apiError === "object" && "status" in apiError
          ? Number((apiError as { status?: number }).status)
          : undefined;

      /* --------------------------------------------
       * 401：優先嘗試使用 refreshToken 換發，再重試原本請求
       * -------------------------------------------- */
      if (status === 401) {
        const meta = (options as { meta?: Record<string, unknown> }).meta;
        const alreadyRetried = Boolean(
          meta && (meta as { _retryWithRefresh?: boolean })._retryWithRefresh
        );

        // 若此次請求使用的 token 與目前 localStorage 中的 token 不同，代表是「舊會話」的 401，僅視為單次請求失敗
        const tokenSnapshot =
          meta && (meta as { _tokenSnapshot?: unknown })._tokenSnapshot;
        const currentToken =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("token")
            : null;
        if (
          typeof tokenSnapshot === "string" &&
          tokenSnapshot &&
          currentToken &&
          tokenSnapshot !== currentToken
        ) {
          throw error;
        }

        const refreshToken =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;

        if (!alreadyRetried && refreshToken) {
          try {
            const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
              method: "POST",
              headers: new Headers({ "Content-Type": "application/json" }),
              body: JSON.stringify({ refreshToken }),
            });

            const refreshJson = await refreshResponse.json().catch(() => null);

            if (refreshResponse.ok && refreshJson) {
              // 使用 refresh 成功回應更新 token 與 refreshToken
              try {
                applyLoginSuccessFromContainer(
                  refreshJson as unknown as Record<string, unknown>
                );
              } catch {
                // 解析失敗時，仍嘗試使用原 token；實際會在後續請求被 401 擋下
              }

              const retryOptions: fetchUtils.Options & {
                meta?: Record<string, unknown>;
              } = {
                ...options,
                meta: {
                  ...(meta || {}),
                  _retryWithRefresh: true,
                },
              };
              return await httpClient(url, retryOptions);
            }

            // refresh 401/400：視為 refresh 失敗 → 登出
            if (
              refreshResponse.status === 400 ||
              refreshResponse.status === 401
            ) {
              authProvider
                .checkError({ status: 401 } as ApiError)
                .catch(() => {
                  // ignore rejection – SESSION_EXPIRED will be thrown below
                });
              throw new Error("SESSION_EXPIRED");
            }
          } catch {
            // 換發過程本身失敗（網路等）：落到下方被動登出邏輯
          }
        }

        // 無 refreshToken 或已嘗試換發仍失敗 → 被動登出
        authProvider
          .checkError({ status: 401 } as ApiError)
          .catch(() => {
            // ignore rejection – SESSION_EXPIRED will be thrown below
          });
        throw new Error("SESSION_EXPIRED");
      }

      /* --------------------------------------------
       * 403 權限不足：觸發 authProvider.checkError，導向無權限頁
       * -------------------------------------------- */
      if (status === 403) {
        authProvider.checkError(apiError).catch(() => {
          // ignore rejection – 原始錯誤仍會丟給 React-Admin
        });
        throw error;
      }

      /* --------------------------------------------
       * 429 請求過於頻繁：交由全域錯誤處理顯示友善提示（避免誤認為系統壞掉）
       * -------------------------------------------- */
      if (status === 429) {
        handleApiError(apiError);
        throw error;
      }

      let msg = "";
      if (apiError && typeof apiError === "object") {
        if (
          "body" in apiError &&
          apiError.body &&
          typeof apiError.body === "object" &&
          "message" in apiError.body
        ) {
          msg = String(apiError.body.message || "");
        } else if ("message" in apiError) {
          msg = String(apiError.message || "");
        }
      }

      /* --------------------------------------------
       * ⭐ 特例：查無匹配 → 視為空資料（非錯誤）
       * -------------------------------------------- */
      if (msg.includes("查無匹配")) {
        return {
          json: {
            data: {
              content: [],
              totalElements: 0,
            },
          },
        };
      }

      /* --------------------------------------------
       * ⭐ 關鍵：交給全域錯誤處理
       * -------------------------------------------- */
      handleApiError(error);

      /* React-Admin 仍然要接到錯誤 */
      throw error;
    }
  };

  /* ========================================================
   * 共用：List Response 正規化
   * - 支援以下回傳格式：
   *   1. { data: [...], total: number }
   *   2. { data: { content: [...], totalElements: number } }
   *   3. [...]
   * ======================================================== */
  const normalizeListResponse = (json: unknown) => {
    const root = (json as { data?: unknown }) ?? {};
    const payload = root.data ?? json;

    const data = Array.isArray(payload)
      ? payload
      : Array.isArray(
        (payload as { content?: unknown }).content
      )
        ? (payload as { content: unknown[] }).content
        : [];

    const total = Array.isArray(payload)
      ? payload.length
      : typeof (payload as { totalElements?: unknown }).totalElements ===
        "number"
        ? (payload as { totalElements: number }).totalElements
        : data.length;

    return { data, total };
  };

  /* ========================================================
   * DataProvider 主體
   * ======================================================== */
  return {
    /* ===================== getList ===================== */
    getList(resource, params) {
      const rules = apiRules[resource] ?? {};
      const filters = params.filter || {};

      const query = buildListQueryParams(resource as string, {
        pagination: params.pagination,
        sort: params.sort,
        filter: params.filter,
      });

      const hasFilter = Object.values(filters).some(
        (v) => v !== "" && v !== undefined && v !== null
      );

      let basePath = `${apiUrl}/${resource}`;
      if (hasFilter && rules.search === true) {
        basePath = `${apiUrl}/${resource}/search`;
      }

      return httpClientSafe(`${basePath}?${query}`).then(({ json }) =>
        normalizeListResponse(json)
      );
    },

    /* ===================== getOne ===================== */
    getOne: (resource, params) =>
      httpClientSafe(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => {
        const data = json?.data ?? json;
        if (resource === "users" && data && typeof data === "object") {
          const user = data as Record<string, unknown>;
          if (
            (user.roleNames === undefined || user.roleNames === null) &&
            (user.roles !== undefined && user.roles !== null)
          ) {
            const roles = user.roles;
            user.roleNames = Array.isArray(roles)
              ? roles
              : typeof roles === "string"
                ? [roles]
                : [];
          }
        }
        return { data };
      }),

    /* ===================== getMany (優化：合併請求，但前端需要處理分頁) ===================== */
    getMany: (resource, params) => {
      // 將 ids 轉為 query string，例如 ?id=1&id=2 或使用逗號分隔 ?ids=1,2,3
      const query = new URLSearchParams();
      params.ids.forEach(id => query.append('id', String(id))); 

      return httpClientSafe(`${apiUrl}/${resource}?${query}`).then(({ json }) => {
        const data = json?.data ?? json;
        // 確保回傳格式為 { data: [...] }
        return { data: Array.isArray(data) ? data : data.content ?? [] };
      });
    },

    /* ================= getManyReference (優化：交給後端分頁) ===================== */
    getManyReference: async (resource, params) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const query = new URLSearchParams();
      
      query.set("page", String(page - 1));
      query.set("size", String(perPage));
      query.set("sort", `${field},${order.toLowerCase()}`);
      
      // 核心：將 target 欄位作為過期條件傳給後端
      // 例如：找某一供應商的所有產品，target 是 supplierId
      query.set(params.target, String(params.id));

      return httpClientSafe(`${apiUrl}/${resource}?${query}`).then(
        ({ json }) => normalizeListResponse(json)
      );
    },

    /* ===================== update ===================== */
    update: (resource, params) => {
      const endpoint = params.meta?.endpoint;

      if (endpoint === "activate") {
        return httpClientSafe(`${apiUrl}/${resource}/${params.id}/activate`, {
          method: "PUT",
        }).then(({ json }) => ({ data: json?.data ?? json }));
      }

      if (endpoint === "deactivate") {
        return httpClientSafe(`${apiUrl}/${resource}/${params.id}/deactivate`, {
          method: "PUT",
        }).then(({ json }) => ({ data: json?.data ?? json }));
      }

      if (endpoint === "read") {
        return httpClientSafe(`${apiUrl}/${resource}/${params.id}/read`, {
          method: "PATCH",
        }).then(({ json }) => ({ data: json?.data ?? json }));
      }

      if (endpoint === "void") {
        const voidUrl = `${apiUrl}/${resource}/${params.id}/void`;
        const voidMethod = "POST";
        const reason = params.data?.reason;

        if (import.meta.env.DEV) {
          console.log('🔍 調用 void 端點:', {
            url: voidUrl,
            method: voidMethod,
            resource,
            id: params.id,
            reason,
          });
        }

        const body = reason !== undefined && reason !== null
          ? JSON.stringify({ reason: String(reason) })
          : JSON.stringify({});

        return httpClientSafe(voidUrl, {
          method: voidMethod,
          body,
        }).then(({ json }) => ({ data: json?.data ?? json }));
      }

      if (endpoint === "forceLogout") {
        return httpClientSafe(
          `${apiUrl}/${resource}/${params.id}/force_logout`,
          {
            method: "POST",
          }
        ).then(() => ({
          // 後端回傳 204 無內容即可，前端保留原本資料避免 UI 閃動
          data: params.previousData ?? params.data,
        }));
      }

      return httpClientSafe(`${apiUrl}/${resource}/${params.id}`, {
        method: "PUT",
        body: JSON.stringify(params.data),
      }).then(({ json }) => ({ data: json?.data ?? json }));
    },

    /* ===================== updateMany ===================== */
    updateMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) =>
          httpClientSafe(`${apiUrl}/${resource}/${id}`, {
            method: "PUT",
            body: JSON.stringify(params.data),
          }).then(() => id)
        )
      ).then((ids) => ({ data: ids })),

    /* ===================== create ===================== */
    create: (resource, params) =>
      httpClientSafe(`${apiUrl}/${resource}`, {
        method: "POST",
        body: JSON.stringify(params.data),
      }).then(({ json }) => ({ data: json?.data ?? json })),

    /* ===================== delete ===================== */
    delete: (resource, params) =>
      httpClientSafe(`${apiUrl}/${resource}/${params.id}`, {
        method: "DELETE",
      }).then(({ json }) => ({
        data: json?.data ?? params.previousData,
      })),

    /* ===================== deleteMany ===================== */
    deleteMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) =>
          httpClientSafe(`${apiUrl}/${resource}/${id}`, {
            method: "DELETE",
          }).then(() => id)
        )
      ).then((ids) => ({ data: ids })),

    /* ===================== get (custom) ===================== */
    get(resource: string, options?: { meta?: Record<string, unknown> }) {
      let url = `${apiUrl}/${resource}`;

      // 如果有 meta 參數，將其轉換為查詢參數
      if (options?.meta) {
        const query = new URLSearchParams();
        Object.entries(options.meta).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // 處理陣列參數：將每個元素分別 append（後端可接受多個同名參數或逗號分隔）
            if (Array.isArray(value)) {
              // 如果後端支援逗號分隔，使用逗號分隔；否則每個元素分別 append
              // 這裡使用逗號分隔，因為 hook 中註釋說明後端支援逗號分隔
              query.append(key, value.join(","));
            } else {
              query.append(key, String(value));
            }
          }
        });
        const queryString = query.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      return httpClientSafe(url).then(({ json }) => ({
        data: json?.data ?? json,
      }));
    },
  };
};

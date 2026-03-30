import { fetchUtils, type DataProvider } from "react-admin";
import type { AuthProvider } from "react-admin";

import { getApiUrl } from "@/config/apiUrl";
import { apiRules } from "@/config/apiRules";
import {
  applyLoginSuccessFromContainer,
  isLogoutInProgress,
  unwrapAuthLoginPayload,
} from "@/providers/authProvider";
import { buildListQueryParams } from "@/providers/listQueryParams";
import {
  appendLangQueryIfMissing,
  applyAcceptLanguageHeader,
  mergeHeadersWithAcceptLanguage,
} from "@/utils/apiLocale";

/* ========================================================
 * 📝 型別擴充定義
 * ======================================================== */

/** 擴充 React-Admin 原生 Options 以支援自定義 meta 欄位 */
interface ExtendedOptions extends fetchUtils.Options {
  meta?: {
    _tokenSnapshot?: string;
    _retryWithRefresh?: boolean;
    endpoint?: string;
    [key: string]: any;
  };
}

/** 與 ErrorHandlerContext 對齊的 ApiError 型別 */
type ApiError =
  | {
      message?: string;
      body?: {
        message?: string;
        error?: string;
      };
      status?: number;
    }
  | any;

const apiUrl = getApiUrl();

/** 判定是否應抑制報錯（登出中、Token 失效後的殘留請求） */
function shouldSuppressStaleAuthGet(
  error: ApiError,
  options: ExtendedOptions
): boolean {
  const status = error?.status ? Number(error.status) : undefined;
  if (status !== 401 && status !== 403) return false;

  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET") return false;

  // 1. 正在登出流程中
  if (isLogoutInProgress()) return true;

  // 2. 請求快照與當前 Token 不符（代表這是過時的會話請求）
  const tokenSnapshot = options.meta?._tokenSnapshot;
  const currentToken =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

  // 2-a. 請求發出時無 token，回來時已經有 token（典型：登入前殘留 GET）
  if (!tokenSnapshot && currentToken) {
    return true;
  }

  // 2-b. 請求快照與當前 token 不一致（舊 token 請求）
  if (
    tokenSnapshot &&
    currentToken &&
    currentToken !== tokenSnapshot
  ) {
    return true;
  }

  return false;
}

function getQueryString(url: string): string {
  const q = url.indexOf("?");
  return q === -1 ? "" : url.slice(q + 1);
}

/** 依 URL 回傳合成空資料，避免前端 React-Admin 元件 Crash */
function syntheticJsonForAbortedGet(url: string): Record<string, any> {
  const params = new URLSearchParams(getQueryString(url));
  if (params.has("page") || params.has("size")) {
    return { data: { content: [], totalElements: 0 } };
  }
  if (params.has("id") || params.has("ids") || params.getAll("id").length > 0) {
    return { data: [] };
  }
  return { data: {} };
}

/* ========================================================
 * ⭐ createDataProvider
 * ======================================================== */
export const createDataProvider = ({
  handleApiError,
  authProvider,
}: {
  handleApiError: (error: ApiError) => void;
  authProvider: AuthProvider;
}): DataProvider & {
  // 明確宣告自定義 get 方法的型別，解決 (resource, options) => any 的問題
  get: (resource: string, options?: { meta?: Record<string, any> }) => Promise<{ data: any }>;
} => {

  /* ===================== 核心 HttpClient ===================== */
  const httpClient = (url: string, options: ExtendedOptions = {}) => {
    const headers = new Headers(options.headers || {});
    applyAcceptLanguageHeader(headers);
    headers.set("Accept", "application/json");

    const hasBody = options.body != null;
    const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

    if (hasBody && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    const tokenType = typeof localStorage !== "undefined" ? localStorage.getItem("tokenType") || "Bearer" : "Bearer";

    if (token) {
      headers.set("Authorization", `${tokenType} ${token}`);
      // 寫入快照，供 401/403 判斷使用
      options.meta = { ...(options.meta || {}), _tokenSnapshot: token };
    }

    const urlWithLang = appendLangQueryIfMissing(url);
    return fetchUtils.fetchJson(urlWithLang, { ...options, headers });
  };

  /* ===================== 安全包裝層 (錯誤攔截) ===================== */
  const httpClientSafe = async (url: string, options: ExtendedOptions = {}) => {
    const method = (options.method || "GET").toUpperCase();

    // 登出中直接短路，不發送真實 fetch 以消滅 Console 紅字
    if (method === "GET" && isLogoutInProgress()) {
      return { json: syntheticJsonForAbortedGet(url) };
    }

    try {
      return await httpClient(url, options);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const status = apiError?.status ? Number(apiError.status) : undefined;

      // 1. 抑制舊會話或登出競爭狀態下的洗版
      if (shouldSuppressStaleAuthGet(apiError, options)) {
        return { json: syntheticJsonForAbortedGet(url) };
      }

      // 2. 處理 401 (Refresh Token)
      if (status === 401) {
        const tokenSnapshot = options.meta?._tokenSnapshot;
        const currentToken =
          typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

        // 舊請求在新會話建立後才返回 401，忽略以避免誤觸發全域登出
        if (
          method === "GET" &&
          currentToken &&
          (!tokenSnapshot || tokenSnapshot !== currentToken)
        ) {
          return { json: syntheticJsonForAbortedGet(url) };
        }

        if (!options.meta?._retryWithRefresh) {
          const refreshToken = typeof localStorage !== "undefined" ? localStorage.getItem("refreshToken") : null;
          if (refreshToken) {
            try {
              const refreshHeaders = mergeHeadersWithAcceptLanguage({
                "Content-Type": "application/json",
              });
              const refreshResponse = await fetch(
                appendLangQueryIfMissing(`${apiUrl}/auth/refresh`),
                {
                  method: "POST",
                  headers: refreshHeaders,
                  body: JSON.stringify({ refreshToken }),
                }
              );
              const refreshJson = await refreshResponse.json().catch(() => null);

              if (refreshResponse.ok && refreshJson) {
                const payload = unwrapAuthLoginPayload(refreshJson);
                if (!payload) {
                  throw new Error("refresh payload missing auth fields");
                }
                applyLoginSuccessFromContainer(payload);
                // 重試原始請求
                return await httpClient(url, { 
                  ...options, 
                  meta: { ...options.meta, _retryWithRefresh: true } 
                });
              }
            } catch (e) { /* silent fail */ }
          }
        }
        authProvider
          .checkError({ status: 401, url, method })
          .catch(() => {});
        throw new Error("SESSION_EXPIRED");
      }

      // 3. 處理 403 (Forbidden) - ⭐ 消滅洗版關鍵
      if (status === 403) {
        authProvider.checkError(apiError).catch(() => {});
        if (method === "GET") {
          // GET 請求返回合成資料，不再向外 throw，確保 UI 不噴紅字
          return { json: syntheticJsonForAbortedGet(url) };
        }
        throw error; // 非 GET 請求仍需報錯以提示使用者操作失敗
      }

      // 4. 處理 429
      if (status === 429) {
        handleApiError(apiError);
        throw error;
      }

      // 5. 業務邏輯特例
      const msg = apiError?.body?.message || apiError?.message || "";
      if (typeof msg === "string" && msg.includes("查無匹配")) {
        return { json: { data: { content: [], totalElements: 0 } } };
      }

      // 6. 全域錯誤彈窗
      handleApiError(apiError);
      throw error;
    }
  };

  const normalizeListResponse = (json: any) => {
    const payload = json?.data ?? json;
    const data = Array.isArray(payload) ? payload : (payload?.content ?? []);
    const total = typeof payload?.totalElements === "number" ? payload.totalElements : data.length;
    return { data, total };
  };

  /* ===================== DataProvider Methods ===================== */
  return {
    getList: (resource, params) => {
      const rules = apiRules[resource] ?? {};
      const query = buildListQueryParams(resource, params);
      const hasFilter = Object.values(params.filter || {}).some(v => v != null && v !== "");
      const basePath = (hasFilter && rules.search) ? `${apiUrl}/${resource}/search` : `${apiUrl}/${resource}`;
      return httpClientSafe(`${basePath}?${query}`).then(({ json }) => normalizeListResponse(json));
    },

    getOne: (resource, params) =>
      httpClientSafe(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
        data: json?.data ?? json
      })),

    getMany: (resource, params) => {
      const query = new URLSearchParams();
      params.ids.forEach(id => query.append("id", String(id)));
      return httpClientSafe(`${apiUrl}/${resource}?${query}`).then(({ json }) => {
        const payload = json?.data ?? json;
        return { data: Array.isArray(payload) ? payload : (payload?.content ?? []) };
      });
    },

    getManyReference: (resource, params) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;
      const query = new URLSearchParams({
        page: String(page - 1),
        size: String(perPage),
        sort: `${field},${order.toLowerCase()}`,
        [params.target]: String(params.id),
      });
      return httpClientSafe(`${apiUrl}/${resource}?${query}`).then(({ json }) => normalizeListResponse(json));
    },

    update: (resource, params) => {
      // 解決 Object Literal 型別檢查報錯：先賦值給 ExtendedOptions
      const updateOptions: ExtendedOptions = {
        method: "PUT",
        body: JSON.stringify(params.data),
        meta: params.meta
      };

      const { endpoint } = params.meta ?? {};
      let url = `${apiUrl}/${resource}/${params.id}`;

      if (endpoint === "activate") url += "/activate";
      else if (endpoint === "deactivate") url += "/deactivate";
      else if (endpoint === "read") { url += "/read"; updateOptions.method = "PATCH"; }
      else if (endpoint === "void") {
        url += "/void";
        updateOptions.method = "POST";
        updateOptions.body = JSON.stringify({ reason: params.data?.reason ?? "" });
      } else if (endpoint === "forceLogout") {
        url += "/force_logout";
        updateOptions.method = "POST";
      }

      return httpClientSafe(url, updateOptions).then(({ json }) => ({
        data: endpoint === "forceLogout" ? (params.previousData ?? params.data) : (json?.data ?? json)
      }));
    },

    updateMany: (resource, params) =>
      Promise.all(params.ids.map(id =>
        httpClientSafe(`${apiUrl}/${resource}/${id}`, { method: "PUT", body: JSON.stringify(params.data) })
      )).then(() => ({ data: params.ids })),

    create: (resource, params) =>
      httpClientSafe(`${apiUrl}/${resource}`, { method: "POST", body: JSON.stringify(params.data) })
        .then(({ json }) => ({ data: json?.data ?? json })),

    delete: (resource, params) =>
      httpClientSafe(`${apiUrl}/${resource}/${params.id}`, { method: "DELETE" })
        .then(({ json }) => ({ data: json?.data ?? params.previousData })),

    deleteMany: (resource, params) =>
      Promise.all(params.ids.map(id =>
        httpClientSafe(`${apiUrl}/${resource}/${id}`, { method: "DELETE" })
      )).then(() => ({ data: params.ids })),

    // 自定義 get 方法，明確標註參數型別
    get: (resource: string, options?: { meta?: Record<string, any> }) => {
      const query = new URLSearchParams();
      if (options?.meta) {
        Object.entries(options.meta).forEach(([k, v]) => {
          if (v != null) query.append(k, Array.isArray(v) ? v.join(",") : String(v));
        });
      }
      const url = query.toString() ? `${apiUrl}/${resource}?${query.toString()}` : `${apiUrl}/${resource}`;
      return httpClientSafe(url).then(({ json }) => ({ data: json?.data ?? json }));
    },
  };
};
import { fetchUtils, type DataProvider } from "react-admin";
import type { AuthProvider } from "react-admin";

import { getApiUrl } from "@/config/apiUrl";
import { apiRules } from "@/config/apiRules";
import { filterMapping } from "@/config/filterMapping";
import { applyLoginSuccessFromContainer } from "@/providers/authProvider";

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
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");

    const hasBody = options.body != null;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    if (hasBody && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // ========================================================
    // 🔐 所有 API 請求帶入 Authorization: Bearer <TOKEN>（RFC 6750 / Stateless）
    // ========================================================
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";
    if (token) {
      headers.set("Authorization", `${tokenType} ${token}`);
    }

    return fetchUtils.fetchJson(url, { ...options, headers });
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
              void authProvider.checkError({ status: 401 } as ApiError);
              throw error;
            }
          } catch {
            // 換發過程本身失敗（網路等）：落到下方被動登出邏輯
          }
        }

        // 無 refreshToken 或已嘗試換發仍失敗 → 被動登出
        void authProvider.checkError(apiError);
        throw error;
      }

      /* --------------------------------------------
       * 403 權限不足：觸發 authProvider.checkError，導向無權限頁
       * -------------------------------------------- */
      if (status === 403) {
        void authProvider.checkError(apiError);
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
   * ======================================================== */
  const normalizeListResponse = (json: unknown) => {
    const jsonObj = json as Record<string, unknown>;
    const data = Array.isArray(jsonObj?.data)
      ? jsonObj.data
      : Array.isArray(json)
        ? json
        : [];

    const total =
      typeof jsonObj?.total === "number" ? jsonObj.total : data.length;

    return { data, total };
  };

  /* ========================================================
   * DataProvider 主體
   * ======================================================== */
  return {
    /* ===================== getList ===================== */
    getList(resource, params) {
      const mapping = filterMapping[resource] ?? {};
      const rules = apiRules[resource] ?? {};

      const { page = 1, perPage = 25 } = params.pagination || {};
      const { field, order } = params.sort || {};
      const filters = params.filter || {};

      const query = new URLSearchParams();
      query.set("page", String(page - 1));
      query.set("size", String(perPage));

      const allowedSortFields = [
        "id",
        "createdAt",
        "updatedAt",
        "name",
        "fullName",
        "position",
        "salary",
        "hireDate",
        "status",
        "contact",
        "phone",
        "billingCycle",
        "purchaseDate",
        "supplierId",
        "accountingPeriod",
        "item",
        "qty",
        "unitPrice",
        "taxRate",
        "taxAmount",
        "totalAmount",
        "paidAmount",
        "balance",
        "payDate",
        "supplierName",
        "saleDate",
        "productName",
        "amount",
        "orderDate",
        "deliveryDate",
        "orderNo",
        "receivedDate",
        "expenseDate",
        "userNotificationId",
        "notification.createdAt",
        "read",
      ];
      /**
       * Resource 預設排序設定（未在 <List> 顯式指定 sort 時才會套用）
       * - 一律使用 DESC，確保「新到舊」
       * - 單一列表若在 <List> 傳入「非預設排序」時，會覆蓋此預設
       */
      const defaultSortByResource: Record<
        string,
        { field: string; order?: "ASC" | "DESC" }
      > = {
        // 業務/營收相關：依日期新到舊
        orders: { field: "orderDate", order: "DESC" },
        sales: { field: "saleDate", order: "DESC" },
        receipts: { field: "receivedDate", order: "DESC" },
        expenses: { field: "expenseDate", order: "DESC" },
        payments: { field: "payDate", order: "DESC" },

        // 主檔類：依建立時間新到舊（若後端無 createdAt，會在 fallback 用 id）
        suppliers: { field: "createdAt", order: "DESC" },
        products: { field: "createdAt", order: "DESC" },
        product_categories: { field: "createdAt", order: "DESC" },
        expense_categories: { field: "createdAt", order: "DESC" },
        employees: { field: "createdAt", order: "DESC" },
        users: { field: "createdAt", order: "DESC" },
        roles: { field: "createdAt", order: "DESC" },

        // 通知：依建立時間新到舊
        notifications: { field: "notification.createdAt", order: "DESC" },
      };

      // React-Admin 預設會帶入 sort: { field: 'id', order: 'ASC' }
      // 這裡視為「尚未顯式指定排序」，讓我們可以套用預設「新到舊」規則
      const isDefaultRaSort =
        field === "id" && (order === "ASC" || order === undefined);

      // 決定最終 sort 欄位與順序：
      // 1. 若呼叫端有指定「非預設 RA 排序」（例如 ExpenseList / AP / AR 已在 <List> 上指定），則尊重該設定
      // 2. 否則依 resource 使用預設設定（defaultSortByResource）
      // 3. 若 resource 無預設，退回使用 id DESC
      let sortField = isDefaultRaSort ? undefined : field;
      let sortOrder = isDefaultRaSort ? undefined : order;

      if (!sortField) {
        const def = defaultSortByResource[resource as string];
        if (def) {
          sortField = def.field;
          sortOrder = def.order ?? "DESC";
        } else {
          sortField = "id";
          sortOrder = "DESC";
        }
      }

      if (sortField && allowedSortFields.includes(sortField)) {
        query.set("sort", `${sortField},${(sortOrder || "DESC").toLowerCase()}`);
      }

      const hasFilter = Object.values(filters).some(
        (v) => v !== "" && v !== undefined && v !== null
      );

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined && value !== null) {
          const backendKey = mapping[key] ?? key;
          query.append(backendKey, String(value));
        }
      });

      let basePath = `${apiUrl}/${resource}`;
      if (hasFilter && rules.search === true) {
        basePath = `${apiUrl}/${resource}/search`;
      }

      return httpClientSafe(`${basePath}?${query}`).then(({ json }) => {
        const payload = json?.data ?? json;
        const data = Array.isArray(payload) ? payload : payload?.content ?? [];

        const total = Array.isArray(payload)
          ? payload.length
          : payload?.totalElements ?? data.length;
        return { data, total };
      });
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

    /* ===================== getMany ===================== */
    getMany: (resource, params) =>
      Promise.all(
        params.ids.map((id) =>
          httpClientSafe(`${apiUrl}/${resource}/${id}`).then(
            ({ json }) => json?.data ?? json
          )
        )
      ).then((records) => ({ data: records })),

    /* ================= getManyReference ================= */
    getManyReference: async (resource, params) => {
      const { json } = await httpClientSafe(`${apiUrl}/${resource}`);
      const { data } = normalizeListResponse(json);

      const filtered = data.filter(
        (r: Record<string, unknown>) => r?.[params.target] === params.id
      );

      const { field, order } = params.sort ?? {
        field: "id",
        order: "ASC",
      };

      const sorted = [...filtered].sort((a, b) => {
        const av = a?.[field];
        const bv = b?.[field];
        if (av === bv) return 0;
        return (av > bv ? 1 : -1) * (order === "ASC" ? 1 : -1);
      });

      const { page = 1, perPage = 25 } = params.pagination || {};
      const start = (page - 1) * perPage;
      const end = start + perPage;

      return {
        data: sorted.slice(start, end),
        total: sorted.length,
      };
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

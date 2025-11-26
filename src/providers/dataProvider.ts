import {
    fetchUtils,
    type DataProvider
} from "react-admin";

import { apiRules } from "@/config/apiRules";
import { filterMapping } from "@/config/filterMapping";

const apiUrl: string =
    import.meta.env.VITE_API_URL || "http://localhost:8080/api";

/**
 * ⭐ dataProvider 工廠函式
 * 由 ErrorHandlerProvider 注入 handleApiError
 */
export const createDataProvider = ({ handleApiError }: { handleApiError: (e: any) => void }): DataProvider => {

    const httpClient = (url: string, options: fetchUtils.Options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set("Accept", "application/json");

        const hasBody = options && "body" in options && options.body != null;
        const isFormData =
            hasBody &&
            typeof FormData !== "undefined" &&
            options.body instanceof FormData;

        if (hasBody && !isFormData && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        return fetchUtils.fetchJson(url, { ...options, headers });
    };

    /** ⭐ 安全包一層，統一攔截錯誤 */
    const httpClientSafe = async (url: string, options: fetchUtils.Options = {}) => {
        try {
            return await httpClient(url, options);
        } catch (error) {
            handleApiError(error);
            throw error;   // RA 還需要錯誤往外拋
        }
    };

    /** ⭐ 整理 List 回傳格式 */
    const normalizeListResponse = (json: any) => {
        const data = Array.isArray(json?.data)
            ? json.data
            : Array.isArray(json)
                ? json
                : [];

        const total =
            typeof json?.total === "number" ? json.total : data.length;

        return { data, total };
    };

    return {
        /** =====================================
         *  list（包含所有你的 rule / filter / mapping）
         * ======================================*/
        getList(resource, params) {
            const rules = apiRules[resource] ?? {};
            const mapping = filterMapping[resource] ?? {};

            const { page = 1, perPage = 25 } =
                params.pagination || {};
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
                "contact",
                "phone",
                "billingCycle",
                "purchaseDate",
                "supplierId",
                "supplierName",
                "accountingPeriod",
                "item",
                "qty",
                "unitPrice",
                "taxRate",
                "taxAmount",
                "totalAmount",
                "paidAmount",
                "balance",
                "status",
            ];

            if (field && allowedSortFields.includes(field)) {
                query.set(
                    "sort",
                    `${field},${(order || "ASC").toLowerCase()}`
                );
            }

            let hasSearch = false;

            Object.entries(filters).forEach(([key, value]) => {
                if (
                    value !== "" &&
                    value !== undefined &&
                    value !== null
                ) {
                    hasSearch = true;
                    const backendKey = mapping[key] ?? key;
                    query.append(backendKey, String(value));
                }
            });

            const basePath =
                hasSearch && rules.search
                    ? `${apiUrl}/${resource}/search`
                    : `${apiUrl}/${resource}`;

            const url = `${basePath}?${query.toString()}`;

            return httpClientSafe(url)
                .then(({ json }) => {
                    const payload = json?.data ?? json;
                    const data = payload?.content ?? [];
                    const total = payload?.totalElements ?? data.length;

                    return { data, total };
                })
                .catch((error) => {
                    const msg =
                        error?.body?.message || error?.message || "";

                    if (msg.includes("查無匹配")) {
                        return {
                            data: [],
                            total: 0,
                        };
                    }

                    throw error;
                });
        },

        /** =====================================
         * getOne
         * ======================================*/
        getOne: (resource, params) =>
            httpClientSafe(`${apiUrl}/${resource}/${params.id}`).then(
                ({ json }) => ({
                    data: json?.data ?? json,
                })
            ),

        /** =====================================
         * getMany
         * ======================================*/
        getMany: (resource, params) =>
            Promise.all(
                params.ids.map((id) =>
                    httpClientSafe(`${apiUrl}/${resource}/${id}`).then(
                        ({ json }) => json?.data ?? json
                    )
                )
            ).then((records) => ({ data: records })),

        /** =====================================
         * getManyReference
         * ======================================*/
        getManyReference: async (resource, params) => {
            const { json } = await httpClientSafe(
                `${apiUrl}/${resource}`
            );
            const { data } = normalizeListResponse(json);

            const filtered = data.filter(
                (r: any) => r?.[params.target] === params.id
            );

            const { field, order } =
                params.sort ?? ({
                    field: "id",
                    order: "ASC",
                } as const);

            const sorted = [...filtered].sort((a, b) => {
                const av = a?.[field];
                const bv = b?.[field];

                if (av === bv) return 0;
                return (av > bv ? 1 : -1) * (order === "ASC" ? 1 : -1);
            });

            const { page, perPage } =
                params.pagination ?? { page: 1, perPage: 25 };
            const start = (page - 1) * perPage;
            const end = start + perPage;

            return {
                data: sorted.slice(start, end),
                total: sorted.length,
            };
        },

        /** =====================================
         * update （含 activate / deactivate）
         * ======================================*/
        update: (resource, params) => {
            const endpoint = params.meta?.endpoint;

            if (endpoint === "activate") {
                return httpClientSafe(
                    `${apiUrl}/${resource}/${params.id}/activate`,
                    { method: "PUT" }
                ).then(({ json }) => ({
                    data: json?.data ?? json,
                }));
            }

            if (endpoint === "deactivate") {
                return httpClientSafe(
                    `${apiUrl}/${resource}/${params.id}/deactivate`,
                    { method: "PUT" }
                ).then(({ json }) => ({
                    data: json?.data ?? json,
                }));
            }

            return httpClientSafe(`${apiUrl}/${resource}/${params.id}`, {
                method: "PUT",
                body: JSON.stringify(params.data),
            }).then(({ json }) => ({
                data: json?.data ?? json,
            }));
        },

        /** =====================================
         * updateMany
         * ======================================*/
        updateMany: (resource, params) =>
            Promise.all(
                params.ids.map((id) =>
                    httpClientSafe(`${apiUrl}/${resource}/${id}`, {
                        method: "PUT",
                        body: JSON.stringify(params.data),
                    }).then(
                        ({ json }) =>
                            json?.data?.id ?? json?.id ?? id
                    )
                )
            ).then((ids) => ({ data: ids })),

        /** =====================================
         * create
         * ======================================*/
        create: (resource, params) =>
            httpClientSafe(`${apiUrl}/${resource}`, {
                method: "POST",
                body: JSON.stringify(params.data),
            }).then(({ json }) => ({
                data: json?.data ?? json,
            })),

        /** =====================================
         * delete
         * ======================================*/
        delete: (resource, params) =>
            httpClientSafe(`${apiUrl}/${resource}/${params.id}`, {
                method: "DELETE",
            }).then(({ json }) => ({
                data: (json?.data ?? params.previousData) as any,
            })),

        /** =====================================
         * get
         * ======================================*/
        get(resource: string) {
            const url = `${apiUrl}/${resource}`;
            return httpClientSafe(url).then(({ json }) => ({
                data: json?.data ?? json,
            }));
        },

        /** =====================================
         * deleteMany
         * ======================================*/
        deleteMany: (resource, params) =>
            Promise.all(
                params.ids.map((id) =>
                    httpClientSafe(
                        `${apiUrl}/${resource}/${id}`,
                        { method: "DELETE" }
                    ).then(() => id)
                )
            ).then((ids) => ({ data: ids })),
    };
};

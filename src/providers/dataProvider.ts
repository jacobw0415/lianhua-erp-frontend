    import {
        fetchUtils,

        type DataProvider,
    } from 'react-admin';
    import { apiRules } from "@/config/apiRules";
    import { filterMapping } from "@/config/filterMapping";

    const apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

    // No Authorization for now (dev phase)
    const httpClient = (url: string, options: fetchUtils.Options = {}) => {
        const headers = new Headers(options.headers || {});
        headers.set('Accept', 'application/json');

        const hasBody = options && 'body' in options && options.body != null;
        const isFormData = hasBody && typeof FormData !== 'undefined' && options.body instanceof FormData;
        if (hasBody && !isFormData && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        return fetchUtils.fetchJson(url, { ...options, headers });
    };

    const normalizeListResponse = (json: any) => {
        const data = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
        const total = (typeof json?.total === 'number') ? json.total : data.length;
        return { data, total };
    };

    const dataProvider: DataProvider = {

        getList(resource, params) {
            const rules = apiRules[resource] ?? {};
            const mapping = filterMapping[resource] ?? {};

            const { page = 1, perPage = 25 } = params.pagination || {};
            const { field, order } = params.sort || {};
            const filters = params.filter || {};

            const query = new URLSearchParams();

            query.set("page", String(page - 1));
            query.set("size", String(perPage));

            //  白名單允許排序欄位（依你的後端可排序的 fields 設定）
            const allowedSortFields = [
                // === 通用 ===
                "id",
                "createdAt",
                "updatedAt",

                // === Supplier (供應商) ===
                "name",
                "contact",
                "phone",
                "billingCycle",

                // === Purchase (進貨單) ===
                "purchaseDate",
                "supplierId",
                "supplierName",   // DTO 中可能有
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

            //  只有欄位在白名單時才加入 sort
            if (field && allowedSortFields.includes(field)) {
                query.set("sort", `${field},${(order || "ASC").toLowerCase()}`);
            }
            // ❗ 若欄位不在白名單 → 不送 sort → 後端會 fallback 用 id 排序

            let hasSearch = false;

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== "" && value !== undefined && value !== null) {
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

            return httpClient(url)
                .then(({ json }) => {
                    const payload = json?.data ?? json;
                    const data = payload?.content ?? [];
                    const total = payload?.totalElements ?? data.length;

                    return { data, total };
                })
                .catch((error) => {
                    const msg = error?.body?.message || error?.message || "";

                    if (msg.includes("查無匹配")) {
                        return {
                            data: [],
                            total: 0,
                        };
                    }

                    throw error;
                });
        },


        getOne: (resource, params) =>
            httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
                data: json?.data ?? json,
            })),

        getMany: (resource, params) =>
            Promise.all(
                params.ids.map((id) =>
                    httpClient(`${apiUrl}/${resource}/${id}`).then(({ json }) => json?.data ?? json)
                )
            ).then((records) => ({ data: records })),

        getManyReference: async (resource, params) => {
            // Fallback: fetch all and client-side filter + sort + paginate
            const { json } = await httpClient(`${apiUrl}/${resource}`);
            const { data } = normalizeListResponse(json);

            const filtered = data.filter((r: any) => r?.[params.target] === params.id);
            const { field, order } = params.sort ?? { field: 'id', order: 'ASC' } as const;
            const sorted = [...filtered].sort((a, b) => {
                const av = a?.[field];
                const bv = b?.[field];
                if (av === bv) return 0;
                return (av > bv ? 1 : -1) * (order === 'ASC' ? 1 : -1);
            });
            const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
            const start = (page - 1) * perPage;
            const end = start + perPage;
            return { data: sorted.slice(start, end), total: sorted.length };
        },

        update: (resource, params) => {
            const endpoint = params.meta?.endpoint;

            //  客製：供應商啟用
            if (endpoint === "activate") {
                return httpClient(`${apiUrl}/${resource}/${params.id}/activate`, {
                    method: "PUT",
                }).then(({ json }) => ({
                    data: json?.data ?? json,
                }));
            }

            //  客製：供應商停用
            if (endpoint === "deactivate") {
                return httpClient(`${apiUrl}/${resource}/${params.id}/deactivate`, {
                    method: "PUT",
                }).then(({ json }) => ({
                    data: json?.data ?? json,
                }));
            }

            //  一般 update（例如編輯供應商）
            return httpClient(`${apiUrl}/${resource}/${params.id}`, {
                method: "PUT",
                body: JSON.stringify(params.data),
            }).then(({ json }) => ({
                data: json?.data ?? json,
            }));
        },


        updateMany: (resource, params) =>
            Promise.all(
                params.ids.map((id) =>
                    httpClient(`${apiUrl}/${resource}/${id}`, {
                        method: 'PUT',
                        body: JSON.stringify(params.data),
                    }).then(({ json }) => (json?.data?.id ?? json?.id ?? id))
                )
            ).then((ids) => ({ data: ids })),

        create: (resource, params) =>
            httpClient(`${apiUrl}/${resource}`, {
                method: 'POST',
                body: JSON.stringify(params.data),
            }).then(({ json }) => ({
                data: json?.data ?? json,
            })),

        delete: (resource, params) =>
            httpClient(`${apiUrl}/${resource}/${params.id}`, { method: 'DELETE' })
                .then(({ json }) => ({
                    data: (json?.data ?? params.previousData) as any,
                })),

        deleteMany: (resource, params) =>
            Promise.all(
                params.ids.map((id) =>
                    httpClient(`${apiUrl}/${resource}/${id}`, { method: 'DELETE' }).then(() => id)
                )
            ).then((ids) => ({ data: ids })),
    };

    export default dataProvider;

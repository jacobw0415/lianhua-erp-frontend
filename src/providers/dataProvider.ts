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
        const { field = "id", order = "ASC" } = params.sort || {};
        const filters = params.filter || {};

        const query = new URLSearchParams();

        // --- 分頁參數 ---
        query.set("page", String(page - 1));
        query.set("size", String(perPage));

        // --- 排序 ---
        query.set("sort", `${field},${order.toLowerCase()}`);

        // --- 搜尋條件處理 ---
        let hasSearch = false;

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== "" && value !== undefined && value !== null) {
                hasSearch = true;

                // 前端 source → 後端參數名稱
                const backendKey = mapping[key] ?? key;

                query.append(backendKey, String(value));
            }
        });

        // --- 決定 API basePath ---
        const basePath =
            hasSearch && rules.search
                ? `${apiUrl}/${resource}/search`
                : `${apiUrl}/${resource}`;

        const url = `${basePath}?${query.toString()}`;

        // --- 呼叫 API ---
        return httpClient(url).then(({ json }) => {
            const { data, total } = normalizeListResponse(json);

            return {
                data,
                total,
            };
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

    update: (resource, params) =>
        httpClient(`${apiUrl}/${resource}/${params.id}`, {
            method: 'PUT',
            body: JSON.stringify(params.data),
        }).then(({ json }) => ({
            data: json?.data ?? json,
        })),

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

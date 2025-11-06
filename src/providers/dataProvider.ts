import {
    fetchUtils,
    type GetListParams,
    type GetListResult,
    type RaRecord,
    type DataProvider,
} from 'react-admin';

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
    // Keep simple GET for compatibility; compute total client-side if needed
    getList: (resource: string, _params: GetListParams): Promise<GetListResult<RaRecord>> =>
        httpClient(`${apiUrl}/${resource}`).then(({ json, headers }) => {
            const { data, total } = normalizeListResponse(json);
            // Prefer Content-Range if backend provides
            const contentRange = headers?.get('content-range');
            const totalFromHeader = contentRange ? parseInt(contentRange.split('/').pop() || '0', 10) : undefined;
            return { data, total: totalFromHeader ?? total };
        }),

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

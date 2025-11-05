import { fetchUtils } from 'react-admin';
import type { DataProvider } from 'ra-core';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  options.headers = new Headers({ Accept: 'application/json' });
  return fetchUtils.fetchJson(url, options);
};

const dataProvider: DataProvider = {
  getList: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`).then(({ json }) => ({
      // 👇 從 json.data 取出實際資料陣列
      data: json.data,
      total: json.data.length,
    })),

  getOne: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
      data: json.data, // 👈 若單筆包在 data 內
    })),

  update: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: json.data,
    })),

  create: (resource, params) =>
    httpClient(`${apiUrl}/${resource}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({
      data: json.data,
    })),

  delete: (resource, params) =>
    httpClient(`${apiUrl}/${resource}/${params.id}`, { method: 'DELETE' })
      .then(() => ({
        data: params.previousData,
      })),
};

export default dataProvider;

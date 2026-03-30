import { filterMapping } from "@/config/filterMapping";

/** 與 dataProvider.getList 相同的查詢參數（供列表與 /{resource}/export 共用） */
export interface BuildListQueryParamsInput {
  pagination?: { page?: number; perPage?: number };
  sort?: { field?: string; order?: "ASC" | "DESC" };
  filter?: Record<string, unknown>;
}

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
  "occurredAt",
];

const defaultSortByResource: Record<
  string,
  { field: string; order?: "ASC" | "DESC" }
> = {
  orders: { field: "orderDate", order: "DESC" },
  sales: { field: "saleDate", order: "DESC" },
  receipts: { field: "receivedDate", order: "DESC" },
  expenses: { field: "expenseDate", order: "DESC" },
  payments: { field: "payDate", order: "DESC" },
  suppliers: { field: "createdAt", order: "DESC" },
  products: { field: "createdAt", order: "DESC" },
  product_categories: { field: "createdAt", order: "DESC" },
  expense_categories: { field: "createdAt", order: "DESC" },
  employees: { field: "createdAt", order: "DESC" },
  users: { field: "createdAt", order: "DESC" },
  roles: { field: "createdAt", order: "DESC" },
  notifications: { field: "notification.createdAt", order: "DESC" },
  "admin/activity-audit-logs": { field: "occurredAt", order: "DESC" },
};

/**
 * 組出與 GET `/{resource}` 或 `/{resource}/search` 相同的 query（不含 path）。
 */
export function buildListQueryParams(
  resource: string,
  params: BuildListQueryParamsInput
): URLSearchParams {
  const { page = 1, perPage = 25 } = params.pagination || {};
  const { field, order } = params.sort || {};
  const filters = params.filter || {};

  const query = new URLSearchParams();
  query.set("page", String(page - 1));
  query.set("size", String(perPage));

  const isDefaultRaSort =
    field === "id" && (order === "ASC" || order === undefined);

  let sortField = isDefaultRaSort ? undefined : field;
  let sortOrder = isDefaultRaSort ? undefined : order;

  if (!sortField) {
    const def = defaultSortByResource[resource];
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

  const mapping = filterMapping[resource] ?? {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      const backendKey = mapping[key] ?? key;
      let outVal = String(value);
      if (resource === "admin/activity-audit-logs") {
        if (backendKey === "from" && /^\d{4}-\d{2}-\d{2}$/.test(outVal)) {
          outVal = `${outVal}T00:00:00.000Z`;
        }
        if (backendKey === "to" && /^\d{4}-\d{2}-\d{2}$/.test(outVal)) {
          outVal = `${outVal}T23:59:59.999Z`;
        }
      }
      query.append(backendKey, outVal);
    }
  });

  return query;
}

export interface BuildExportQueryOptions {
  scope: "page" | "all";
  /** 後端約定，例如 xlsx、csv */
  format: string;
  /** 匯出欄位 key，逗號分隔傳遞（例如 `columns=orderNo,customerName`） */
  columns?: string[];
  /**
   * 匯出表頭／工作表語系需與 UI 不同時指定（後端 `exportLang`，優先於 LocaleContextHolder）。
   */
  exportLang?: "zh-TW" | "en";
}

/**
 * 後端匯出：與列表搜尋相同條件，再附加 `format`、`scope`。
 * `scope=all` 時不帶 page、size（與後端範例一致）。
 */
export function buildExportQueryParams(
  resource: string,
  params: BuildListQueryParamsInput,
  options: BuildExportQueryOptions
): URLSearchParams {
  const q = buildListQueryParams(resource, params);
  if (options.scope === "all") {
    q.delete("page");
    q.delete("size");
  }
  q.set("format", options.format);
  q.set("scope", options.scope);
  if (options.columns?.length) {
    q.set("columns", options.columns.join(","));
  }
  if (options.exportLang) {
    q.set("exportLang", options.exportLang === "en" ? "en" : "zh-TW");
  }
  return q;
}

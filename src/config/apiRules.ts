interface ApiRule {
  search: boolean;
  list: boolean;
  detail: boolean;
}

export const apiRules: Record<string, ApiRule> = {
  suppliers: {
    search: true,
    list: true,
    detail: true,
  },
  products: {
    search: true,
    list: true,
    detail: true,
  },
  employees: {
    search: true,
    list: true,
    detail: true,
  },
  sales: {
    search: true,
    list: true,
    detail: true,
  },
  purchases: {
    search: true,
    list: true,
    detail: true,
  },
  payments: {
    search: true,
    list: true,
    detail: true,
  },
  ap: {
    search: false,
    list: true,
    detail: true,
  },
  product_categories: {
    search: true,
    list: true,
    detail: true,
  },
  order_customers: {
    search: true,
    list: true,
    detail: true,
  },
  orders: {
    search: true,
    list: true,
    detail: true,
  },
  receipts: {
    search: true,
    list: true,
    detail: true,
  },
  items: {
    search: false,
    list: true,
    detail: true,
  },
  expense_categories: {
    search: true,
    list: true,
    detail: true,
  },
  expenses: {
    search: true,
    list: true,
    detail: true,
  },
};

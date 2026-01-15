export const filterMapping: Record<string, Record<string, string>> = {

    suppliers: {
        name: "supplierName",
        contactName: "contactName",
        phone: "phone",
        billingCycle: "billingCycle",
        note: "note",
    },

    products: {
        name: "name",
        code: "code",
        active: "active",
        categoryId: "categoryId",
        categoryCode: "categoryCode",
        unitPriceMin: "unitPriceMin",
        unitPriceMax: "unitPriceMax",
    },

    employees: {
        fullName: "fullName",
        position: "position",
        status: "status",
    },

    sales: {
        productName: "productName",
        payMethod: "payMethod",
        saleDateFrom: "saleDateFrom",
        saleDateTo: "saleDateTo",
    },

    purchases: {
        supplier: "supplierId",
        date: "purchaseDate",
        status: "status",
        purchaseNo: "purchaseNo",
        fromDate: "fromDate",
        toDate: "toDate",
    },

    payments: {
        supplierName: "supplierName",
        method: "method",
        accountingPeriod: "accountingPeriod",
        fromDate: "fromDate",
        toDate: "toDate",
        purchaseNo: "purchaseNo",
        status: "status",
    },

    order_customers: {
        name: "name",
        contactPerson: "contactPerson",
        phone: "phone",
        address: "address",
        billingCycle: "billingCycle",
        note: "note",
    },

    orders: {
        customerName: "customerName",
        orderNo: "orderNo",
        note: "note",
        status: "status",
        orderStatus: "orderStatus",
        paymentStatus: "paymentStatus",
        orderDateFrom: "orderDateFrom",
        orderDateTo: "orderDateTo",
        deliveryDateFrom: "deliveryDateFrom",
        deliveryDateTo: "deliveryDateTo",
        totalAmountMin: "totalAmountMin",
        totalAmountMax: "totalAmountMax",
        accountingPeriod: "accountingPeriod",
    },

    receipts: {
        customerName: "customerName",
        orderNo: "orderNo",
        orderId: "orderId",
        method: "method",
        status: "status",
        accountingPeriod: "accountingPeriod",
        fromDate: "fromDate",
        toDate: "toDate",
        receivedDateFrom: "receivedDateFrom",
        receivedDateTo: "receivedDateTo",
    },

    items: {
        orderNo: "orderNo",
        orderId: "orderId",
        productId: "productId",
        productName: "productName",
        qty: "qty",
        unitPrice: "unitPrice",
        discount: "discount",
        tax: "tax",
        subtotal: "subtotal",
    },

    expense_categories: {
        name: "name",
        accountCode: "accountCode",
        active: "active",
    },

    expenses: {
        categoryName: "categoryName",
        employeeName: "employeeName",
        accountingPeriod: "accountingPeriod",
        fromDate: "fromDate",
        toDate: "toDate",
        note: "note",
        status: "status",
    },

    notifications: {
        title: "title",
        content: "content",
        targetType: "targetType",
        targetId: "targetId",
        createdAt: "createdAt",
        read: "read",
    },
};

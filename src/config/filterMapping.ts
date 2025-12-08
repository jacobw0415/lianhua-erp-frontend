export const filterMapping: Record<string, Record<string, string>> = {

    suppliers: {
        name: "supplierName",
        contactName: "contactName",
        phone: "phone",
        billingCycle: "billingCycle",
        note: "note",
    },

    products: {
        name: "productName",
        barcode: "barcode",
        category: "category",
    },

    employees: {
        name: "employeeName",
        phone: "phone",
        position: "position",
    },

    sales: {
        orderNo: "orderNumber",
        customerName: "customerName",
        saleDate: "saleDate",
    },

    purchases: {
        supplier: "supplierId",
        date: "purchaseDate",
        status: "status",
    },

    payments: {
        supplierName: "supplierName",
        method: "method",
        accountingPeriod: "accountingPeriod",
        fromDate: "fromDate",
        toDate: "toDate",
    },

};

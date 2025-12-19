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
        name: "employeeName",
        phone: "phone",
        position: "position",
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
    },

    payments: {
        supplierName: "supplierName",
        method: "method",
        accountingPeriod: "accountingPeriod",
        fromDate: "fromDate",
        toDate: "toDate",
    },

    order_customers: {
        name: "name",
        contactPerson: "contactPerson",
        phone: "phone",
        address: "address",
        billingCycle: "billingCycle",
        note: "note",
    },

};

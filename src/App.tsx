import * as React from "react";
import { Admin, Resource } from "react-admin";

import { createDataProvider } from "@/providers/dataProvider";
import { NoopNotification } from "@/components/NoopNotification";
import Dashboard from "@/pages/dashboard/dashboard";

import { SupplierList } from "@/pages/suppliers/SupplierList";
import { SupplierCreate } from "@/pages/suppliers/SupplierCreate";
import { SupplierEdit } from "@/pages/suppliers/SupplierEdit";

import { PurchaseList } from "@/pages/purchases/PurchaseList";
import { PurchaseCreate } from "@/pages/purchases/PurchaseCreate";
import { PurchaseEdit } from "@/pages/purchases/PurchaseEdit";

import { PaymentList } from "@/pages/payments/PaymentList";
import { APList } from "@/pages/ap/APList";
import { ARList } from "@/pages/ar/ARList";

import { SaleList } from "@/pages/sales/SaleList";
import { SaleCreate } from "@/pages/sales/SaleCreate";
import { SaleEdit } from "@/pages/sales/SaleEdit";

import { OrderList } from "@/pages/orders/OrderList";
import { OrderCreate } from "@/pages/orders/OrderCreate";
import { OrderEdit } from "@/pages/orders/OrderEdit";

import { OrderCustomerList } from "@/pages/orderCustomers/OrderCustomerList";
import { OrderCustomerCreate } from "@/pages/orderCustomers/OrderCustomerCreate";
import { OrderCustomerEdit } from "@/pages/orderCustomers/OrderCustomerEdit";

import { ReceiptList } from "@/pages/receipts/ReceiptList";
import { ReceiptCreate } from "@/pages/receipts/ReceiptCreate";

import { ProductCategoryList } from "@/pages/productCategories/ProductCategoryList";
import { ProductCategoryCreate } from "@/pages/productCategories/ProductCategoryCreate";
import { ProductCategoryEdit } from "@/pages/productCategories/ProductCategoryEdit";

import { ProductList } from "@/pages/products/ProductList";
import { ProductCreate } from "@/pages/products/ProductCreate";
import { ProductEdit } from "@/pages/products/ProductEdit";

import { ExpenseCategoryList } from "@/pages/expenseCategories/ExpenseCategoryList";
import { ExpenseCategoryCreate } from "@/pages/expenseCategories/ExpenseCategoryCreate";
import { ExpenseCategoryEdit } from "@/pages/expenseCategories/ExpenseCategoryEdit";

import { ExpenseList } from "@/pages/expenses/ExpenseList";
import { ExpenseCreate } from "@/pages/expenses/ExpenseCreate";
import { ExpenseEdit } from "@/pages/expenses/ExpenseEdit";

import { EmployeeList } from "@/pages/employees/EmployeeList";
import { EmployeeCreate } from "@/pages/employees/EmployeeCreate";
import { EmployeeEdit } from "@/pages/employees/EmployeeEdit";

import { CashFlowReport } from "@/pages/reports/cashflow/CashFlowReport";
import { BalanceSheetReport } from "@/pages/reports/balancesheet/BalanceSheetReport";
import { ComprehensiveIncomeStatementReport } from "@/pages/reports/profitloss/ComprehensiveIncomeStatementReport";
import { ARSummaryReport } from "@/pages/reports/arsummary/ARSummaryReport";
import { APSummaryReport } from "@/pages/reports/apsummary/APSummaryReport";

import { CustomLayout } from "@/layout/CustomLayout";

import {
  ErrorHandlerProvider,
  useErrorHandler,
} from "@/context/ErrorHandlerContext";

import { GlobalAlertProvider } from "@/contexts/GlobalAlertContext";
import { ColorModeProvider } from "@/contexts/ColorModeProvider";
import { useColorMode } from "@/contexts/useColorMode";

import { LianhuaLightTheme } from "@/theme/LianhuaTheme";
import { LianhuaDarkTheme } from "@/theme/LianhuaTheme";

// ============================
// 🚀 App 外層 Provider
// ============================
export const AppWithProvider = () => {
  return (
    <ErrorHandlerProvider>
      <GlobalAlertProvider>
        <ColorModeProvider>
          <App />
        </ColorModeProvider>
      </GlobalAlertProvider>
    </ErrorHandlerProvider>
  );
};

// ============================
// 🚀 主 App（Theme 由 ColorMode 控制）
// ============================
const App = () => {
  const { handleApiError } = useErrorHandler();
  const { mode } = useColorMode();

  const dataProvider = React.useMemo(() => {
    return createDataProvider({
      handleApiError,
    });
  }, [handleApiError]);

  return (
    <Admin
      layout={CustomLayout}
      dashboard={Dashboard}
      dataProvider={dataProvider}
      notification={NoopNotification}
      /* ⭐ 關鍵：讓 RA 自己切 Theme */
      theme={LianhuaLightTheme}
      darkTheme={LianhuaDarkTheme}
      defaultTheme={mode}
    >
      <Resource
        name="suppliers"
        list={SupplierList}
        create={SupplierCreate}
        edit={SupplierEdit}
      />
      <Resource
        name="purchases"
        list={PurchaseList}
        create={PurchaseCreate}
        edit={PurchaseEdit}
      />
      <Resource name="payments" list={PaymentList} />
      <Resource name="ap" list={APList} />
      <Resource name="ar" list={ARList} />
      <Resource
        name="product_categories"
        list={ProductCategoryList}
        create={ProductCategoryCreate}
        edit={ProductCategoryEdit}
      />
      <Resource
        name="products"
        list={ProductList}
        create={ProductCreate}
        edit={ProductEdit}
      />
      <Resource
        name="sales"
        list={SaleList}
        create={SaleCreate}
        edit={SaleEdit}
      />
      <Resource
        name="order_customers"
        list={OrderCustomerList}
        create={OrderCustomerCreate}
        edit={OrderCustomerEdit}
      />
      <Resource
        name="orders"
        list={OrderList}
        create={OrderCreate}
        edit={OrderEdit}
      />
      <Resource
        name="receipts"
        list={ReceiptList}
        create={ReceiptCreate}
      />
      <Resource
        name="expense_categories"
        list={ExpenseCategoryList}
        create={ExpenseCategoryCreate}
        edit={ExpenseCategoryEdit}
      />
      <Resource
        name="expenses"
        list={ExpenseList}
        create={ExpenseCreate}
        edit={ExpenseEdit}
      />
      <Resource
        name="employees"
        list={EmployeeList}
        create={EmployeeCreate}
        edit={EmployeeEdit}
      />
      <Resource
        name="reports/cashflow"
        list={CashFlowReport}
      />
      <Resource
        name="reports/balancesheet"
        list={BalanceSheetReport}
      />
      <Resource
        name="reports/profitloss"
        list={ComprehensiveIncomeStatementReport}
      />
      <Resource
        name="reports/ar_summary"
        list={ARSummaryReport}
      />
      <Resource
        name="reports/ap_summary"
        list={APSummaryReport}
      />
    </Admin>
  );
};

export default AppWithProvider;

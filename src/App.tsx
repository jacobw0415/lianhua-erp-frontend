import * as React from "react";
import { Admin, CustomRoutes, Resource } from "react-admin";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { createDataProvider } from "@/providers/dataProvider";
import { NoopNotification } from "@/components/NoopNotification";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";

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
import { ReceiptEdit } from "@/pages/receipts/ReceiptEdit";

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
import { OnlineUsersProvider } from "@/contexts/OnlineUsersContext";
import { useColorMode } from "@/contexts/useColorMode";

import { LianhuaLightTheme } from "@/theme/LianhuaTheme";
import { LianhuaDarkTheme } from "@/theme/LianhuaTheme";

import { NotificationList } from "@/pages/notifications/NotificationList";
import { authProvider } from "@/providers/authProvider";
import { LoginPage } from "@/pages/Login/LoginPage";
import { ForgotPassPage } from "@/pages/Login/ForgotPassPage";
import { ResetPassPage } from "@/pages/Login/ResetPassPage";
import { MfaVerifyPage } from "@/pages/Login/MfaVerifyPage";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { ForbiddenPage } from "@/pages/ForbiddenPage";
import { UserList } from "@/pages/users/UserList";
import { UserCreate } from "@/pages/users/UserCreate";
import { UserEdit } from "@/pages/users/UserEdit";
import { RoleList } from "@/pages/roles/RoleList";
import { ActivityAuditLogList } from "@/pages/activityAuditLogs/ActivityAuditLogList";
import ProfilePage from "@/pages/account/ProfilePage";
import ChangePasswordPage from "@/pages/account/ChangePasswordPage";
import { raI18nProvider } from "@/providers/raI18nProvider";
import { RaLocaleSync } from "@/components/RaLocaleSync";

// ============================
// 🚀 App 外層 Provider
// ============================
export const AppWithProvider = () => {
  // 若當前 URL 上帶有 ?token= 或 ?resetToken=，代表從「重設密碼」信件點進來；
  // 這時直接渲染 ResetPassPage，避免被 React-Admin 的登入流程攔截。
  let shouldShowResetPass = false;
  if (typeof window !== "undefined") {
    const { search, hash } = window.location;
    // 優先從 query string 取參數，若沒有再從 hash 中解析（避免不同部署模式差異）
    const queryPart =
      search && search.length > 1
        ? search.substring(1)
        : hash.includes("?")
          ? hash.substring(hash.indexOf("?") + 1)
          : "";
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const token = params.get("token") || params.get("resetToken");
      if (token) {
        shouldShowResetPass = true;
      }
    }
  }

  if (shouldShowResetPass) {
    return (
      <ErrorHandlerProvider>
        <GlobalAlertProvider>
          <ColorModeProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
              <Routes>
                <Route path="/reset-password" element={<ResetPassPage />} />
                <Route path="/forgot-password" element={<ForgotPassPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/mfa" element={<MfaVerifyPage />} />
                {/* 若路徑不符，預設仍顯示重設密碼頁，避免使用者卡住 */}
                <Route path="*" element={<ResetPassPage />} />
              </Routes>
            </BrowserRouter>
          </ColorModeProvider>
        </GlobalAlertProvider>
      </ErrorHandlerProvider>
    );
  }

  return (
    <ErrorHandlerProvider>
      <GlobalAlertProvider>
        <ColorModeProvider>
          <OnlineUsersProvider>
            <AppErrorBoundary>
              <App />
            </AppErrorBoundary>
          </OnlineUsersProvider>
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

  // 儀表板採用 lazy loading，減少初始載入 JS 體積，改善 LCP
  const Dashboard = React.useMemo(
    () =>
      React.lazy(async () => ({
        default: (await import("@/pages/dashboard/dashboard")).default,
      })),
    []
  );

  const LazyDashboard: React.FC = React.useCallback(
    () => (
      <React.Suspense fallback={<DashboardSkeleton />}>
        <Dashboard />
      </React.Suspense>
    ),
    [Dashboard]
  );

  const dataProvider = React.useMemo(() => {
    return createDataProvider({
      handleApiError,
      authProvider,
    });
  }, [handleApiError]);

  return (
    <Admin
      layout={CustomLayout}
      dashboard={LazyDashboard}
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={raI18nProvider}
      loginPage={LoginPage}
      notification={NoopNotification}
      theme={LianhuaLightTheme}
      darkTheme={LianhuaDarkTheme}
      defaultTheme={mode}
    >
      <RaLocaleSync />
      {/* 無佈局頁面：登入相關（不顯示側邊選單與 AppBar） */}
      <CustomRoutes noLayout>
        <Route path="/forgot-password" element={<ForgotPassPage />} />
        <Route path="/reset-password" element={<ResetPassPage />} />
        <Route path="/mfa" element={<MfaVerifyPage />} />
      </CustomRoutes>

      {/* 一般佈局頁面 */}
      <CustomRoutes>
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </CustomRoutes>
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
        edit={ReceiptEdit}
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
      {/* 使用者管理：僅隱藏列表頂端預設 + Create，仍保留共用「新增資料」按鈕與 create 路由 */}
      <Resource
        name="users"
        list={UserList}
        create={UserCreate}
        edit={UserEdit}
      />
      {/* 角色由系統預定義，僅供檢視，不開放新增/編輯 */}
      <Resource name="roles" list={RoleList} />
      {/* 全系統活動稽核：僅 SUPER_ADMIN；列表內另做路由守護 */}
      <Resource name="admin/activity-audit-logs" list={ActivityAuditLogList} />
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
      <Resource
        name="notifications"
        list={NotificationList}
      />
      <Resource name="notifications/unread" /> 
      <Resource name="notifications/unread-count" />
    </Admin>
  );
};

export default AppWithProvider;

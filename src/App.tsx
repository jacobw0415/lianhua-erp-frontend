import * as React from "react";
import { Admin, Resource, ListGuesser } from "react-admin";
import { createDataProvider } from "@/providers/dataProvider";
import { NoopNotification } from "@/components/NoopNotification";
import Dashboard from "@/pages/dashboard/dashboard";
import { CustomLayout } from "@/layout/CustomLayout";
import { LianhuaLightTheme, LianhuaDarkTheme } from "@/theme/LianhuaTheme";
import { SupplierList } from "@/pages/suppliers/SupplierList";
import { SupplierCreate } from "@/pages/suppliers/SupplierCreate";
import { SupplierEdit } from "@/pages/suppliers/SupplierEdit";
import { PurchaseList } from "@/pages/purchases/PurchaseList";
import { PurchaseCreate } from '@/pages/purchases/PurchaseCreate';
import { PurchaseEdit } from '@/pages/purchases/PurchaseEdit';
import { SaleList } from "@/pages/sales/SaleList";
import { GlobalAlertProvider } from "@/contexts/GlobalAlertContext";
import { ErrorHandlerProvider, useErrorHandler } from "@/context/ErrorHandlerContext";


// ===========================
// 🚀 App 包在 Provider 裡
// ===========================
const AppWithProvider = () => {
    return (
        <ErrorHandlerProvider>
           <GlobalAlertProvider>
                <App />
            </GlobalAlertProvider>
        </ErrorHandlerProvider>
    );
};


// ===========================
// 🚀 原本的 App，內部取得全域 handleApiError
// ===========================
const App = () => {
    const { handleApiError } = useErrorHandler();

    // 從 localStorage 讀取使用者偏好
    const [darkMode, setDarkMode] = React.useState(
        localStorage.getItem("themeMode") === "dark"
    );

    // 儲存偏好
    React.useEffect(() => {
        localStorage.setItem("themeMode", darkMode ? "dark" : "light");
    }, [darkMode]);

    const theme = darkMode ? LianhuaDarkTheme : LianhuaLightTheme;

    //  建立真正的 dataProvider（避免每次 re-render 重建）
    const dataProvider = React.useMemo(() => {
        return createDataProvider({ handleApiError });
    }, [handleApiError]);


    return (
        <Admin
            dashboard={Dashboard}
            dataProvider={dataProvider}

            /**  關閉所有 React-Admin 預設通知 */
            notification={NoopNotification}

            layout={(props) => (
                <CustomLayout
                    {...props}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
            )}

            theme={theme}
        >
            <Resource name="suppliers" list={SupplierList} create={SupplierCreate} edit={SupplierEdit} />
            <Resource name="purchases" list={PurchaseList} create={PurchaseCreate} edit={PurchaseEdit} />
            <Resource name="sales" list={SaleList} />
            <Resource name="receipts" list={ListGuesser} />
            <Resource name="expenses" list={ListGuesser} />
        </Admin>
    );
};

export default AppWithProvider;

import * as React from "react";
import { Admin, Resource, ListGuesser } from "react-admin";
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
import { SaleList } from "@/pages/sales/SaleList";
import { CustomLayout } from "@/layout/CustomLayout";
import { ErrorHandlerProvider, useErrorHandler } from "@/context/ErrorHandlerContext";
import { GlobalAlertProvider } from "@/contexts/GlobalAlertContext";
import { buildTheme } from "@/theme/unifiedTheme";
import { ColorModeProvider, useColorMode } from "@/contexts/ColorModeContext";


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
// 🚀 主 App（使用 colorMode）
// ============================
const App = () => {
    const { handleApiError } = useErrorHandler();
    const { mode } = useColorMode();

    const theme = React.useMemo(() => buildTheme(mode), [mode]);

    const dataProvider = React.useMemo(() => {
        return createDataProvider({ handleApiError });
    }, [handleApiError]);

    return (
        <Admin
            theme={theme}   // ← 這裡才是正確位置！
            dashboard={Dashboard}
            dataProvider={dataProvider}
            notification={NoopNotification}
            layout={CustomLayout}
        >
            <Resource name="suppliers" list={SupplierList} create={SupplierCreate} edit={SupplierEdit} />
            <Resource name="purchases" list={PurchaseList} create={PurchaseCreate} edit={PurchaseEdit} />
            <Resource name="payments" list={PaymentList} />
            <Resource name="ap" list={APList} />
            <Resource name="sales" list={SaleList} />
            <Resource name="receipts" list={ListGuesser} />
            <Resource name="expenses" list={ListGuesser} />
        </Admin>
    );
};

export default AppWithProvider;
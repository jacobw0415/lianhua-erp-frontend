// src/App.tsx
import * as React from "react";
import { Admin, Resource, ListGuesser } from "react-admin";
import dataProvider from "@/providers/dataProvider";
import Dashboard from "@/pages/dashboard/dashboard";
import { CustomLayout } from "@/layout/CustomLayout";
import { LianhuaLightTheme, LianhuaDarkTheme } from "@/theme/LianhuaTheme";
import { SupplierList } from "@/pages/suppliers/SupplierList";
import { PurchaseList } from "@/pages/purchases/PurchaseList";
import { SaleList } from "@/pages/sales/SaleList";
import { PurchaseCreate } from '@/pages/purchases/PurchaseCreate';
import { PurchaseEdit } from '@/pages/purchases/PurchaseEdit';
import { SupplierCreate } from "@/pages/suppliers/SupplierCreate";
import { SupplierEdit } from "@/pages/suppliers/SupplierEdit";

const App = () => {
    // 從 localStorage 讀取使用者偏好
    const [darkMode, setDarkMode] = React.useState(
        localStorage.getItem("themeMode") === "dark"
    );

    // 每次切換時儲存偏好
    React.useEffect(() => {
        localStorage.setItem("themeMode", darkMode ? "dark" : "light");
    }, [darkMode]);

    const theme = darkMode ? LianhuaDarkTheme : LianhuaLightTheme;

    return (
        <Admin
            dashboard={Dashboard}
            dataProvider={dataProvider}
            layout={(props) => (
                <CustomLayout {...props} darkMode={darkMode} setDarkMode={setDarkMode} />
            )}
            theme={theme}
        >
            <Resource name="suppliers" list={SupplierList} create={SupplierCreate} edit={SupplierEdit}/>
            <Resource name="purchases" list={PurchaseList} create={PurchaseCreate} edit={PurchaseEdit} />
            <Resource name="sales" list={SaleList} />
            <Resource name="receipts" list={ListGuesser} />
            <Resource name="expenses" list={ListGuesser} />
        </Admin>
    );
};

export default App;


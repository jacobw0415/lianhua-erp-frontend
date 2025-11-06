// src/App.tsx
import * as React from "react";
import { Admin, Resource, ListGuesser } from "react-admin";
import dataProvider from "./providers/dataProvider";
import Dashboard from "./pages/dashboard/dashboard";
import { CustomLayout } from "./layout/CustomLayout";
import { LianhuaLightTheme, LianhuaDarkTheme } from "./theme/LianhuaTheme";

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
            <Resource name="suppliers" list={ListGuesser} />
            <Resource name="purchases" list={ListGuesser} />
            <Resource name="payments" list={ListGuesser} />
            <Resource name="sales" list={ListGuesser} />
            <Resource name="receipts" list={ListGuesser} />
            <Resource name="expenses" list={ListGuesser} />
        </Admin>
    );
};

export default App;


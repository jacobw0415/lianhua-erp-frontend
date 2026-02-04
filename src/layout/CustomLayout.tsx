import * as React from "react";
import { Layout, type LayoutProps } from "react-admin";
import { useQueryClient } from "@tanstack/react-query";

import { CustomMenu } from "./CustomMenu";
import { CustomSidebar } from "./CustomSidebar";
import { CustomAppBar } from "./CustomAppBar";
import { IdleTimer } from "@/components/IdleTimer";
import { setQueryClientRef } from "@/utils/appCache";

/** 登入狀態下註冊 QueryClient，供登出時 clearAppCache() 使用 */
const QueryClientRefSetter = () => {
    const queryClient = useQueryClient();
    React.useEffect(() => {
        setQueryClientRef(queryClient);
        return () => setQueryClientRef(null);
    }, [queryClient]);
    return null;
};

export const CustomLayout = (props: LayoutProps) => {
    const appBar = React.useCallback(CustomAppBar, []);
    const menu = React.useCallback(CustomMenu, []);
    const sidebar = React.useCallback(CustomSidebar, []);

    return (
        <IdleTimer>
        <QueryClientRefSetter />
        <Layout
            {...props}
            appBar={appBar}
            menu={menu}
            sidebar={sidebar}
            sx={{
                // 這裡選取 react-admin 內部的內容區塊類別
                "& .RaLayout-content": {
                    paddingTop: 0, // 移除頂部間距
                    marginTop: 0,
                },
                "& .RaLayout-appFrame": {
                    marginTop: 0,  //  appFrame 上間距
                }
            }}
        />
        </IdleTimer>
    );
};

CustomLayout.displayName = "CustomLayout";
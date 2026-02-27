import * as React from "react";
import { Layout, type LayoutProps, useSidebarState } from "react-admin";
import { useQueryClient } from "@tanstack/react-query";
import { Box } from "@mui/material";

import { CustomMenu } from "./CustomMenu";
import { CustomSidebar } from "./CustomSidebar";
import { CustomAppBar } from "./CustomAppBar";
import { IdleTimer } from "@/components/IdleTimer";
import { setQueryClientRef } from "@/utils/appCache";
import { useBreakpoint } from "@/hooks/useIsMobile";

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
    const [sidebarOpen, setSidebarOpen] = useSidebarState();
    const breakpoint = useBreakpoint();
    const shouldShowOverlay = sidebarOpen && breakpoint !== "desktop";

    // 與 CustomSidebar 中的 drawerWidth 保持一致
    const SIDEBAR_WIDTH = 240;

    return (
        <IdleTimer>
        <QueryClientRefSetter />
        <Box
            sx={{
                position: "relative",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
            }}
        >
            <Layout
                {...props}
                appBar={appBar}
                menu={menu}
                sidebar={sidebar}
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    // 這裡選取 react-admin 內部的內容區塊類別
                    "& .RaLayout-content": {
                        paddingTop: 0, // 移除頂部間距
                        marginTop: 0,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        // 與 Dashboard 保持一致的左右間距
                        paddingX: { xs: 1, sm: 2, md: 2 },
                        paddingLeft: { xs: 1, sm: 2, md: 2 },
                        paddingRight: { xs: 1, sm: 2, md: 2 },
                    },
                    "& .RaLayout-appFrame": {
                        marginTop: 0,  //  appFrame 上間距
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                    },
                    "& .RaList-main": {
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        // 移除 paddingX: 0，讓它繼承父層 .RaLayout-content 的間距
                    },
                    "& .RaList-content": {
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        // 移除 paddingX: 0，讓它繼承父層 .RaLayout-content 的間距
                    }
                }}
            />

            {shouldShowOverlay && (
                <Box
                    onClick={() => setSidebarOpen(false)}
                    onTouchStart={() => setSidebarOpen(false)}
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: SIDEBAR_WIDTH,
                        right: 0,
                        bottom: 0,
                        zIndex: 1301,
                        backgroundColor: "transparent",
                    }}
                />
            )}
        </Box>
        </IdleTimer>
    );
};

CustomLayout.displayName = "CustomLayout";
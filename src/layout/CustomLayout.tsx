import * as React from "react";
import { Layout, type LayoutProps } from "react-admin";

import { CustomMenu } from "./CustomMenu";
import { CustomSidebar } from "./CustomSidebar";
import { CustomAppBar } from "./CustomAppBar";
import { GlobalLoadingProgress } from "@/components/common/GlobalLoadingProgress";

export const CustomLayout = (props: LayoutProps) => {
    const appBar = React.useCallback(CustomAppBar, []);
    const menu = React.useCallback(CustomMenu, []);
    const sidebar = React.useCallback(CustomSidebar, []);

    return (
        <>
            {/* 全局進度條（固定在頁面頂部，類似 YouTube） */}
            <GlobalLoadingProgress />
            <Layout
                {...props}
                appBar={appBar}
                menu={menu}
                sidebar={sidebar}
            />
        </>
    );
};

CustomLayout.displayName = "CustomLayout";
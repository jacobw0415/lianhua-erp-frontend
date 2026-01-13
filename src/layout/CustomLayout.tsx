import * as React from "react";
import { Layout, type LayoutProps } from "react-admin";

import { CustomMenu } from "./CustomMenu";
import { CustomSidebar } from "./CustomSidebar";
import { CustomAppBar } from "./CustomAppBar";

export const CustomLayout = (props: LayoutProps) => {
    const appBar = React.useCallback(CustomAppBar, []);
    const menu = React.useCallback(CustomMenu, []);
    const sidebar = React.useCallback(CustomSidebar, []);

    return (
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
    );
};

CustomLayout.displayName = "CustomLayout";
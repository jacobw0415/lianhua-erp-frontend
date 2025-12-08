import * as React from "react";
import { Layout } from "react-admin";
import { CustomMenu } from "./CustomMenu";
import { CustomAppBar } from "./CustomAppBar";
import { CustomSidebar } from "./CustomSidebar";

interface CustomLayoutProps {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CustomLayout = ({
    darkMode,
    setDarkMode,
    ...props
}: CustomLayoutProps & any) => (
    <Layout
        {...props}
        menu={CustomMenu}
        sidebar={CustomSidebar}
        appBar={(appBarProps) => (
            <CustomAppBar
                {...appBarProps}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />
        )}
    />
);

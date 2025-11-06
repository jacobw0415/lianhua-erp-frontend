import * as React from "react";
import { Layout } from "react-admin";
import { CustomMenu } from "./CustomMenu";
import { CustomAppBar } from "./CustomAppBar";

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
        appBar={(appBarProps) => (
            <CustomAppBar
                {...appBarProps}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />
        )}
    />
);

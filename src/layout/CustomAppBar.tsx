import * as React from "react";
import { AppBar, TitlePortal } from "react-admin";
import { IconButton, Tooltip } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

interface CustomAppBarProps {
    darkMode: boolean;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CustomAppBar = ({
    darkMode,
    setDarkMode,
    ...props
}: CustomAppBarProps & any) => (
    <AppBar {...props}>
        <TitlePortal />
        <Tooltip title={darkMode ? "切換為亮色模式" : "切換為暗色模式"}>
            <IconButton
                color="inherit"
                onClick={() => setDarkMode((prev) => !prev)}
                sx={{ ml: "auto", mr: 2 }}
            >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Tooltip>
    </AppBar>
);



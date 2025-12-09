import { AppBar, TitlePortal, useTheme } from "react-admin";
import { useTheme as useMuiTheme } from "@mui/material/styles";
import { IconButton, Tooltip } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "@/contexts/ColorModeContext";

export const CustomAppBar = (props: any) => {
    const muiTheme = useMuiTheme();             //  用於判斷 dark/light
    const [_, setRaTheme] = useTheme();         //  RA4 正確的主題切換方式
    const { setMode } = useColorMode();         //  避免 Sidebar 閃跳

    const isDark = muiTheme.palette.mode === "dark";

    const handleToggle = () => {
        const next = isDark ? "light" : "dark";

        setMode(next);         //  Sidebar / Menu 預先切換 → 不閃跳
        setRaTheme(next);      //  React-Admin 真正切換主題 → 不延遲
    };

    return (
        <AppBar {...props}>
            <TitlePortal />
            <Tooltip title={isDark ? "切換為亮色模式" : "切換為暗色模式"}>
                <IconButton onClick={handleToggle} sx={{ ml: "auto", mr: 2 }}>
                    {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Tooltip>
        </AppBar>
    );
};
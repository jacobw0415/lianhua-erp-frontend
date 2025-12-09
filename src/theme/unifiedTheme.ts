import { defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";
import { LianhuaLightTheme, LianhuaDarkTheme } from "./LianhuaTheme";

export const buildTheme = (mode: "light" | "dark") => {
    return createTheme({
        ...defaultTheme,
        ...(mode === "light" ? LianhuaLightTheme : LianhuaDarkTheme),
    });
};

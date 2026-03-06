import { useState, type PropsWithChildren } from "react";
import { ColorModeContext } from "./ColorModeContext";

const getInitialMode = (): "light" | "dark" => {
    if (typeof localStorage === "undefined") return "light";
    return localStorage.getItem("themeMode") === "dark" ? "dark" : "light";
};

export const ColorModeProvider = ({ children }: PropsWithChildren) => {
    const [mode, setModeState] = useState<"light" | "dark">(getInitialMode);

    const setMode = (m: "light" | "dark") => {
        setModeState(m);
        if (typeof localStorage !== "undefined") localStorage.setItem("themeMode", m);
    };

    return (
        <ColorModeContext.Provider value={{ mode, setMode }}>
            {children}
        </ColorModeContext.Provider>
    );
};

ColorModeProvider.displayName = "ColorModeProvider";

import { useState, type PropsWithChildren } from "react";
import { ColorModeContext } from "./ColorModeContext";

export const ColorModeProvider = ({ children }: PropsWithChildren) => {
    const [mode, setModeState] = useState<"light" | "dark">(
        localStorage.getItem("themeMode") === "dark" ? "dark" : "light"
    );

    const setMode = (m: "light" | "dark") => {
        setModeState(m);
        localStorage.setItem("themeMode", m);
    };

    return (
        <ColorModeContext.Provider value={{ mode, setMode }}>
            {children}
        </ColorModeContext.Provider>
    );
};

ColorModeProvider.displayName = "ColorModeProvider";

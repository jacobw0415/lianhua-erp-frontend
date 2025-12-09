import { createContext, useContext, useState, type PropsWithChildren } from "react";

interface ColorModeContextType {
    mode: "light" | "dark";
    setMode: (m: "light" | "dark") => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
    mode: "light",
    setMode: () => {},
});

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

export const useColorMode = () => useContext(ColorModeContext);
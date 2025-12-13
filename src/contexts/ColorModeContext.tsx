import { createContext } from "react";

export interface ColorModeContextType {
    mode: "light" | "dark";
    setMode: (m: "light" | "dark") => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({
    mode: "light",
    setMode: () => {},
});

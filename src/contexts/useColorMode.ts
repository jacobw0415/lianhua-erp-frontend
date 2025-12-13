import { useContext } from "react";
import { ColorModeContext } from "./ColorModeContext";

export const useColorMode = () => {
    return useContext(ColorModeContext);
};

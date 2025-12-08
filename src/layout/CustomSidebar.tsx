import { Sidebar, type SidebarProps } from "react-admin";
import { styled } from "@mui/material/styles";

const drawerWidth = 240;
const closedWidth = 64;

export const CustomSidebar = styled((props: SidebarProps) => (
    <Sidebar {...props} />
))(() => ({
    "& .RaSidebar-fixed": {
        width: drawerWidth,
        transition: "width 0.2s ease",
        overflowX: "hidden",
    },

    "&.RaSidebar-closed .RaSidebar-fixed": {
        width: closedWidth,
    },
}));

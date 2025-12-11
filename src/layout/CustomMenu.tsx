import * as React from "react";
import {
    Menu,
    MenuItemLink,
    useSidebarState,
} from "react-admin";

import {
    Collapse,
    Tooltip,
    ListItemIcon,
    ListItemText,
    ListItemButton,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";

import { menuGroups } from "./menuConfig";

export const CustomMenu = () => {
    const [open] = useSidebarState();
    const location = useLocation();

    /** ⭐ 控制每組選單的開關 */
    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});

    const toggleGroup = (key: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    /** ⭐ 自動展開當前路徑所在的 menuGroup */
    React.useEffect(() => {
        menuGroups.forEach((group) => {
            const matched = group.items.some((item) => {
                if (item.to === "/") return location.pathname === "/";
                return location.pathname.startsWith(item.to);
            });

            if (matched) {
                setOpenGroups((prev) => ({ ...prev, [group.label]: true }));
            }
        });
    }, [location.pathname]);

    /** ============================================================
     * ⭐ 主體渲染
     * ============================================================ */
    return (
        <Menu
            sx={{
                "& .RaMenuItemLink-root": {
                    borderRadius: 1.2,
                    marginY: 0.3,
                    paddingY: 0.6,
                    transition: "all 0.25s ease",
                    width: "100%",
                },
                "& .RaMenuItemLink-active": {
                    bgcolor: "action.selected",
                    "& svg": { color: "primary.main !important" },
                },
            }}
        >
            {menuGroups.flatMap((group) => {
                const isOpen = openGroups[group.label];

                /** ==============================
                 *  ⭐ GROUP HEADER（含動畫）
                 * ============================== */
                const groupHeader = (
                    <ListItemButton
                        onClick={() => toggleGroup(group.label)}
                        sx={{
                            width: "100%",
                            borderRadius: 1,
                            pl: open ? 2 : 1,
                            pr: open ? 1 : 1,
                            py: 0.8,
                            mt: 0.5,
                            height: 40,
                            bgcolor: isOpen ? "action.selected" : "transparent",
                            transition:
                                "padding 0.25s ease, background-color 0.25s ease, color 0.25s ease",
                            "&:hover": {
                                bgcolor: "action.hover",
                            },
                            "& .MuiListItemText-root": {
                                ml: 1,
                                opacity: open ? 1 : 0,
                                transform: open ? "translateX(0)" : "translateX(-8px)",
                                transition: "opacity 0.25s ease, transform 0.25s ease",
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 32,
                                justifyContent: open ? "flex-start" : "center",
                                transition: "all 0.25s ease",
                                "& svg": {
                                    color: isOpen
                                        ? "primary.main"
                                        : "text.secondary",
                                    transition: "color 0.25s ease",
                                },
                            }}
                        >
                            {group.icon}
                        </ListItemIcon>

                        {open && (
                            <ListItemText
                                primary={group.label}
                                primaryTypographyProps={{
                                    fontSize: 15,
                                    fontWeight: 500,
                                }}
                            />
                        )}

                        {open &&
                            (isOpen ? (
                                <ExpandLess fontSize="small" />
                            ) : (
                                <ExpandMore fontSize="small" />
                            ))}
                    </ListItemButton>
                );

                /** ⭐ 回傳 array（避免 Fragment） */
                return [
                    /** -------------------------
                     *     GROUP HEADER 區塊
                     * ------------------------- */
                    open ? (
                        groupHeader
                    ) : (
                        <Tooltip
                            key={`${group.label}-tooltip`}
                            title={group.label}
                            placement="right"
                        >
                            {groupHeader}
                        </Tooltip>
                    ),

                    /** -------------------------
                     *     子選單區塊
                     * ------------------------- */
                    <Collapse
                        key={`${group.label}-collapse`}
                        in={isOpen}
                        timeout={250}
                        unmountOnExit
                    >
                        {group.items.map((item) => (
                            <MenuItemLink
                                key={item.to}
                                to={item.to}
                                primaryText={item.label}
                                leftIcon={item.icon}
                                sx={{
                                    width: "100%",
                                    pl: open ? 6 : 1.5,
                                    pr: open ? 2 : 1.5,
                                    py: 0.6,
                                    minHeight: 38,
                                    borderRadius: 1,
                                    transition:
                                        "padding 0.25s ease, background-color 0.25s ease",

                                    "& .RaMenuItemLink-primaryText": {
                                        opacity: open ? 1 : 0,
                                        transform: open
                                            ? "translateX(0)"
                                            : "translateX(-8px)",
                                        transition:
                                            "opacity 0.25s ease, transform 0.25s ease",
                                        whiteSpace: "nowrap",
                                    },

                                    "& .MuiListItemIcon-root": {
                                        minWidth: open ? 36 : 32,
                                        justifyContent: open
                                            ? "flex-start"
                                            : "center",
                                        transition: "all 0.25s ease",
                                    },

                                    "&.RaMenuItemLink-active": {
                                        bgcolor: "action.selected",
                                        "& svg": {
                                            color: "primary.main !important",
                                        },
                                    },
                                }}
                            />
                        ))}
                    </Collapse>,
                ];
            })}
        </Menu>
    );
};

export default CustomMenu;
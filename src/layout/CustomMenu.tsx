import * as React from "react";
import {
    Menu,
    MenuItemLink,
    useSidebarState,
    usePermissions,
} from "react-admin";

import {
    Collapse,
    Tooltip,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Box,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useLocation } from "react-router-dom";

import { menuGroups, type MenuItem } from "./menuConfig";
import { useAuthAuthority } from "@/hooks/useAuthAuthority";
import { useTranslation } from "react-i18next";

/** 與 hasRoleSuperAdmin 一致，避免 JWT 角色字串格式差異導致選單誤隱藏 */
function isSuperAdminMenuRole(roles: string[]): boolean {
    return roles.some((x) => {
        const code = String(x).trim().toUpperCase();
        return code === "ROLE_SUPER_ADMIN" || code === "SUPER_ADMIN" || code.endsWith("SUPER_ADMIN");
    });
}

/** RBAC：依 getPermissions() 與 requiredAuthorities 過濾選單項目 */
function filterItemsByRole(
    items: MenuItem[],
    permissions: string | string[] | undefined,
    hasAnyAuthority: (authorities: string[]) => boolean,
): MenuItem[] {
    if (!permissions) return items;

    const roles = Array.isArray(permissions) ? permissions : [permissions];
    return items.filter((item) => {
        if (!item.requiredRole && !(item.requiredAuthorities?.length)) return true;
        if (item.requiredRole === "ROLE_SUPER_ADMIN") {
            return isSuperAdminMenuRole(roles);
        }
        // ROLE_SUPER_ADMIN 視同具備 ROLE_ADMIN，可看到所有管理員選單
        if (item.requiredRole) {
            if (roles.includes(item.requiredRole)) return true;
            if (item.requiredRole === "ROLE_ADMIN" && roles.includes("ROLE_SUPER_ADMIN")) return true;
        }
        if (item.requiredAuthorities?.length && hasAnyAuthority(item.requiredAuthorities)) return true;
        return false;
    });
}

const CustomMenuInner = () => {
    const [open] = useSidebarState();
    const location = useLocation();
    const { permissions } = usePermissions();
    const { hasAnyAuthority } = useAuthAuthority();
    const { t } = useTranslation("common");

    /**  控制每組選單的開關 */
    const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(
        {}
    );

    const toggleGroup = (key: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    /**  自動展開當前路徑所在的 menuGroup */
    React.useEffect(() => {
        menuGroups.forEach((group) => {
            const matched = group.items.some((item) => {
                if (item.to === "/") return location.pathname === "/";
                return location.pathname.startsWith(item.to);
            });

            if (matched) {
                setOpenGroups((prev) => ({
                    ...prev,
                    [group.id]: true,
                }));
            }
        });
    }, [location.pathname]);

    /** ============================================================
     *  主體渲染
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
                const isOpen = openGroups[group.id];

                /** ==============================
                 *   GROUP HEADER（含動畫）
                 * ============================== */
                const groupHeader = (
                    <ListItemButton
                        onClick={() => toggleGroup(group.id)}
                        sx={{
                            width: "100%",
                            borderRadius: 1,
                            pl: open ? 2 : 1,
                            pr: 1,
                            py: 0.8,
                            mt: 0.5,
                            height: 40,
                            bgcolor: isOpen
                                ? "action.selected"
                                : "transparent",
                            transition:
                                "padding 0.25s ease, background-color 0.25s ease, color 0.25s ease",
                            "&:hover": {
                                bgcolor: "action.hover",
                            },
                            "& .MuiListItemText-root": {
                                ml: 1,
                                opacity: open ? 1 : 0,
                                transform: open
                                    ? "translateX(0)"
                                    : "translateX(-8px)",
                                transition:
                                    "opacity 0.25s ease, transform 0.25s ease",
                            },
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 32,
                                justifyContent: open
                                    ? "flex-start"
                                    : "center",
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
                                primary={t(group.labelKey)}
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

                /** ====================================================
                 *  GROUP ITEMS
                 * Menu 的 direct child 永遠只會是 Box
                 * ==================================================== */
                return [
                    /** -------------------------
                     *     GROUP HEADER
                     * ------------------------- */
                    <Box
                        key={`${group.id}-header`}
                        sx={{ width: "100%" }}
                    >
                        {open ? (
                            groupHeader
                        ) : (
                            <Tooltip
                                title={t(group.labelKey)}
                                placement="right"
                            >
                                {groupHeader}
                            </Tooltip>
                        )}
                    </Box>,

                    /** -------------------------
                     *     子選單區塊
                     * ------------------------- */
                    <Collapse
                        key={`${group.id}-collapse`}
                        in={isOpen}
                        timeout={250}
                        unmountOnExit
                    >
                        {filterItemsByRole(group.items, permissions, hasAnyAuthority).map((item) => (
                            <MenuItemLink
                                key={item.to}
                                to={item.to}
                                leftIcon={item.icon}
                                /** 勿傳字串 primaryText：react-admin 會用 polyglot 再 translate 一次，menu.* 不在 ra 字串內會顯示 raw key */
                                // MUI v7 的 TooltipProps 型別要求 children，但 MenuItemLink 內部會實際包 Tooltip trigger，
                                // 因此這裡提供 children: null 只為滿足型別檢查。
                                tooltipProps={{ title: t(item.labelKey), children: null as any }}
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
                                            color:
                                                "primary.main !important",
                                        },
                                    },
                                }}
                            >
                                {t(item.labelKey)}
                            </MenuItemLink>
                        ))}
                    </Collapse>,
                ];
            })}
        </Menu>
    );
};

export const CustomMenu = React.memo(CustomMenuInner);

export default CustomMenu;